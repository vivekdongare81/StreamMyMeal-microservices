import React, { useRef, useEffect } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

const room = 'restaurant-1'; // Use dynamic restaurant ID as needed

export default function Viewer() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const stompClientRef = useRef<Client | null>(null);
  const iceCandidateQueue = useRef<any[]>([]);
  const remoteDescriptionSet = useRef(false);

  useEffect(() => {
    const socket = new SockJS('http://localhost:8086/ws');
    const stompClient = new Client({ webSocketFactory: () => socket });
    stompClientRef.current = stompClient;

    stompClient.onConnect = () => {
      stompClient.subscribe(`/topic/${room}`, async (msg) => {
        const data = JSON.parse(msg.body);
        if (data.type === 'offer') {
          await pcRef.current?.setRemoteDescription(new RTCSessionDescription(data.data));
          remoteDescriptionSet.current = true;
          const answer = await pcRef.current!.createAnswer();
          await pcRef.current!.setLocalDescription(answer);
          stompClient.publish({
            destination: '/app/signal',
            body: JSON.stringify({ type: 'answer', room, data: answer })
          });
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

      pcRef.current = new RTCPeerConnection();

      pcRef.current.ontrack = e => {
        console.log('Viewer received track:', e.streams);
        if (videoRef.current) videoRef.current.srcObject = e.streams[0];
      };

      pcRef.current.oniceconnectionstatechange = () => {
        console.log('Viewer ICE state:', pcRef.current.iceConnectionState);
      };
    };

    stompClient.activate();

    return () => {
      stompClient.deactivate();
    };
  }, []);

  return <video ref={videoRef} autoPlay controls style={{ width: 400 }} />;
} 