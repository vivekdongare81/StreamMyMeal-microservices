import React, { useRef, useEffect } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

const room = 'restaurant-1'; // Use dynamic restaurant ID as needed

export default function Broadcaster() {
  const videoRef = useRef<HTMLVideoElement>(null);
  // Map of viewerId -> RTCPeerConnection
  const peerConnections = useRef<{ [viewerId: string]: RTCPeerConnection }>({});
  const stompClientRef = useRef<Client | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const socket = new SockJS('http://localhost:8086/ws');
    const stompClient = new Client({ webSocketFactory: () => socket });
    stompClientRef.current = stompClient;

    stompClient.onConnect = () => {
      stompClient.subscribe(`/topic/${room}`, async (msg) => {
        const data = JSON.parse(msg.body);
        const viewerId = data.from;
        if (!viewerId) return;

        if (data.type === 'join') {
          // New viewer joined, create a new connection for them
          if (!peerConnections.current[viewerId]) {
            const pc = new RTCPeerConnection();
            peerConnections.current[viewerId] = pc;
            // Add tracks
            localStreamRef.current?.getTracks().forEach(track => {
              pc.addTrack(track, localStreamRef.current!);
            });
            // ICE
            pc.onicecandidate = e => {
              if (e.candidate) {
                stompClient.publish({
                  destination: '/app/signal',
                  body: JSON.stringify({ type: 'candidate', room, to: viewerId, data: e.candidate })
                });
              }
            };
            pc.oniceconnectionstatechange = () => {
              console.log(`ICE state for ${viewerId}:`, pc.iceConnectionState);
            };
            // Offer
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            stompClient.publish({
              destination: '/app/signal',
              body: JSON.stringify({ type: 'offer', room, to: viewerId, data: offer })
            });
          }
        }
        if (data.type === 'answer') {
          const pc = peerConnections.current[viewerId];
          if (pc) {
            await pc.setRemoteDescription(new RTCSessionDescription(data.data));
          }
        }
        if (data.type === 'candidate') {
          const pc = peerConnections.current[viewerId];
          if (pc) {
            await pc.addIceCandidate(new RTCIceCandidate(data.data));
          }
        }
      });

      // Start camera/mic and store stream
      navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
        if (videoRef.current) videoRef.current.srcObject = stream;
        localStreamRef.current = stream;
      });
    };

    stompClient.activate();

    return () => {
      stompClient.deactivate();
      // Close all peer connections
      Object.values(peerConnections.current).forEach(pc => pc.close());
    };
  }, []);

  return <video ref={videoRef} autoPlay muted style={{ width: 400 }} />;
} 