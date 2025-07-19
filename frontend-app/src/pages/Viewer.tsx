import React, { useRef, useEffect, useState } from 'react';
import io from 'socket.io-client';
import * as mediasoupClient from 'mediasoup-client';

const SFU_URL = 'http://localhost:4000';

export default function Viewer() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState('');

  useEffect(() => {
    let socket: ReturnType<typeof io>;
    let device: mediasoupClient.types.Device;
    let recvTransport: mediasoupClient.types.Transport;
    let consumerVideo: mediasoupClient.types.Consumer;
    let localStream: MediaStream;
    let lastProducerId: string | null = null;

    async function start() {
      setStatus('Connecting to SFU...');
      console.log('Connecting to SFU...');
      socket = io(SFU_URL);

      socket.on('connect', async () => {
        setStatus('Connected to SFU.');
        console.log('Connected to SFU.');
        // 1. Get RTP Capabilities
        socket.emit('get-rtp-capabilities', null, async (rtpCapabilities: any) => {
          console.log('Received RTP Capabilities:', rtpCapabilities);
          device = new mediasoupClient.Device();
          await device.load({ routerRtpCapabilities: rtpCapabilities });

          // 2. Create receive transport
          socket.emit('create-transport', null, async (params: any) => {
            console.log('Receive transport params:', params);
            recvTransport = device.createRecvTransport(params);

            recvTransport.on('connect', ({ dtlsParameters }, callback, errback) => {
              console.log('Connecting receive transport...');
              socket.emit('connect-transport', { transportId: recvTransport.id, dtlsParameters }, callback);
            });

            recvTransport.on('connectionstatechange', (state) => {
              console.log('Recv transport connection state:', state);
            });

            // 3. Wait for a producer to be available
            socket.on('new-producer', async ({ producerId, kind }) => {
              console.log('New producer:', producerId, kind);
              if (kind === 'video' && producerId !== lastProducerId) {
                lastProducerId = producerId;
                // 4. Consume video
                socket.emit('consume', { transportId: recvTransport.id, producerId, rtpCapabilities: device.rtpCapabilities }, async (data: any) => {
                  if (data.error) {
                    setStatus('Cannot consume video');
                    console.error('Cannot consume video:', data.error);
                    return;
                  }
                  console.log('Consume response:', data);
                  consumerVideo = await recvTransport.consume({
                    id: data.id,
                    producerId: data.producerId,
                    kind: data.kind,
                    rtpParameters: data.rtpParameters
                  });
                  // Resume the consumer so media starts flowing
                  socket.emit('resume-consumer', { consumerId: consumerVideo.id });
                  localStream = new MediaStream([consumerVideo.track]);
                  if (videoRef.current) {
                    videoRef.current.srcObject = localStream;
                    videoRef.current.muted = true;
                    // Add all possible event listeners for debugging
                    videoRef.current.onplay = () => console.log('Video element: play event');
                    videoRef.current.onpause = () => console.log('Video element: pause event');
                    videoRef.current.onerror = (e) => console.error('Video element: error event', e);
                    videoRef.current.onwaiting = () => console.log('Video element: waiting event');
                    videoRef.current.onstalled = () => console.log('Video element: stalled event');
                    videoRef.current.oncanplay = () => console.log('Video element: canplay event');
                    videoRef.current.oncanplaythrough = () => console.log('Video element: canplaythrough event');
                    videoRef.current.onloadedmetadata = () => console.log('Video element: loadedmetadata event');
                    videoRef.current.onloadeddata = () => console.log('Video element: loadeddata event');
                    setTimeout(() => {
                      if (videoRef.current) {
                        videoRef.current.play().then(() => {
                          console.log('Video play() called successfully');
                        }).catch(e => {
                          console.error('Play error:', e);
                        });
                        console.log('Video element srcObject set:', localStream);
                        console.log('Video tracks:', localStream.getVideoTracks());
                        // Log frame count and readyState after 2 seconds
                        setTimeout(() => {
                          const v = videoRef.current;
                          if (v) {
                            const quality = v.getVideoPlaybackQuality?.();
                            console.log('VideoPlaybackQuality:', quality);
                            console.log('Decoded frames:', (v as any).webkitDecodedFrameCount || (v as any).mozPaintedFrames || 'N/A');
                            console.log('Ready state:', v.readyState);
                          }
                        }, 2000);
                      }
                    }, 500); // Wait 500ms before calling play
                  }
                  setStatus('Watching live!');
                  console.log('Video stream set on video element.');
                });
              }
            });

            // If no producer is available yet, log and wait
            socket.on('disconnect', () => {
              setStatus('Disconnected from SFU');
              console.log('Disconnected from SFU');
            });
          });
        });
      });

      socket.on('connect_error', (err) => {
        setStatus('Failed to connect to SFU');
        console.error('Socket.io connect error:', err);
      });
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
      <video ref={videoRef} autoPlay controls muted style={{ width: 400, height: 300, background: 'black' }} />
      <button onClick={() => videoRef.current && videoRef.current.play()}>Play Video</button>
      <div style={{ marginTop: 10 }}>{status}</div>
    </div>
  );
} 