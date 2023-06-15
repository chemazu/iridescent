import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import Peer from "peerjs";
import socket from "../../../utilities/client-socket-connect";

export default function WatchStream() {
  const myPeer = new Peer({});
  const myVideoRef = useRef();

  const { roomid } = useParams();
  
  myPeer.on("open", (user) => {
    console.log("peer created");
    console.log(user);
    socket.emit("watcher", roomid, user);
  });
  function addVideoStream(stream) {
    let video = myVideoRef.current;
    if (video) {
      video.srcObject = stream;
      video.addEventListener("loadedmetadata", () => {
        video.play();
      });
    }
  }
  myPeer.on("call", (call) => {
    
    call.answer();
    call.on("stream", (userVideoStream) => {
      addVideoStream(userVideoStream);
    });
  });
  return (
    <div>
      WatchStream{roomid}
      <video
        ref={myVideoRef}
        muted
        style={{ width: "300px", height: "200px" }}
      />
    </div>
  );
}
