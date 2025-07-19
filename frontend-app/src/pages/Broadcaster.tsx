import React, { useRef, useEffect, useState } from 'react';
import io from 'socket.io-client';
import * as mediasoupClient from 'mediasoup-client';

const SFU_URL = 'http://localhost:4000';

export default function Broadcaster() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let socket: ReturnType<typeof io>;
    let device: mediasoupClient.types.Device;
    let sendTransport: mediasoupClient.types.Transport;
    let localStream: MediaStream;

    async function start() {
      try {
        setStatus('Connecting to SFU...');
        setError(null);
        console.log('[Broadcaster] Connecting to SFU...');
        socket = io(SFU_URL);

        socket.on('connect', async () => {
          try {
            setStatus('Connected to SFU.');
            console.log('[Broadcaster] Connected to SFU.');
            // 1. Get RTP Capabilities
            socket.emit('get-rtp-capabilities', null, async (rtpCapabilities: any) => {
              try {
                device = new mediasoupClient.Device();
                await device.load({ routerRtpCapabilities: rtpCapabilities });

                // 2. Get user media
                localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                console.log('[Broadcaster] Got user media:', localStream);
                const videoTrack = localStream.getVideoTracks()[0];
                if (videoTrack) {
                  console.log('[Broadcaster] Video track settings:', videoTrack.getSettings());
                  videoTrack.onended = () => console.log('[Broadcaster] Video track ended');
                  videoTrack.onmute = () => console.log('[Broadcaster] Video track muted');
                  videoTrack.onunmute = () => console.log('[Broadcaster] Video track unmuted');
                }
                if (videoRef.current) videoRef.current.srcObject = localStream;
                console.log('[Broadcaster] Got user media, creating send transport...');

                // 3. Create send transport
                socket.emit('create-transport', null, async (params: any) => {
                  try {
                    sendTransport = device.createSendTransport(params);

                    sendTransport.on('connect', ({ dtlsParameters }, callback, errback) => {
                      try {
                        console.log('[Broadcaster] Connecting send transport...');
                        socket.emit('connect-transport', { transportId: sendTransport.id, dtlsParameters }, callback);
                      } catch (err) {
                        setError('Send transport connect error: ' + err);
                        errback(err);
                      }
                    });

                    sendTransport.on('produce', ({ kind, rtpParameters }, callback, errback) => {
                      try {
                        console.log(`[Broadcaster] Producing ${kind}...`);
                        socket.emit('produce', { transportId: sendTransport.id, kind, rtpParameters }, ({ id }: any) => callback({ id }));
                      } catch (err) {
                        setError('Produce error: ' + err);
                        errback(err);
                      }
                    });

                    // 4. Produce video and audio
                    for (const track of localStream.getTracks()) {
                      try {
                        const producer = await sendTransport.produce({ track });
                        console.log(`[Broadcaster] Track produced: ${track.kind}, id: ${track.id}, producer id: ${producer.id}`);

                      } catch (err) {
                        setError('Track produce error: ' + err);
                      }
                    }
                    setStatus('Broadcasting live!');
                    console.log('[Broadcaster] Broadcasting live!');
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

        // Listen for new consumers (viewers)
        socket.on('new-consumer', (data) => {
          console.log(`[Broadcaster] New viewer joined: consumer ${data.consumerId} for peer ${data.peerId}`);
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
  }, []);

  return (
    <div>
      <video ref={videoRef} autoPlay muted style={{ width: 400 }} />
      <div style={{ marginTop: 10 }}>{status}</div>
      {error && <div style={{ color: 'red', marginTop: 10 }}>Error: {error}</div>}
    </div>
  );
} 