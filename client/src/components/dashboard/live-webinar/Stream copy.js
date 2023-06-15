// Edge cases
// scenario 1 : presenter 1st , Watchers 2nd
// scenario 2 : presenter exists
// scenario 3 : watcher exists
// scenario 4 : Watchers 1st , presenter 2nd
// scenario 5 : Presenter displays screen before watcher joins
// scenario 6 : Presenter displays screen after watcher joins
// scenario 7 : Presenter switches back to camera
// scenario 8 : Presenter switches  to screen
// scenario 9 : Show screen and camera output
// scenario 10 : screen sharing and new users joins

import React, { useEffect, useRef, useState } from "react";
import Peer from "peerjs";
import socket from "../../../utilities/client-socket-connect";
import {
  Col,
  Container,
  Row,
  Button,
  Card,
  Modal,
} from "reactstrap";
import "../../../custom-styles/dashboard/live-webinar.css";

import mic from "../../../images/mic-control.svg";
import vid from "../../../images/vid-control.svg";

import DashboardNavbar from "../DashboardNavbar";
import { useParams } from "react-router-dom";
import ToggleAudio from "./ToggleAudio";
export default function Stream() {
  const [screenSharing, setScreenSharing] = useState(false);
  const [userMic, setuserMic] = useState(null);
  const [speaker, setSpeaker] = useState(null);
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [chatMessage, setChatMessage] = useState(null);
  const [pollStatus, setPollStatus] = useState(false);
  const [popQuizStatus, setPopQuizStatus] = useState(false);
  const [pollTitle, setPollTitle] = useState("");
  const [pollOptions, setPollOptions] = useState(["", "", "", ""]);
  const handlePollTitleChange = (event) => {
    setPollTitle(event.target.value);
  };

  const handlePollOptionChange = (index, event) => {
    const newOptions = [...pollOptions];
    newOptions[index] = event.target.value;
    setPollOptions(newOptions);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // Do something with pollTitle and pollOptions
    console.log("Poll Title:", pollTitle);
    console.log("Poll Options:", pollOptions);
    // Close the modal
    setPollStatus(false);
  };

  const [defaultChat, setDefaultChat] = useState([
    { user: 1, msg: "hi" },
    { user: 2, msg: "hello" },
    { user: 3, msg: "Howdy" },
    { user: 4, msg: "Bonjour" },
    { user: 1, msg: "how are you" },
  ]);

  const [waiting, setWaiting] = useState(true);
  const myVideoRef = useRef();
  const { roomid } = useParams();
  const ROOM_ID = roomid;
  const myPeer = new Peer({});
  const sendMessage = () => {
    console.log(chatMessage);
    if (chatMessage !== null) {
      setDefaultChat([...defaultChat, { user: 1, msg: chatMessage }]);
      setChatMessage("");
    }
  };

  const transmitScreenDisplay = (id, stream) => {
    const call = myPeer.call(id, stream);
    call.on("stream", (remoteStream) => {
      console.log("remote stream received from user ", id);
    });
  };

  const handleScreenSharing = async () => {
    setScreenSharing(!screenSharing);
    console.log("created screen sharing");

    socket.emit("screensharing", ROOM_ID);

    // Request display media stream
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
    });

    // Add the stream to local video element
    addVideoStream(myVideoRef.current, stream);

    // Transmit the stream to each connected user
    for (let [key, value] of myPeer._connections.entries()) {
      console.log(key, value);
      transmitScreenDisplay(key, stream);
    }
  };

  function addVideoStream(video, stream) {
    video.srcObject = stream;
    video.addEventListener("loadedmetadata", () => {
      video.play();
    });
  }
  const startStream = () => {
    setWaiting(false);
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        addVideoStream(myVideoRef.current, stream);
      });
    socket.emit("broadcaster", ROOM_ID);
  };
  // const onConnect = (userId) => {
  //   navigator.mediaDevices.getDisplayMedia({ video: true }).then((stream) => {
  //     addVideoStream(myVideoRef.current, stream);
  //     // const broadcasterVideo = document.getElementById("broadcaster-video");
  //     // broadcasterVideo.srcObject = stream;
  //     // broadcasterVideo.play();
  //     const call = myPeer.call(userId, stream);
  //     call.on("stream", (remoteStream) => {
  //       console.log("first remote stream");
  //     });
  //   });

  //   // .catch((error) => {
  //   //   if (error.name === "NotAllowedError") {
  //   //     console.log("User denied access to media devices");
  //   //   } else if (error.name === "NotFoundError") {
  //   //     console.log("Media devices not available");
  //   //   } else {
  //   //     console.log("Error accessing media devices", error);
  //   //   }
  //   // });
  // };

  const onConnect = (userId) => {
    // if (screenSharing) {
    //   console.log(screenSharing);

    //   navigator.mediaDevices.getDisplayMedia({ video: true }).then((stream) => {
    //     addVideoStream(myVideoRef.current, stream);

    //     // const broadcasterVideo = document.getElementById("broadcaster-video");
    //     // broadcasterVideo.srcObject = stream;
    //     // broadcasterVideo.play();
    //     const call = myPeer.call(userId, stream);
    //     call.on("stream", (remoteStream) => {
    //       console.log("first remote stream");
    //     });
    //   });
    // }
    // if (!screenSharing) {
    console.log(screenSharing);
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        addVideoStream(myVideoRef.current, stream);

        // const broadcasterVideo = document.getElementById("broadcaster-video");
        // broadcasterVideo.srcObject = stream;
        // broadcasterVideo.play();
        const call = myPeer.call(userId, stream);
        call.on("stream", (remoteStream) => {
          console.log("first remote stream");
        });
      });
    // }

    // .catch((error) => {
    //   if (error.name === "NotAllowedError") {
    //     console.log("User denied access to media devices");
    //   } else if (error.name === "NotFoundError") {
    //     console.log("Media devices not available");
    //   } else {
    //     console.log("Error accessing media devices", error);
    //   }
    // });
  };

  myPeer.on("open", (user) => {
    console.log("peer created");
    socket.emit("broadcaster", ROOM_ID, user);
  });

  useEffect(() => {
    navigator.mediaDevices
      .enumerateDevices()
      .then((devices) => {
        const audioOutputDevices = devices.filter(
          (device) => device.kind === "audiooutput"
        );
        setDevices(audioOutputDevices);
      })
      .catch((error) => console.error(error));
  }, []);

  useEffect(() => {
    async function getDevices() {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const micDevice = devices.find(
          (device) => device.kind === "audioinput"
        );
        const speakerDevice = devices.find(
          (device) => device.kind === "audiooutput"
        );
        setuserMic(micDevice.label);
        setSpeaker(speakerDevice.label);
      } catch (error) {
        console.error("Error getting devices:", error);
      }
    }

    getDevices();
  }, []);

  useEffect(() => {
    socket.on("watcher", (userId) => {
      console.log(userId);
      onConnect(userId);
    });
  });
  return (
    <div className="dashboard-layout">
      <Container fluid>
        <Row>
          <DashboardNavbar />
          <Col className="page-actions__col">
            <div className="live-webinar">
              <div className="stream-webinar-content">
                <div className="page-title">
                  <div className="page-title__text">
                    Webinar - How to start a blog
                  </div>
                </div>
                <Modal isOpen={pollStatus} className="poll-modal-wrapper">
                  <div className="poll-modal">
                    <div className="top">
                      <h4 onClick={() => setPollStatus(false)}>X</h4>
                    </div>
                    <p className="poll-heading">Create Poll</p>
                    <form className="poll-form" onSubmit={handleSubmit}>
                      <div className="poll-item">
                        <p>Poll title</p>
                        <input
                          className="poll-input"
                          value={pollTitle}
                          onChange={handlePollTitleChange}
                        />
                      </div>
                      {pollOptions.map((option, index) => (
                        <div className="poll-option" key={index}>
                          <p>{String.fromCharCode(65 + index)}</p>
                          <input
                            className="poll-input"
                            placeholder={`Option ${String.fromCharCode(
                              65 + index
                            )}`}
                            value={option}
                            onChange={(event) =>
                              handlePollOptionChange(index, event)
                            }
                          />
                        </div>
                      ))}
                      <div className="button-wrapper">
                        <Button
                          type="button"
                          onClick={() => setPollStatus(false)}
                          className="cancel"
                        >
                          Cancel
                        </Button>
                        <Button type="submit">Create</Button>
                      </div>
                    </form>
                  </div>
                </Modal>
                <Card
                  className="webinar-container stream-container"
                  style={{ padding: waiting ? "4em 5em" : "" }}
                >
                  <div className="video-left">
                    {waiting && (
                      <>
                        <div className="waiting-room">
                          <div className="audio-controls">
                            <img src={mic} alt="mic-control" />
                            <img src={vid} alt="vid-control" />
                          </div>
                        </div>

                        <div class="select-audio-output-wrapper">
                          <ToggleAudio />
                          
                        </div>
                      </>
                    )}
                    {!waiting && (
                      <div className="video-background">
                        <video
                          ref={myVideoRef}
                          muted
                          // style={{ width: "300px", height: "200px" }}
                        />
                        {/* <div className="video-options">
                          <div className="single-video-option">
                            <i className="fas fa-volume-up"></i>
                            <p>Volume</p>
                          </div>
                          <div
                            className="single-video-option"
                            onClick={() => {
                              handleScreenSharing();
                            }}
                          >
                            <i className="fas fa-desktop"></i>
                            <p>{screenSharing ? "Stop" : "Share"} Screen</p>
                          </div>{" "}
                          <div className="single-video-option">
                            <i className="fas fa-desktop"></i>
                            <p>Settings</p>
                          </div>
                        </div> */}
                      </div>
                    )}
                  </div>

                  <div className="chat-right">
                    {waiting ? (
                      <div className="chat-right-waiting">
                        Your Live Webinar is ready, press Start to begin your
                        Webinar
                        <div className="button-wrapper start-webinar">
                          <Button
                            onClick={() => {
                              startStream();
                            }}
                          >
                            Start
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="student-section">
                        <p>
                          Attendies <strong>(23)</strong>
                        </p>
                        <div className="chat-box">
                          <div className="chat-interface">
                            {defaultChat.map((item, index) => {
                              return (
                                <div
                                  key={index}
                                  className={`chat-bubble ${
                                    item.user === 1 ? "user-bubble" : ""
                                  }`}
                                >
                                  {item.msg}
                                </div>
                              );
                            })}
                          </div>
                          <div className="chat-control">
                            <div className="action-wrapper">
                              <i class="fas fa-smile"></i>
                              <i class="fas fa-microphone"></i>
                              <i class="fas fa-paperclip"></i>
                            </div>
                            <input
                              onChange={(e) => {
                                setChatMessage(e.target.value);
                              }}
                              placeholder="Type a message"
                            />
                            <Button
                              onClick={() => {
                                sendMessage();
                              }}
                            >
                              Send
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
                {!waiting && (
                  <Card className="presenter-controls-wrapper">
                    {" "}
                    <div className="presenter-controls">
                      <div className="control-object more">
                        <i className="fa fa-ellipsis-h"></i>

                        <p>More</p>
                      </div>
                      <div className="control-object">
                        <i className="fa fa-microphone"></i>

                        <p>Mic</p>
                      </div>
                      <div className="control-object">
                        <i className="fas fa-video"></i>

                        <p>Webcam</p>
                      </div>
                      <div
                        className="control-object more share"
                        onClick={() => {
                          handleScreenSharing();
                        }}
                      >
                        <i className="fa fa-desktop"></i>
                        <p>Share screen</p>
                      </div>
                      <div
                        className="control-object"
                        onClick={() => {
                          setPollStatus(true);
                        }}
                      >
                        <i className="fas fa-poll poll"></i>

                        <p>Polls</p>
                      </div>
                      <div className="control-object">
                        <i className="fas fa-book-open"></i>

                        <p>Pop Quiz</p>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

