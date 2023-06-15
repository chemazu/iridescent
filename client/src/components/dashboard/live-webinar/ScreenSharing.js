import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import Peer from 'peerjs';

const socket = io('http://localhost:3001');

const StreamingPage = () => {
  const [screenSharing, setScreenSharing] = useState(false);
  const [peer, setPeer] = useState(null);
  let screenStream = null;

  useEffect(() => {
    const initializePeer = async () => {
      const peerInstance = new Peer();
      setPeer(peerInstance);

      peerInstance.on('open', (peerId) => {
        socket.emit('join', peerId);
      });

      peerInstance.on('call', (call) => {
        if (screenSharing && screenStream) {
          call.answer(screenStream);
        } else {
          navigator.mediaDevices
            .getUserMedia({ video: true, audio: true })
            .then((stream) => {
              if (screenSharing) {
                const videoTrack = stream.getVideoTracks()[0];
                screenStream = new MediaStream([videoTrack]);
                call.answer(screenStream);
              } else {
                call.answer(stream);
              }
            })
            .catch((error) => {
              console.error('Error accessing media devices:', error);
            });
        }

        call.on('stream', (remoteStream) => {
          // Handle the incoming stream
        });
      });
    };

    initializePeer();

    return () => {
      peer?.destroy();
    };
  }, [screenSharing]);

  const toggleScreenSharing = () => {
    if (screenSharing) {
      setScreenSharing(false);
      socket.emit('stopScreenSharing');
    } else {
      setScreenSharing(true);
      socket.emit('startScreenSharing');
    }
  };

  return (
    <div>
      <button onClick={toggleScreenSharing}>
        {screenSharing ? 'Stop Screen Sharing' : 'Start Screen Sharing'}
      </button>
    </div>
  );
};

export default StreamingPage;
