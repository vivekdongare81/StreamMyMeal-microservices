import React, { useRef, useEffect, useState } from 'react';
import io from 'socket.io-client';
import * as mediasoupClient from 'mediasoup-client';
import { useLocation, useNavigate } from 'react-router-dom';

const SFU_URL = 'http://localhost:4000';

export default function Broadcaster() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState('');
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Helper to get broadcastId from query string
  function getBroadcastId() {
    const params = new URLSearchParams(location.search);
    return params.get('broadcastId');
  }

  const broadcastId = getBroadcastId();
  if (!broadcastId) {
    return (
      <div style={{ maxWidth: 400, margin: '40px auto', padding: 24, border: '1px solid #eee', borderRadius: 8, color: 'red', textAlign: 'center' }}>
        <h2>Not Allowed</h2>
        <p>A <b>broadcastId</b> is required to start a broadcast.<br/>Please use a valid link with <code>?broadcastId=YOUR_ID</code> in the URL.</p>
      </div>
    );
  }

  // Only run the effect if broadcastId is present
  useEffect(() => {
    let socket;
    let device;
    let sendTransport;
    let localStream;
    if (!broadcastId) return;
    async function start() {
      try {
        setStatus('Connecting to SFU...');
        setError(null);
        socket = io(SFU_URL);
        socket.on('connect', async () => {
          // Join the broadcast first
          socket.emit('join-room', { roomId: broadcastId, role: 'broadcaster' }, async () => {
            try {
              setStatus('Connected to SFU.');
              // 1. Get RTP Capabilities
              socket.emit('get-rtp-capabilities', null, async (rtpCapabilities) => {
                try {
                  device = new mediasoupClient.Device();
                  await device.load({ routerRtpCapabilities: rtpCapabilities });
                  // 2. Get user media
                  localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                  if (videoRef.current) videoRef.current.srcObject = localStream;
                  // 3. Create send transport
                  socket.emit('create-transport', null, async (params) => {
                    try {
                      sendTransport = device.createSendTransport(params);
                      sendTransport.on('connect', ({ dtlsParameters }, callback, errback) => {
                        try {
                          socket.emit('connect-transport', { transportId: sendTransport.id, dtlsParameters }, callback);
                        } catch (err) {
                          setError('Send transport connect error: ' + err);
                          errback(err);
                        }
                      });
                      sendTransport.on('produce', ({ kind, rtpParameters }, callback, errback) => {
                        try {
                          socket.emit('produce', { transportId: sendTransport.id, kind, rtpParameters }, ({ id }) => callback({ id }));
                        } catch (err) {
                          setError('Produce error: ' + err);
                          errback(err);
                        }
                      });
                      for (const track of localStream.getTracks()) {
                        try {
                          await sendTransport.produce({ track });
                        } catch (err) {
                          setError('Track produce error: ' + err);
                        }
                      }
                      setStatus(' Broadcasting live! view stream on live cooking page.');
                    } catch (err) {
                      setError('Create send transport error: ' + err);
                    }
                  });
                } catch (err) {
                  setError('Device or user media error: ' + err);
                }
              });
            } catch (err) {
              setError('RTP Capabilities error: ' + err);
            }
          });
        });
        socket.on('new-consumer', (data) => {
          console.log(`[Broadcaster] New viewer joined: consumer ${data.consumerId} for peer ${data.peerId}`);
        });
        // Listen for new-viewer event (viewer joined the room)
        socket.on('new-viewer', (data) => {
          console.log(`[Broadcaster] New viewer joined the room: ${data.viewerId}`);
        });
        socket.on('connect_error', (err) => {
          setError('Socket.io connect error: ' + err);
        });
      } catch (err) {
        setError('SFU connection error: ' + err);
      }
    }
    start();
    return () => {
      setStatus('');
      if (socket) socket.disconnect();
      if (localStream) localStream.getTracks().forEach(t => t.stop());
    };
  }, [location]);

  return (
    <div>
      <video ref={videoRef} autoPlay muted style={{ width: 400 }} />
      <div style={{ marginTop: 10 }}>{status}</div>
      {error && <div style={{ color: 'red', marginTop: 10 }}>Error: {error}</div>}
    </div>
  );
} 