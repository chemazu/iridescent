import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import socket from "../../../utilities/client-socket-connect";
import Peer from "peerjs";
import axios from "axios";

export default function WatchStream() {
  const [isStreamLive, setIsStreamLive] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userID, setUserID] = useState("");
  const { roomid } = useParams();
  const videoGridRef = useRef();
  const myVideoRef = useRef();
  const myPeer = new Peer({});

  const validateWebinar = async () => {
    setIsLoading(true);

    try {
      let res = await axios.get(`/api/v1/livewebinar/watch/${roomid}`);
      if (res) {
        setIsValid(true);
        setIsLoading(false);
      }
    } catch (error) {
      console.log(error);
      setIsValid(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // this can be done with state
    socket.on("broadcaster", () => {
      console.log("broadcaster joined");
    });
    // socket.broadcast.to(currentRoom).emit("broadcaster-disconnected");
    socket.on("broadcaster-disconnected", () => {
      setIsStreamLive(false);
      console.log("broadcaster left s");
    });
    const ROOM_ID = roomid;

    if (isStreamLive) {
      myPeer.on("open", (user) => {
        socket.emit("watcher", ROOM_ID, user);
      });

      myPeer.on("call", (call) => {
        call.answer();
        call.on("stream", (userVideoStream) => {
          addVideoStream(myVideoRef.current, userVideoStream);
        });
      });
    }

    // return () => {
    //   myPeer.destroy();
    // };
  }, [roomid]);

  function addVideoStream(video, stream) {
    video.srcObject = stream;
    video.addEventListener("loadedmetadata", () => {
      video.play();
    });
    videoGridRef.current.append(video);

  }

  return (
    <div>
      Watch {roomid}
      <div id="video-grid" ref={videoGridRef}>
        pop
        {isStreamLive ? (
          <video
            ref={myVideoRef}
            muted
            style={{ width: "300px", height: "200px" }}
          />
        ) : (
          <>
            <div
              className="waiting-room"
              style={{ width: "300px", height: "200px", minHeight: "200px" }}
            >
              <div>TUTOR DISCONNECTED</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
