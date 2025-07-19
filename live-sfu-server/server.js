const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mediasoup = require('mediasoup');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config({ path: '../setup-local/.env' });
const announcedIp = process.env.SFU_ANNOUNCED_IP;

const app = express();
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

io.on('connection', socket => {
  let currentRoomId = null;
  let peerId = uuidv4();
  let room = null;

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
    room.peers[peerId] = { transports: [], producers: [], consumers: [], socket, role };
    socket.emit('peer-id', peerId);
    console.log(`[SFU] Peer ${peerId} joined room ${roomId}`);
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
    if (!room) return cb({ error: 'Not in a room' });
    if (!room.router.canConsume({ producerId, rtpCapabilities })) {
      return cb({ error: 'Cannot consume' });
    }
    const transport = room.peers[peerId].transports.find(t => t.id === transportId);
    const consumer = await transport.consume({
      producerId,
      rtpCapabilities,
      paused: false
    });
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
      room.peers[peerId].producers.forEach(p => p.close());
      room.peers[peerId].consumers.forEach(c => c.close());
      room.peers[peerId].transports.forEach(t => t.close());
      delete room.peers[peerId];
      // If room is empty, delete it
      if (Object.keys(room.peers).length === 0) {
        delete rooms[currentRoomId];
        console.log(`[SFU] Deleted empty room: ${currentRoomId}`);
      }
      console.log(`[SFU] Peer disconnected: ${peerId} from room ${currentRoomId}`);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Mediasoup SFU server running on port ${PORT}`);
}); 