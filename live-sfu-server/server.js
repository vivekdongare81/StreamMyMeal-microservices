const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mediasoup = require('mediasoup');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config({ path: '../setup-local/.env' });
const announcedIp = process.env.SFU_ANNOUNCED_IP;
const cors = require('cors');

const app = express();
app.use(cors({ origin: 'http://localhost:8080' }));
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

const PORT = 4000;

// Mediasoup setup
let worker;
const rooms = {}; // { [roomId]: { router, peers: { [peerId]: { transports, producers, consumers, socket } } } }

(async () => {
  worker = await mediasoup.createWorker();
  console.log('Mediasoup worker created');
})();

function logAllLiveBroadcasts() {
  const liveBroadcasts = Object.entries(rooms)
    .filter(([roomId, room]) =>
      room.peers && Object.values(room.peers).some(peer => peer.role === 'broadcaster')
    )
    .map(([roomId]) => roomId);
  console.log(`[SFU] Currently live broadcasts:`, liveBroadcasts);
  console.log(`[SFU] Total live rooms: ${liveBroadcasts.length}`);
}


function getLiveViewerCount(room) {
  if (!room || !room.peers) return 0;
  // Count all peers except the broadcaster
  const totalPeers = Object.keys(room.peers).length;
  const broadcasterCount = Object.values(room.peers).filter(peer => peer.role === 'broadcaster').length;
  return Math.max(0, totalPeers - broadcasterCount);
}

function doesRoomExist(roomId) {
  return !!rooms[roomId];
}

// app.get('/api/broadcast/:broadcastId/exists', (req, res) => {
//   const { broadcastId } = req.params;
//   const exists = doesRoomExist(broadcastId);
//   res.json({ exists });
// });

// app.get('/api/broadcast/:broadcastId/viewers', (req, res) => {
//   const { broadcastId } = req.params;
//   const room = rooms[broadcastId];
//   const viewerCount = getLiveViewerCount(room);
//   res.json({ viewers: viewerCount });
// });

io.on('connection', socket => {
  let currentRoomId = null;
  let peerId = uuidv4();
  let room = null;

  // WebSocket: Check if a broadcast exists
  socket.on('check-broadcast-exists', (broadcastId, cb) => {
    const exists = doesRoomExist(broadcastId);
    console.log(`[SFU] check-broadcast-exists called for broadcastId: ${broadcastId}, exists: ${exists}`);
    cb(exists);
  });

  // WebSocket: Get viewer count for a broadcast
  socket.on('get-viewer-count', (broadcastId, cb) => {
    const room = rooms[broadcastId];
    const viewerCount = getLiveViewerCount(room);
    console.log(`[SFU] get-viewer-count for broadcastId: ${broadcastId}, viewers: ${viewerCount}`);
    cb(viewerCount);
  });

  socket.on('join-room', async ({ roomId, role }, cb) => {
    currentRoomId = roomId;
    if (!rooms[roomId]) {
      // Create a new router for this room
      const router = await worker.createRouter({
        mediaCodecs: [
          {
            kind: 'audio',
            mimeType: 'audio/opus',
            clockRate: 48000,
            channels: 2
          },
          {
            kind: 'video',
            mimeType: 'video/VP8',
            clockRate: 90000,
            parameters: {}
          }
        ]
      });
      rooms[roomId] = { router, peers: {} };
      console.log(`[SFU] Created new room: ${roomId}`);
    }
    room = rooms[roomId];

    // ENFORCE ONE BROADCASTER PER ROOM
    if (role === 'broadcaster') {
      const hasBroadcaster = Object.values(room.peers).some(peer => peer.role === 'broadcaster');
      if (hasBroadcaster) {
        socket.emit('error', 'A broadcaster is already live for this Restaurant.');
        return;
      }
    }

    room.peers[peerId] = { transports: [], producers: [], consumers: [], socket, role };
    socket.emit('peer-id', peerId);
    console.log(`[SFU] Peer ${peerId} joined room ${roomId}`);
    console.log(`[SFU] Role ${role}`);

    if (role === 'broadcaster') {
      logAllLiveBroadcasts();
    }
    // Inform the new peer about all existing producers in this room
    for (const [otherPeerId, otherPeer] of Object.entries(room.peers)) {
      if (otherPeerId !== peerId) {
        for (const producer of otherPeer.producers) {
          socket.emit('new-producer', { producerId: producer.id, kind: producer.kind });
        }
      }
    }
    // Notify all broadcasters in the room that a new viewer joined
    if (role === 'viewer') {
      for (const [otherPeerId, otherPeer] of Object.entries(room.peers)) {
        if (otherPeer.role === 'broadcaster') {
          otherPeer.socket.emit('new-viewer', { viewerId: peerId });
        }
      }
    }
    if (cb) cb();
  });

  socket.on('get-rtp-capabilities', (_, cb) => {
    if (!room) return cb({ error: 'Not in a room' });
    cb(room.router.rtpCapabilities);
  });

  socket.on('create-transport', async (_, cb) => {
    if (!room) return cb({ error: 'Not in a room' });
    const listenIps = announcedIp
      ? [{ ip: '0.0.0.0', announcedIp }]
      : [{ ip: '0.0.0.0' }];
    const transport = await room.router.createWebRtcTransport({
      listenIps,
      enableUdp: true,
      enableTcp: true,
      preferUdp: true,
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'turn:openrelay.metered.ca:80', username: 'openrelayproject', credential: 'openrelayproject' }
      ]
    });
    room.peers[peerId].transports.push(transport);
    transport.on('icestatechange', state => {
      console.log(`[SFU] Transport ${transport.id} ICE state changed: ${state}`);
    });
    transport.on('dtlsstatechange', state => {
      console.log(`[SFU] Transport ${transport.id} DTLS state changed: ${state}`);
    });
    transport.on('trace', trace => {
      console.log(`[SFU] Transport ${transport.id} trace event:`, trace);
    });
    cb({
      id: transport.id,
      iceParameters: transport.iceParameters,
      iceCandidates: transport.iceCandidates,
      dtlsParameters: transport.dtlsParameters
    });
  });

  socket.on('connect-transport', async ({ transportId, dtlsParameters }, cb) => {
    if (!room) return cb({ error: 'Not in a room' });
    const transport = room.peers[peerId].transports.find(t => t.id === transportId);
    await transport.connect({ dtlsParameters });
    cb();
  });

  socket.on('produce', async ({ transportId, kind, rtpParameters }, cb) => {
    if (!room) return cb({ error: 'Not in a room' });
    const transport = room.peers[peerId].transports.find(t => t.id === transportId);
    const producer = await transport.produce({ kind, rtpParameters });
    room.peers[peerId].producers.push(producer);
    logAllLiveBroadcasts();
    cb({ id: producer.id });
    // Inform all other peers in the room about new producer
    for (const [otherPeerId, otherPeer] of Object.entries(room.peers)) {
      if (otherPeerId !== peerId) {
        otherPeer.socket.emit('new-producer', { producerId: producer.id, kind });
      }
    }
    producer.on('trace', trace => {
      if (trace.type === 'rtp') {
        console.log(`[SFU] RTP packet for producer ${producer.id} (kind: ${producer.kind})`);
      }
    });
  });

  socket.on('consume', async ({ transportId, producerId, rtpCapabilities }, cb) => {
    try {
      if (!room) return cb({ error: 'Not in a room' });
      if (!room.router.canConsume({ producerId, rtpCapabilities })) {
        return cb({ error: 'Cannot consume' });
      }
      const transport = room.peers[peerId].transports.find(t => t.id === transportId);
      if (!transport) {
        console.error(`[SFU] No transport found for peer ${peerId} with transportId ${transportId}`);
        return cb({ error: 'No transport found for consuming' });
      }
      let consumer;
      try {
        consumer = await transport.consume({
          producerId,
          rtpCapabilities,
          paused: false
        });
      } catch (err) {
        console.error(`[SFU] Error consuming for peer ${peerId}:`, err);
        return cb({ error: 'Failed to consume: ' + (err && err.message ? err.message : err) });
      }
      if (!consumer) {
        return cb({ error: 'Consumer could not be created' });
      }
      room.peers[peerId].consumers.push(consumer);
      cb({
        id: consumer.id,
        producerId,
        kind: consumer.kind,
        rtpParameters: consumer.rtpParameters
      });
      // Find the producer's peer and notify them
      for (const [otherPeerId, otherPeer] of Object.entries(room.peers)) {
        if (otherPeer.producers.some(p => p.id === producerId)) {
          otherPeer.socket.emit('new-consumer', { consumerId: consumer.id, peerId });
        }
      }
      consumer.on('trace', trace => {
        if (trace.type === 'rtp') {
          console.log(`[SFU] RTP packet for consumer ${consumer.id} (kind: ${consumer.kind})`);
        }
      });
    } catch (err) {
      console.error(`[SFU] Unexpected error in consume handler for peer ${peerId}:`, err);
      if (cb) cb({ error: 'Internal server error in consume handler' });
    }
  });

  socket.on('resume-consumer', async ({ consumerId }) => {
    if (!room) return;
    const consumer = room.peers[peerId].consumers.find(c => c.id === consumerId);
    if (consumer) {
      await consumer.resume();
      console.log(`[SFU] Consumer ${consumerId} resumed for peer ${peerId}`);
    }
  });

  socket.on('disconnect', () => {
    if (room && room.peers[peerId]) {
      const isBroadcaster = room.peers[peerId].role === 'broadcaster';

      // Remove the disconnecting peer
      room.peers[peerId].producers.forEach(p => p.close());
      room.peers[peerId].consumers.forEach(c => c.close());
      room.peers[peerId].transports.forEach(t => t.close());
      delete room.peers[peerId];

      if (isBroadcaster) {
        // If broadcaster left, close all remaining peers and delete the room
        for (const otherPeerId in room.peers) {
          room.peers[otherPeerId].producers.forEach(p => p.close());
          room.peers[otherPeerId].consumers.forEach(c => c.close());
          room.peers[otherPeerId].transports.forEach(t => t.close());
          // Optionally, notify viewers that the broadcast ended
          room.peers[otherPeerId].socket.emit('error', 'Broadcast has ended.');
          delete room.peers[otherPeerId];
        }
        delete rooms[currentRoomId];
        console.log(`[SFU] Deleted room because broadcaster left: ${currentRoomId}`);
      } else {
        // If only a viewer left, keep the room if broadcaster is still present
      if (Object.keys(room.peers).length === 0) {
        delete rooms[currentRoomId];
        console.log(`[SFU] Deleted empty room: ${currentRoomId}`);
        }
      }
      console.log(`[SFU] Peer disconnected: ${peerId} from room ${currentRoomId}`);
      logAllLiveBroadcasts();
    }
  });
});

server.listen(PORT, () => {
  console.log(`Mediasoup SFU server running on port ${PORT}`);
}); 