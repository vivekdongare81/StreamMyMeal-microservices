import React, { useRef, useEffect } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

const room = 'restaurant-1'; // Use dynamic restaurant ID as needed

export default function Broadcaster() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const stompClientRef = useRef<Client | null>(null);
  const iceCandidateQueue = useRef<any[]>([]);
  const remoteDescriptionSet = useRef(false);

  useEffect(() => {
    // 1. Connect to Spring Boot WebSocket
    const socket = new SockJS('http://localhost:8086/ws');
    const stompClient = new Client({ webSocketFactory: () => socket });
    stompClientRef.current = stompClient;

    stompClient.onConnect = () => {
      // 2. Subscribe to signaling topic for this room
      stompClient.subscribe(`/topic/${room}`, async (msg) => {
        const data = JSON.parse(msg.body);
        if (data.type === 'answer') {
          await pcRef.current?.setRemoteDescription(new RTCSessionDescription(data.data));
          remoteDescriptionSet.current = true;
          // Add any queued candidates
          while (iceCandidateQueue.current.length > 0) {
            const candidate = iceCandidateQueue.current.shift();
            await pcRef.current?.addIceCandidate(new RTCIceCandidate(candidate));
          }
        }
        if (data.type === 'candidate') {
          if (remoteDescriptionSet.current) {
            await pcRef.current?.addIceCandidate(new RTCIceCandidate(data.data));
          } else {
            iceCandidateQueue.current.push(data.data);
          }
        }
      });

      // 3. Start camera/mic and WebRTC
      navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
        if (videoRef.current) videoRef.current.srcObject = stream;
        pcRef.current = new RTCPeerConnection();

        // Debug: log when tracks are added
        stream.getTracks().forEach(track => {
          console.log('Adding track to peer connection:', track.kind);
          pcRef.current!.addTrack(track, stream);
        });

        pcRef.current.onicecandidate = e => {
          if (e.candidate) {
            stompClient.publish({
              destination: '/app/signal',
              body: JSON.stringify({ type: 'candidate', room, data: e.candidate })
            });
          }
        };

        pcRef.current.oniceconnectionstatechange = () => {
          console.log('Broadcaster ICE state:', pcRef.current.iceConnectionState);
        };

        pcRef.current.onnegotiationneeded = () => {
          console.log('Negotiation needed');
        };

        pcRef.current.createOffer().then(offer => {
          pcRef.current!.setLocalDescription(offer);
          stompClient.publish({
            destination: '/app/signal',
            body: JSON.stringify({ type: 'offer', room, data: offer })
          });
        });
      });
    };

    stompClient.activate();

    return () => {
      stompClient.deactivate();
    };
  }, []);

  return <video ref={videoRef} autoPlay muted style={{ width: 400 }} />;
} 