import React, { useEffect, useRef, useState } from "react";
import Peer from "peerjs";
import axios from "axios";
import socket from "../../../utilities/client-socket-connect";
import { Col, Container, Row, Button, Card, Modal } from "reactstrap";
import "../../../custom-styles/dashboard/live-webinar.css";

import mic from "../../../images/mic-control.svg";
import vid from "../../../images/vid-control.svg";

import DashboardNavbar from "../DashboardNavbar";
import { useParams } from "react-router-dom";
import ToggleAudio from "./ToggleAudio";
import Poll from "./Poll";

export default function Stream() {
  const { roomid } = useParams();
  const myVideoRef = useRef();
  const chatInterfaceRef = useRef(null);
  const [title, setTitle] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [chatMessage, setChatMessage] = useState(null);
  const [pollStatus, setPollStatus] = useState(false);
  const [pollTitle, setPollTitle] = useState("");
  const [defaultChat, setDefaultChat] = useState([
    { user: "poll", msg: "polldata" },
  ]);
  const [pollOptions, setPollOptions] = useState(["", "", "", ""]);
  const validateWebinar = async () => {
    setIsLoading(true);

    try {
      let res = await axios.get(`/api/v1/livewebinar/watch/${roomid}`);
      if (res) {
        setIsLoading(false);
        console.log(res);

        setTitle(res.data.title);
      }
    } catch (error) {
      console.log(error.message);

      setIsLoading(false);
    }
  };
  const handlePollTitleChange = (event) => {
    setPollTitle(event.target.value);
  };
  const scrollToBottom = () => {
    if (chatInterfaceRef && chatInterfaceRef.current) {
      chatInterfaceRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };
  const sendMessage = () => {
    console.log(chatMessage);
    if (chatMessage !== null) {
      setDefaultChat([...defaultChat, { user: 1, msg: chatMessage }]);
    }
    setChatMessage("");
  };
  const handleKeyDown = (event) => {
    if (event.keyCode === 13) {
      sendMessage();
    }
  };
  const handlePollOptionChange = (index, event) => {
    const newOptions = [...pollOptions];
    newOptions[index] = event.target.value;
    setPollOptions(newOptions);
  };
  const handlePollSubmit = (event) => {
    event.preventDefault();
    // Do something with pollTitle and pollOptions
    console.log("Poll Title:", pollTitle);
    console.log("Poll Options:", pollOptions);
    // Close the modal
    setPollStatus(false);
  };

  function addVideoStream(video, stream) {
    video.srcObject = stream;
    video.addEventListener("loadedmetadata", () => {
      video.play();
    });
  }
  const onConnect = (userId) => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        addVideoStream(myVideoRef.current, stream);
      });
  };
  useEffect(() => {
    validateWebinar();
  }, [roomid]);
  useEffect(() => {
    onConnect();
  }, []);
  useEffect(() => {
    scrollToBottom();
  }, [defaultChat]);
  // socket connections
  socket.on("connect", () => {
    console.log(`Connected to server: ${socket.id}`);
  });

  socket.on("message", (message) => {
    console.log(`Received message: ${message}`);
  });
  return (
    <div className="dashboard-layout">
      <Container fluid>
        <Row>
          <DashboardNavbar />
          <Col className="page-actions__col">
            <div className="live-webinar">
              <div className="stream-webinar-content">
                <div className="page-title" style={{ display: "block" }}>
                  <div className="time-constraints">
                    <div className="time-tracker">
                      <p>Time Remaining</p>
                      <p>00:00:00</p>
                    </div>

                    <Button className="page-title_cta-btn">
                      End Webinar &nbsp; <i className="fa fa-times"></i>
                    </Button>
                  </div>
                  <div className="page-title__text">
                    {isLoading ? "..." : title}
                    {/* <br />
                    <span>Chukwuemeka Chemazu</span> */}
                  </div>
                  <span>Chukwuemeka Chemazu</span>

                  <div className="live-webinar-interface">
                    <div className="video-background">
                      <video
                        ref={myVideoRef}
                        muted
                        // style={{ width: "300px", height: "200px" }}
                      />
                    </div>
                    <div className="chat-box">
                      <div className="chat-interface">
                        {defaultChat.map((item, index) => {
                          return (
                            <>
                              {item.user === "poll" ? (
                                <div className="inchat-poll">
                                  <div className="top">
                                    <span>
                                      Poll <i className="fas fa-poll poll"></i>
                                    </span>
                                    <i className="fa fa-times"></i>
                                  </div>
                                  <div className="bottom">
                                    <p>Who is the best</p>
                                    <div className="poll-options">
                                      <Poll pollOptions={pollOptions} />
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div
                                  key={index}
                                  className={`chat-bubble ${
                                    item.user === 1 ? "user-bubble" : ""
                                  }`}
                                >
                                  {item.msg}
                                </div>
                              )}
                            </>
                          );
                        })}
                        <div ref={chatInterfaceRef} />
                      </div>
                      <div className="chat-control">
                        <div className="action-wrapper">
                          <i class="fas fa-smile"></i>
                          <i class="fas fa-microphone"></i>
                          <i class="fas fa-paperclip"></i>
                        </div>
                        <input
                          value={chatMessage}
                          onChange={(e) => {
                            setChatMessage(e.target.value);
                          }}
                          onKeyDown={handleKeyDown}
                          placeholder="Type a message"
                        />
                        <Button
                          onClick={() => {
                            sendMessage();
                            // setChatMessage("");
                          }}
                        >
                          Send
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
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
                        // handleScreenSharing();
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
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
