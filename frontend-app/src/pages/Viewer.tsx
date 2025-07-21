import React, { useRef, useEffect, useState } from 'react';
import io from 'socket.io-client';
import * as mediasoupClient from 'mediasoup-client';
import { useLocation } from 'react-router-dom';

const SFU_URL = 'http://localhost:4000';

export default function Viewer() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState('');
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();

  // Helper to get broadcastId from query string
  function getBroadcastId() {
    const params = new URLSearchParams(location.search);
    return params.get('broadcastId');
  }

  const broadcastId = getBroadcastId();
  if (!broadcastId) {
    setError('A broadcastId is required to view a broadcast. Please use a valid link with ?broadcastId=YOUR_ID in the URL.');
    return (
      <div style={{ maxWidth: 400, margin: '40px auto', padding: 24, border: '1px solid #eee', borderRadius: 8, color: 'red', textAlign: 'center' }}>
        <h2>Not Allowed</h2>
        <p>A <b>broadcastId</b> is required to view a broadcast.<br/>Please use a valid link with <code>?broadcastId=YOUR_ID</code> in the URL.</p>
      </div>
    );
  }

  useEffect(() => {
    let socket;
    let device;
    let recvTransport;
    let consumerVideo;
    let localStream;
    let lastProducerId = null;
    const pendingProducers = [];
    if (!broadcastId) return;
    async function start() {
      setStatus('Connecting to SFU...');
      socket = io(SFU_URL);

      // Set up new-producer handler BEFORE join-room emit
      socket.on('new-producer', async ({ producerId, kind }) => {
        if (kind === 'video' && producerId !== lastProducerId) {
          if (recvTransport && device) {
            lastProducerId = producerId;
            socket.emit('consume', { transportId: recvTransport.id, producerId, rtpCapabilities: device.rtpCapabilities }, async (data) => {
              if (data.error) {
                setStatus('Cannot consume video');
                return;
              }
              consumerVideo = await recvTransport.consume({
                id: data.id,
                producerId: data.producerId,
                kind: data.kind,
                rtpParameters: data.rtpParameters
              });
              socket.emit('resume-consumer', { consumerId: consumerVideo.id });
              localStream = new MediaStream([consumerVideo.track]);
              if (videoRef.current) {
                videoRef.current.srcObject = localStream;
                videoRef.current.muted = true;
                setTimeout(() => {
                  if (videoRef.current) {
                    videoRef.current.play().catch(() => {});
                  }
                }, 500);
              }
              setStatus('Watching live!');
            });
          } else {
            // Buffer the producer event until transport/device are ready
            pendingProducers.push({ producerId, kind });
          }
        }
      });

      socket.on('disconnect', () => {
        setStatus('Disconnected from SFU');
      });

      socket.on('connect', async () => {
        // Join the broadcast first
        socket.emit('join-room', { roomId: broadcastId, role: 'viewer' }, async () => {
          setStatus('Connected to SFU.');
          // 1. Get RTP Capabilities
          socket.emit('get-rtp-capabilities', null, async (rtpCapabilities) => {
            device = new mediasoupClient.Device();
            await device.load({ routerRtpCapabilities: rtpCapabilities });
            // 2. Create receive transport
            socket.emit('create-transport', null, async (params) => {
              recvTransport = device.createRecvTransport(params);
              recvTransport.on('connect', ({ dtlsParameters }, callback, errback) => {
                socket.emit('connect-transport', { transportId: recvTransport.id, dtlsParameters }, callback);
              });
              recvTransport.on('connectionstatechange', (state) => {
                console.log('Recv transport connection state:', state);
              });
              // After transport/device are ready, process any buffered producers
              if (pendingProducers.length > 0) {
                for (const { producerId, kind } of pendingProducers.splice(0)) {
                  if (kind === 'video' && producerId !== lastProducerId) {
                    lastProducerId = producerId;
                    socket.emit('consume', { transportId: recvTransport.id, producerId, rtpCapabilities: device.rtpCapabilities }, async (data) => {
                      if (data.error) {
                        setStatus('Cannot consume video');
                        return;
                      }
                      consumerVideo = await recvTransport.consume({
                        id: data.id,
                        producerId: data.producerId,
                        kind: data.kind,
                        rtpParameters: data.rtpParameters
                      });
                      socket.emit('resume-consumer', { consumerId: consumerVideo.id });
                      localStream = new MediaStream([consumerVideo.track]);
                      if (videoRef.current) {
                        videoRef.current.srcObject = localStream;
                        videoRef.current.muted = true;
                        setTimeout(() => {
                          if (videoRef.current) {
                            videoRef.current.play().catch(() => {});
                          }
                        }, 500);
                      }
                      setStatus('Watching live!');
                    });
                  }
                }
              }
            });
          });
        });
      });
      socket.on('connect_error', (err) => {
        setStatus('Failed to connect to SFU');
      });
    }
    start();
    return () => {
      setStatus('');
      if (socket) socket.disconnect();
      if (localStream) localStream.getTracks().forEach(t => t.stop());
    };
  }, [location]);

  return (
    <div style={{ width: '100%', aspectRatio: '16/9', background: 'black', position: 'relative' }}>
      <video
        ref={videoRef}
        autoPlay
        controls
        muted
        style={{ width: '100%', height: '100%', objectFit: 'cover', background: 'black', display: 'block' }}
      />
      {error && (
        <div style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', background: 'rgba(0,0,0,0.7)'
        }}>
    <div>
            <h2>No Live Stream</h2>
            <p>Waiting for broadcast to start...</p>
          </div>
        </div>
      )}
    </div>
  );
} 