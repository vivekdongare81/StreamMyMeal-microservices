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
let router;
const peers = {}; // peerId -> { transports, producers, consumers }

(async () => {
  worker = await mediasoup.createWorker();
  router = await worker.createRouter({
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
  console.log('Mediasoup worker and router created');
})();

io.on('connection', socket => {
  const peerId = uuidv4();
  peers[peerId] = { transports: [], producers: [], consumers: [] };
  socket.emit('peer-id', peerId);
  console.log(`[SFU] New peer connected: ${peerId}`);

  // Inform the new peer about all existing producers
  for (const [otherPeerId, otherPeer] of Object.entries(peers)) {
    if (otherPeerId !== peerId) {
      for (const producer of otherPeer.producers) {
        socket.emit('new-producer', { producerId: producer.id, kind: producer.kind });
      }
    }
  }

  socket.on('get-rtp-capabilities', (_, cb) => {
    cb(router.rtpCapabilities);
  });

  socket.on('create-transport', async (_, cb) => {
    console.log(`[SFU] Creating WebRTC transport for peer ${peerId}`);
    const listenIps = announcedIp
      ? [{ ip: '0.0.0.0', announcedIp }]
      : [{ ip: '0.0.0.0' }];
    const transport = await router.createWebRtcTransport({
      listenIps,
      enableUdp: true,
      enableTcp: true,
      preferUdp: true,
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'turn:openrelay.metered.ca:80', username: 'openrelayproject', credential: 'openrelayproject' }
      ]
    });
    peers[peerId].transports.push(transport);
    console.log(`[SFU] Transport created: ${transport.id} for peer ${peerId}`);
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
    console.log(`[SFU] ICE Candidates for transport ${transport.id}:`, transport.iceCandidates);
    console.log(`[SFU] ICE Parameters for transport ${transport.id}:`, transport.iceParameters);
    console.log(`[SFU] DTLS Parameters for transport ${transport.id}:`, transport.dtlsParameters);
  });

  socket.on('connect-transport', async ({ transportId, dtlsParameters }, cb) => {
    const transport = peers[peerId].transports.find(t => t.id === transportId);
    console.log(`[SFU] Connecting transport ${transportId} for peer ${peerId} with DTLS params:`, dtlsParameters);
    await transport.connect({ dtlsParameters });
    cb();
  });

  socket.on('produce', async ({ transportId, kind, rtpParameters }, cb) => {
    const transport = peers[peerId].transports.find(t => t.id === transportId);
    const producer = await transport.produce({ kind, rtpParameters });
    peers[peerId].producers.push(producer);
    cb({ id: producer.id });
    // Inform all other peers about new producer
    socket.broadcast.emit('new-producer', { producerId: producer.id, kind });
    console.log(`[SFU] New producer from ${peerId}: ${producer.id} (${kind})`);
    // RTP trace logging for producer
    producer.on('trace', trace => {
      if (trace.type === 'rtp') {
        console.log(`[SFU] RTP packet for producer ${producer.id} (kind: ${producer.kind})`);
      }
    });
  });

  socket.on('consume', async ({ transportId, producerId, rtpCapabilities }, cb) => {
    if (!router.canConsume({ producerId, rtpCapabilities })) {
      return cb({ error: 'Cannot consume' });
    }
    const transport = peers[peerId].transports.find(t => t.id === transportId);
    const consumer = await transport.consume({
      producerId,
      rtpCapabilities,
      paused: false
    });
    peers[peerId].consumers.push(consumer);
    cb({
      id: consumer.id,
      producerId,
      kind: consumer.kind,
      rtpParameters: consumer.rtpParameters
    });
    console.log(`[SFU] New consumer for peer ${peerId}: consuming producer ${producerId}`);
    // RTP trace logging for consumer
    consumer.on('trace', trace => {
      if (trace.type === 'rtp') {
        console.log(`[SFU] RTP packet for consumer ${consumer.id} (kind: ${consumer.kind})`);
      }
    });
    // Find the producer's peer and notify them
    for (const [otherPeerId, otherPeer] of Object.entries(peers)) {
      if (otherPeer.producers.some(p => p.id === producerId)) {
        io.to(otherPeerId).emit('new-consumer', { consumerId: consumer.id, peerId });
      }
    }
  });

  socket.on('resume-consumer', async ({ consumerId }) => {
    const consumer = peers[peerId].consumers.find(c => c.id === consumerId);
    if (consumer) {
      await consumer.resume();
      console.log(`[SFU] Consumer ${consumerId} resumed for peer ${peerId}`);
    }
  });

  socket.on('disconnect', () => {
    // Cleanup
    peers[peerId].producers.forEach(p => p.close());
    peers[peerId].consumers.forEach(c => c.close());
    peers[peerId].transports.forEach(t => t.close());
    delete peers[peerId];
    console.log(`[SFU] Peer disconnected: ${peerId}`);
  });
});

server.listen(PORT, () => {
  console.log(`Mediasoup SFU server running on port ${PORT}`);
}); 