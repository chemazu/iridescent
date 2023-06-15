import React, { useEffect, useRef, useState } from "react";
import Peer from "peerjs";
import axios from "axios";
import socket from "../../../utilities/client-socket-connect";
import { Col, Container, Row, Button, Card, Modal } from "reactstrap";
import "../../../custom-styles/dashboard/live-webinar.css";

import mic from "../../../images/mic-control.svg";
import vid from "../../../images/vid-control.svg";
import { useAlert } from "react-alert";
import DashboardNavbar from "../DashboardNavbar";
import { useParams } from "react-router-dom";
import ToggleAudio from "./ToggleAudio";
import Poll from "./Poll";

export default function Stream() {
  const { roomid } = useParams();
  const myPeer = new Peer({});
  const myVideoRef = useRef();
  const chatInterfaceRef = useRef(null);
  const alert = useAlert();
  const [title, setTitle] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [chatMessage, setChatMessage] = useState(null);
  const [pollStatus, setPollStatus] = useState(false);
  const [quizStatus, setQuizStatus] = useState(false);
  const [quizHolder, setQuizHolder] = useState([]);
  const [pollTitle, setPollTitle] = useState("");
  const [defaultChat, setDefaultChat] = useState([]);
  const [pollOptions, setPollOptions] = useState(["", "", "", ""]);
  const [audioVisuals, setAudioVisuals] = useState({
    video: true,
    audio: true,
  });
  const [screenSharing, setScreenSharing] = useState(false);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [pollConfirmation, setPollConfirmation] = useState(false);
  const [quizConfirmation, setQuizConfirmation] = useState(false);
  const [quizSubmission, setQuizSubmissioin] = useState(false);
  const [waiting, setWaiting] = useState(false);

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
  const analyseStudentResult = (soln, subms) => {
    let correctCount = 0;
    const totalCount = soln.length;

    for (let i = 0; i < totalCount; i++) {
      if (soln[i] === subms[i]) {
        correctCount++;
      }
    }

    const percentCorrect = (correctCount / totalCount) * 100;
    return percentCorrect;
  };
  const handlePollTitleChange = (event) => {
    setPollTitle(event.target.value);
  };
  const handleCreatePoll = () => {
    setDefaultChat([
      ...defaultChat,
      { user: "poll", title: pollTitle, options: pollOptions },
    ]);
    setPollTitle("");
    setPollOptions(["", "", "", ""]);
  };
  const handleQuizCreate = () => {
    setQuizHolder([
      ...quizHolder,
      { question: pollTitle, options: pollOptions },
    ]);
    setDefaultChat([...defaultChat, { user: 1, quizHolder, type: "quiz" }]);
    socket.emit(
      "message",
      { user: 1, quizHolder, type: "quiz", timeStamp: Date.now() },
      roomid
    );
    console.log(defaultChat);
    setPollTitle("");
    setPollOptions(["", "", "", ""]);
  };
  console.log(defaultChat);
  const scrollToBottom = () => {
    if (chatInterfaceRef && chatInterfaceRef.current) {
      chatInterfaceRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };
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
  const handlePollOptionChange = (index, event) => {
    const newOptions = [...pollOptions];
    newOptions[index] = event.target.value;
    setPollOptions(newOptions);
  };
  const handlePollSubmit = (event) => {
    event.preventDefault();
    handleCreatePoll();
    setPollConfirmation(false);
  };
  const handleQuizSubmit = (event) => {
    event.preventDefault();
    handleQuizCreate();
    setQuizConfirmation(false);
  };
  const handleNextQuestion = () => {
    if (pollOptions.every((option) => option !== "") && pollTitle !== "") {
      setQuizHolder([
        ...quizHolder,
        { question: pollTitle, options: pollOptions },
      ]);
      setQuestionNumber(questionNumber + 1);
      setPollTitle("");
      setPollOptions(["", "", "", ""]);
    } else {
      alert.show("Please fill in all options.");
    }
  };

  function addVideoStream(video, stream) {
    video.srcObject = stream;
    video.addEventListener("loadedmetadata", () => {
      video.play();
    });
  }

  const handleScreenSharing = async () => {
    // Request display media stream

    if (screenSharing) {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });
      // Add the stream to local video element
      addVideoStream(myVideoRef.current, stream);
    } else {
      // onConnect();
    }
  };
  const handlePollQuizClose = (index) => {
    const updatedChat = defaultChat.filter((item, i) => i !== index);
    setDefaultChat(updatedChat);
  };

  const onConnect = () => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        addVideoStream(myVideoRef.current, stream);
      })
      .catch((error) => console.error(error));
  };
  const TransmitCamera = (userId) => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        const call = myPeer.call(userId, stream);
        call.on("stream", (remoteStream) => {
          console.log("first remote stream");
        });
      })
      .catch((error) => console.error(error));
  };

  // peerjs

  myPeer.on("open", (user) => {
    console.log("peer created");
    socket.emit("broadcaster", roomid, user);
  });
  // socket
  socket.on("message", (message) => {
    setDefaultChat([...defaultChat, { ...message, user: 2 }]);
  });

  socket.on("special submit", (data) => {
    console.log("first", data);
    console.log(analyseStudentResult(["A", "A", "A"], data.result));
    setQuizSubmissioin(true);
  });
  useEffect(() => {
    validateWebinar();
  }, [roomid]);
  
  useEffect(() => {
    onConnect();
  }, [roomid]);

  useEffect(() => {
    handleScreenSharing();
  }, [screenSharing]);

  useEffect(() => {
    scrollToBottom();
  }, [defaultChat]);

  socket.on("watcher", (userId) => {
    console.log(userId);
    TransmitCamera(userId);
  });

  return (
    <div className="dashboard-layout">
      <Container fluid>
        <Row>
          <DashboardNavbar />
          <Col className="page-actions__col">
            <div className="live-webinar">
              <div className="stream-webinar-content">
                <Modal isOpen={pollStatus} className="poll-modal-wrapper">
                  <div className="poll-modal">
                    <div className="top">
                      <h4 onClick={() => setPollStatus(false)}>X</h4>
                    </div>
                    <p className="poll-heading">Create Poll</p>
                    <form className="poll-form">
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
                        <Button
                          onClick={() => {
                            setPollStatus(false);
                            setPollConfirmation(true);
                          }}
                        >
                          Create
                        </Button>
                      </div>
                    </form>
                  </div>
                </Modal>
                <Modal isOpen={quizStatus} className="poll-modal-wrapper">
                  <div className="poll-modal">
                    <div className="top">
                      <h4 onClick={() => setQuizStatus(false)}>X</h4>
                    </div>
                    <p className="poll-heading">Create Pop Quiz</p>
                    <form className="poll-form" onSubmit={handleQuizSubmit}>
                      <p>Question</p>
                      <div className="poll-item quiz-item">
                        <p>Question {questionNumber}</p>
                        <textarea
                          className="poll-input"
                          value={pollTitle}
                          onChange={handlePollTitleChange}
                        />
                      </div>
                      <p>Answer :</p>
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
                        <Button onClick={handleNextQuestion}>
                          Add next question
                        </Button>
                        <Button
                          onClick={() => {
                            setQuizStatus(false);
                            setQuizConfirmation(true);
                          }}
                        >
                          Create
                        </Button>
                      </div>
                    </form>
                  </div>
                </Modal>
                <Modal isOpen={pollConfirmation} className="confirm-poll-modal">
                  <div className="top">
                    <h4 onClick={() => setPollConfirmation(false)}>X</h4>
                  </div>
                  <p className="confirm-heading">
                    Are you sure you want to create this poll?
                  </p>
                  <p className="confirm-heading">{pollTitle}</p>
                  <div className="poll-wrapper">
                    {pollOptions.map((option, index) => {
                      return (
                        <div className="chat-poll-option" key={index}>
                          <strong>{String.fromCharCode(65 + index)}</strong>
                          <p>{option}</p>
                        </div>
                      );
                    })}
                  </div>
                  <div className="button-wrapper">
                    <Button
                      onClick={() => {
                        setPollTitle("");
                        setPollOptions(["", "", "", ""]);
                        setPollConfirmation(false);
                      }}
                    >
                      No
                    </Button>{" "}
                    <Button
                      onClick={(e) => {
                        handlePollSubmit(e);
                      }}
                    >
                      Yes
                    </Button>
                  </div>
                </Modal>
                <Modal isOpen={quizConfirmation} className="confirm-poll-modal">
                  <div className="top">
                    <h4 onClick={() => setQuizStatus(false)}>X</h4>
                  </div>
                  <p className="confirm-heading">
                    Are you sure you want to create this quiz?
                  </p>
                  <p className="confirm-heading">{pollTitle}</p>

                  <div className="button-wrapper">
                    <Button
                      onClick={() => {
                        setPollTitle("");
                        setPollOptions(["", "", "", ""]);
                        setQuizConfirmation(false);
                      }}
                    >
                      No
                    </Button>{" "}
                    <Button
                      onClick={(e) => {
                        handleQuizSubmit(e);
                      }}
                    >
                      Yes
                    </Button>
                  </div>
                </Modal>
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
                                    handlePollQuizClose(index);
                                  }}
                                ></i>
                              </div>
                              <div className="bottom">
                                <div className="quiz-progress">
                                  <p>Quiz in Progress</p>
                                  <p>00:00:00</p>
                                </div>
                                <div className="quiz-submission">
                                  <p>(0)Submitted</p>
                                  <p>View Results</p>
                                </div>{" "}
                                {quizSubmission && (
                                  <div className="quiz-submitted">
                                    <p>(10)Submitted</p>
                                    <div className="quiz-result-wrapper">
                                      <div className="quiz-result">
                                        <div className="single-quiz-result">
                                          <p>1.</p>
                                          <p>Bruce Lee</p>
                                          <p>70%</p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                                {/* <Button>Stop Quiz</Button> */}
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
                                    <i
                                      className="fa fa-times"
                                      onClick={() => {
                                        handlePollQuizClose(index);
                                      }}
                                    ></i>
                                  </div>
                                  <div className="bottom">
                                    <p>{item.title}</p>
                                    <div className="poll-options">
                                      <Poll pollOptions={item.options} />
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div
                                  key={index}
                                  className={`${
                                    item.user === 1
                                      ? "user-bubble"
                                      : "chat-bubble"
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
                    <div
                      className="control-object"
                      onClick={() => {
                        setAudioVisuals({
                          video: true,
                          audio: !audioVisuals.audio,
                        });
                      }}
                    >
                      <i className="fa fa-microphone"></i>

                      <p>Mic</p>
                    </div>
                    <div
                      className="control-object"
                      onClick={() => {
                        setAudioVisuals({
                          video: !audioVisuals.video,
                          audio: true,
                        });
                      }}
                    >
                      <i className="fas fa-video"></i>

                      <p>Webcam</p>
                    </div>
                    <div
                      className="control-object more share"
                      onClick={() => {
                        setScreenSharing(!screenSharing);
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
                    <div
                      className="control-object"
                      onClick={() => {
                        setQuizStatus(true);
                      }}
                    >
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
