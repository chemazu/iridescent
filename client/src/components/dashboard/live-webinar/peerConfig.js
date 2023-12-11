// peerConfig.js

const peerConfig = {
    host: 'localhost',
    port: 3478,
    path: '/',
    config: {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }, // Default STUN server
        {
          urls: 'turn:localhost:3478',
          username: 'username',
          credential: 'password',
        },
      ],
    },
  };
  
  export default peerConfig;
  
