import React, { useEffect, useRef, useState } from "react";
import Peer from "peerjs";
import axios from "axios";
import socket from "../../../utilities/client-socket-connect";
import { Col, Container, Row, Button, Card } from "reactstrap";
import "../../../custom-styles/dashboard/live-webinar.css";

import DashboardNavbar from "../DashboardNavbar";
import { useParams } from "react-router-dom";

export default function WatchStream() {
  const { roomid } = useParams();
  const myPeer = new Peer({});
  const myVideoRef = useRef();
  const videoGridRef = useRef();
  const chatInterfaceRef = useRef(null);
  const [title, setTitle] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [chatMessage, setChatMessage] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [answers, setAnswers] = useState([]);
  const [defaultChat, setDefaultChat] = useState([]);

  function addVideoStream(stream) {
    const video = document.createElement("video");
    myVideoRef.current.srcObject = stream;
    video.srcObject = stream;
    video.width = "300px";
    video.height = "300px";
    video.addEventListener("loadedmetadata", () => {
      video.play();
    });
    videoGridRef?.current.append(video);
  }
  const handleOptionClick = (index) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion - 1] = String.fromCharCode(65 + index);
    setAnswers(newAnswers);
  };
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
  const scrollToBottom = () => {
    if (chatInterfaceRef && chatInterfaceRef.current) {
      chatInterfaceRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };
  // send message
  const sendMessage = () => {
    console.log(chatMessage);
    if (chatMessage !== null) {
      socket.emit(
        "message",
        { user: 1, msg: chatMessage, timeStamp: Date.now(), type: "text" },
        roomid
      );
      setDefaultChat([
        ...defaultChat,
        { user: 1, msg: chatMessage, timeStamp: Date.now(), type: "text" },
      ]);
    }
    setChatMessage("");
  };

  const handleKeyDown = (event) => {
    if (event.keyCode === 13) {
      sendMessage();
    }
  };
  const handleSpecialSubmit = (result, type) => {
    socket.emit("special submit", type, result, roomid);
  };
  useEffect(() => {
    validateWebinar();
  }, [roomid]);

  useEffect(() => {
    scrollToBottom();
  }, [defaultChat]);

  // peerjs
  // myPeer.on("open", (user) => {
  //   console.log("peer created");
  // socket.emit("watcher", roomid, user);
  //   myPeer.on("call", (call) => {
  //     console.log("first")
  //     call.answer();
  //     call.on("stream", (userVideoStream) => {
  //  console.log("rerer")
  //       addVideoStream( userVideoStream);
  //     });
  //   });
  // });
  myPeer.on("open", (user) => {
    console.log("peer created");
    socket.emit("watcher", roomid, user);
  });
  myPeer.on("call", (call) => {
    console.log("call");
    call.answer();
    call.on("stream", (userVideoStream) => {
      // addVideoStream(userVideoStream);
      if (myVideoRef.current && userVideoStream) {
        myVideoRef.current.srcObject = userVideoStream;
        videoGridRef.append(myVideoRef);
      }
    });
  });
  socket.on("message", (message) => {
    console.log("first", message);
    setDefaultChat([...defaultChat, { ...message, user: 2 }]);
  });
  return (
    <div className="dashboard-layout">
      <Container fluid>
        <Row>
          <DashboardNavbar />
          <Col className="page-actions__col">
            <div className="live-webinar">
              <div className="stream-webinar-content watch-webinar-content">
                <div className="page-title">
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
                    <p>Chukwuemeka Chemazu</p>
                  </div>
                </div>
                <div className="live-webinar-watch">
                  <div className="watch-left">
                    {/* <div id="video-grid" ref={videoGridRef}> */}
                    <div>
                      {/* <div className="video-background"> */}
                      <video ref={myVideoRef} />
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
                        <div className="control-object">
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

                  <div className="chat-box">
                    <div className="chat-interface">
                      {defaultChat.map((item, index) => {
                        return item.type === "quiz" ? (
                          <div className="inchat-poll   inchat-quiz">
                            <div className="top">
                              <span>
                                Pop Quiz{" "}
                                <i className="fas fa-book-open poll"></i>
                              </span>
                              <i
                                className="fa fa-times"
                                onClick={() => {
                                  // handlePollQuizClose(index);
                                }}
                              ></i>
                            </div>
                            <div className="bottom">
                              {item.quizHolder.map((item, index) => {
                                return (
                                  <div
                                    className="single-question-holder"
                                    key={index}
                                    style={{
                                      display:
                                        index + 1 === currentQuestion
                                          ? "block"
                                          : "none",
                                    }}
                                  >
                                    <p>{item.question}</p>
                                    <ul className="question-options " type="A">
                                      {item.options.map((option, index) => {
                                        return (
                                          <li
                                            key={index}
                                            style={{
                                              listStyleType:
                                                answers[currentQuestion - 1] ===
                                                String.fromCharCode(65 + index)
                                                  ? "disc"
                                                  : "circle",
                                            }}
                                            onClick={() =>
                                              handleOptionClick(index)
                                            }
                                          >
                                            {option}
                                          </li>
                                        );
                                      })}
                                    </ul>
                                    <div className="quiz-button-wrapper">
                                      {currentQuestion > 1 &&
                                        currentQuestion <=
                                          item.options.length && (
                                          <Button
                                            onClick={() => {
                                              setCurrentQuestion(
                                                currentQuestion - 1
                                              );
                                            }}
                                          >
                                            Prev
                                          </Button>
                                        )}

                                      {index + 2 === item.options.length ? (
                                        ""
                                      ) : (
                                        <Button
                                          onClick={() => {
                                            setCurrentQuestion(
                                              currentQuestion + 1
                                            );
                                          }}
                                        >
                                          Next
                                        </Button>
                                      )}
                                      <Button
                                        onClick={() => {
                                          handleSpecialSubmit(answers, "quiz");
                                          console.log(answers);
                                        }}
                                      >
                                        Submit
                                      </Button>
                                    </div>
                                  </div>
                                );
                              })}
                              {/* {item.quizHolder.map((item, index) => {
                                <div
                                  className="single-question-holder"
                                  key={index}
                                  // style={{
                                  //   display:
                                  //     index  === currentQuestion
                                  //       ? "block"
                                  //       : "none",
                                  // }}
                                >
                                  <p>{item.question}</p>
                                  {item.options.map((item, index) => {
                                    <div key={index}>{item}</div>;
                                  })}
                                </div>;
                              })} */}
                            </div>
                          </div>
                        ) : (
                          <>
                            {item.type === "poll" ? (
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
                                    {/* <Poll pollOptions={pollOptions} /> */}
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
                          console.log(e.target.value);
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message"
                      />
                      <Button
                        onClick={() => {
                          console.log("first");
                          sendMessage();
                        }}
                      >
                        Send
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
