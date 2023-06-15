import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import socket from "../../../utilities/client-socket-connect";
import Peer from "peerjs";
import axios from "axios";
import { Button } from "reactstrap";

export default function WatchStream() {
  const { roomid } = useParams();
  const [isStreamLive, setIsStreamLive] = useState(false);
  const [joinStream, setJoinStream] = useState(false);
  // const videoGridRef = useRef();
  const myVideoRef = useRef();
  const myPeer = new Peer({});

  const validateWebinar = async () => {
    try {
      let res = await axios.get(`/api/v1/livewebinar/watch/${roomid}`);
      if (res) {
        setIsStreamLive(res.data.isLive);
      }
    } catch (error) {}
  };
  const handleJoinRoom = () => {
    setJoinStream(true);
  };

  function addVideoStream(video, stream) {
    video.srcObject = stream;
    video.addEventListener("loadedmetadata", () => {
      video.play();
    });

    // videoGridRef.current.append(video);
  }
  useEffect(() => {
    validateWebinar();
  }, [roomid]);

  useEffect(() => {
    // this can be done with state
    socket.on("broadcaster", () => {
      console.log("bd joinrte")
      setIsStreamLive(true);
    });
    socket.on("broadcaster-disconnected", () => {
      setIsStreamLive(false);
      setJoinStream(false);
    });
    if (joinStream) {
      console.log("first");
      myPeer.on("open", (user) => {
        socket.emit("watcher", roomid, user);
      });
      myPeer.on("call", (call) => {
        call.answer();
        call.on("stream", (userVideoStream) => {
          addVideoStream(myVideoRef.current, userVideoStream);
        });
      });
    }
  }, [joinStream]);
  return (
    <div>
      {isStreamLive ? (
        joinStream ? (
          <>
            <video
              ref={myVideoRef}
              muted
              style={{ width: "300px", height: "200px" }}
            />
            <Button onClick={() => setJoinStream(false)}>Leave Room</Button>
          </>
        ) : (
          <>
            <p>Waiting room</p>
            <Button onClick={() => setJoinStream(true)}>Join Room</Button>
          </>
        )
      ) : (
        <p>Waiting for broadcaster stream not live no stream date available</p>
      )}
    </div>
  );
}
