import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import Peer from "peerjs";
import socket from "../../../utilities/client-socket-connect";

export default function Stream() {
  const { roomid } = useParams();
  const myPeer = new Peer({});
  const myVideoRef = useRef();

  function addVideoStream(video, stream) {
    video.srcObject = stream;
    video.addEventListener("loadedmetadata", () => {
      video.play();
    });
  }
  const onConnect = () => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        addVideoStream(myVideoRef.current, stream);
      })
      .catch((error) => console.error(error));
  };
  const transmitCamera = (id) => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        const call = myPeer.call(id, stream);
        call.on("stream", (remoteStream) => {
          console.log("remote stream received from user ", id);
        });
      })
      .catch((error) => console.error(error));
  };

  myPeer.on("open", (user) => {
    console.log("peer created");
    socket.emit("broadcaster", roomid, user);
    onConnect();
  });

  socket.on("watcher", (stuff) => {
    console.log(stuff);
    transmitCamera(stuff);
  });

  return (
    <div>
      Stream{roomid}{" "}
      <video
        ref={myVideoRef}
        muted
        style={{ width: "300px", height: "200px" }}
      />
    </div>
  );
}
