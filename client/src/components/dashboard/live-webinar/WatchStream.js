import React, { useEffect, useRef, useState } from "react";
import Peer from "peerjs";
import axios from "axios";
import socket from "../../../utilities/client-socket-connect";
import {
  Col,
  Container,
  Row,
  Button,
  Card,
  Spinner,
  ListGroup,
  Progress,
} from "reactstrap";
import { connect } from "react-redux";
import { loadUser } from "../../../actions/auth";
import "../../../custom-styles/dashboard/live-webinar.css";
import { useParams, useHistory } from "react-router-dom";
import setDocumentTitle from "../../../utilities/setDocumentTitle";

import smiley from "../../../images/emojisvg.svg";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import CountdownTimer from "./CountDownTimer";
import setAuthToken from "../../../utilities/setAuthToken";
import Poll from "./Poll";

function WatchStream({ schoolname }) {
  const { roomid } = useParams();
  let history = useHistory();
  let [currentPeer, setCurrentPeer] = useState(null);
  const myVideoRef = useRef();
  const peerRef = useRef(null);
  const [trigger, setTrigger] = useState("");

  const chatInterfaceRef = useRef(null);
  const [title, setTitle] = useState("");
  const [presenterName, setPresenterName] = useState("");
  const [submitted, setSubmitted] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [chatMessage, setChatMessage] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [answers, setAnswers] = useState([]);
  const [timerHolder, setTimerHolder] = useState({});
  const [pollAnswerHolder, setPollAnswerHolder] = useState({});
  const [reconnect, setReconnect] = useState("");
  const [submitStatusHolder, setSubmitStatusHolder] = useState({});
  const [defaultChat, setDefaultChat] = useState([]);
  const [watcherUsername, setWatcherUsername] = useState("");
  const [school, setSchool] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [reconnectLoading, setReconnectLoading] = useState(false);
  const [attendees, setAttendees] = useState(true);
  const [theme, setTheme] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const myPeerRef = useRef(null);
  const [pollResults, setPollResults] = useState({});
  const [waiting, setWaiting] = useState(true);
  const [disconnect, setDisconnect] = useState(false);
  const [screenSharing, setScreenSharing] = useState(false);

  const handleToggleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };
  if (localStorage.getItem("studentToken")) {
    setAuthToken(localStorage.getItem("studentToken"));
  }

  var currentDate = new Date();
  var options = { day: "numeric", month: "long", year: "numeric" };

  var formattedDate = currentDate.toLocaleString("en-US", options);

  const getUserName = async () => {
    try {
      let res = await axios.get("/api/v1/livewebinar/studentdetails/");
      console.log(res.data);
      setWatcherUsername(res.data.username);
    } catch (error) {
      console.log(error);
      console.log(error.message);
    }
  };

  const handleOptionClick = (index) => {
    // here sets the settings for answers
    const newAnswers = [...answers];
    newAnswers[currentQuestion - 1] = String.fromCharCode(65 + index);
    setAnswers(newAnswers);
  };
  const handlePollSubmit = (questionControl) => {
    let newSubmission = {
      ...submitted,
      [questionControl]: pollAnswerHolder[questionControl],
    };
    setSubmitted(newSubmission);
    socket.emit(
      "special submit",
      "poll",
      [pollAnswerHolder[questionControl]],
      roomid,
      watcherUsername,
      questionControl
    );

    // const newAnswers = [...pollAnswers];
    // newAnswers[currentQuestion - 1] = String.fromCharCode(65 + index);
    // setPollAnswers(newAnswers);
  };
  const handlePollOptionClick = (index, questionControl) => {
    let newAnswerHolder = {
      ...pollAnswerHolder,
      [questionControl]: String.fromCharCode(65 + index),
    };
    setPollAnswerHolder(newAnswerHolder);
    // const newAnswers = [...pollAnswers];
    // newAnswers[currentQuestion - 1] = String.fromCharCode(65 + index);
    // setPollAnswers(newAnswers);
  };

  const handleExitStream = () => {
    // Perform any necessary actions before exiting the stream
    // For example, stop the video stream, disconnect from the peer, etc.
    // check if they are video streams avalilbe
    myVideoRef.current.srcObject.getTracks().forEach((track) => {
      track.stop();
    });
    myPeerRef.current.destroy();
    socket.emit("watcher-exit", roomid);

    history.push("/");
  };
  const handleSelectEmoji = (emoji) => {
    setChatMessage(
      chatMessage === null ? emoji.native : chatMessage + emoji.native
    );
    setShowEmojiPicker(!showEmojiPicker);
  };
  const getSchoolBySchoolName = async (schoolname) => {
    try {
      const res = await axios.get(`/api/v1/school/${schoolname}`);
      setSchool(res.data);
      return res.data;
    } catch (error) {
      if (error.response.status === 404) {
        setSchool(null);
        setPageLoading(false);
      }
      console.log(error.response.data.errors[0].msg);
      return null;
    }
  };
  const handleCompletion = () => {
    console.log("fdf");
  };
  const getSchoolThemeBySchoolId = async (schoolId) => {
    try {
      const res = await axios.get(`/api/v1/theme/${schoolId}`);
      setTheme(res.data);
    } catch (error) {
      if (error.response.status === 404) {
        setTheme(null);
        setPageLoading(false);
      }
      console.log(error.response.data.errors[0].msg);
      return null;
    }
  };
  const getSchoolLandingPageContents = async (schoolName) => {
    setPageLoading(true);
    const school = await getSchoolBySchoolName(schoolName);
    if (school) {
      setDocumentTitle(school);
      await getSchoolThemeBySchoolId(school._id);
    }
    setPageLoading(false);
  };
  const validateWebinar = async () => {
    setIsLoading(true);

    try {
      let res = await axios.get(`/api/v1/livewebinar/watch/${roomid}`);
      if (res) {
        setIsLoading(false);
        console.log(res);
        console.log(res.data);
        setTitle(res.data.title);
        setPresenterName(`${res.data.firstname} ${res.data.lastname}`);
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
    if (chatMessage !== null) {
      socket.emit(
        "message",
        {
          user: watcherUsername || 1,
          msg: chatMessage,
          timeStamp: Date.now(),
          type: "text",
        },
        roomid
      );
      setDefaultChat([
        ...defaultChat,
        {
          user: watcherUsername || 1,
          msg: chatMessage,
          timeStamp: Date.now(),
          type: "text",
        },
      ]);
    }
    setChatMessage("");
  };

  const handleKeyDown = (event) => {
    if (event.keyCode === 13) {
      sendMessage();
    }
  };
  const handleUniqueSubmission = (result, type, value) => {
    console.log("first", value);
    setAnswers([]);
    socket.emit("special submit", type, result, roomid, watcherUsername, value);

    let newSub = { ...submitStatusHolder, [value]: true };
    setSubmitStatusHolder(newSub);
  };

  // const handleSpecialSubmit = (result, type, index) => {
  //   socket.emit("special submit", type, result, roomid, watcherUsername);
  // };
  // const convertToSeconds = (value, unit) => {
  //   let seconds = parseFloat(value);

  //   switch (unit) {
  //     case "secs":
  //       break;
  //     case "min":
  //       seconds *= 60;
  //       break;
  //     case "hour":
  //       seconds *= 3600;
  //       break;
  //     default:
  //       break;
  //   }

  //   return seconds;
  // };
  useEffect(() => {
    socket.on("message", (message) => {
      console.log(message);

      setDefaultChat([...defaultChat, { ...message, submitted: false }]);
    });
  }, [defaultChat, roomid]);
  function convertArrayToObject(array) {
    const result = {};

    // Iterate over the array elements
    for (let i = 0; i < array.length; i++) {
      const key = array[i];
      const value = i === 0 ? 1 : 0; // Set the value to 1 for the first element, 0 for the rest

      result[key] = value; // Assign the key-value pair to the result object
    }

    return result;
  }
  useEffect(() => {
    socket.on("updatedPollResult", (updatedResults, questionControl) => {
      let newResultArray = [];

      if (pollResults.hasOwnProperty(questionControl)) {
        newResultArray = [...pollResults[questionControl], ...updatedResults];
      } else {
        newResultArray = [...updatedResults];
      }

      let newResultHolder = {
        ...pollResults,
        [questionControl]: newResultArray,
      };

      setPollResults(newResultHolder);
    });
    return () => {
      socket.off("updatedPollResult");
      // socket.off("timerTick");
      // socket.off("timerEnded");
      // socket.off("timerError");
    };
  }, [roomid, pollResults]);

  useEffect(() => {
    socket.on("broadcaster", () => {
      console.log("broadcaster returned");
      // setReconnect("reconnect");
      // start reconnecting loading
      // setReconnectLoading(true);
      setDisconnect(false);
      const NewPeer = new Peer();
      NewPeer.on("open", (user) => {
        console.log("peer created");
        socket.emit("watcher", roomid, user);
      });
      NewPeer.on("call", (call) => {
        // stop reconnecting loading
        setReconnectLoading(false);

        console.log("call incoming");
        call.answer();
        call.on("stream", (userVideoStream) => {
          addVideoStream(userVideoStream);
        });
      });
    });
  }, [roomid]);

  useEffect(() => {
    socket.on("broadcaster", () => {
      console.log("broadcaster returned");
    });
  },[roomid]);

  useEffect(() => {
    socket.on("screenSharingStatus", (status) => {
      setScreenSharing(status);
      let newDummyStream = createBlankVideoStream();
      if (status) {
        console.log("ssssss", currentPeer, peerRef.current);
        peerRef.current.on("call", (call) => {
          console.log(call);
          call.answer(newDummyStream);
          call.on("stream", (remoteStream) => {
            console.log("Received screen sharing stream");
            // Handle the received screen sharing stream
            addVideoStream(remoteStream);
          });
        });
      } else {
        console.log(status);
        peerRef.current.on("call", (call) => {
          console.log(call);
          call.answer(newDummyStream);
          call.on("stream", (remoteStream) => {
            console.log("stop screen sharing stream");
            // Handle the received screen sharing stream
            addVideoStream(remoteStream);
          });
        });
      }
    });
    return () => {
      socket.off("screenSharingStatus");
    };
  }, [roomid, screenSharing, currentPeer]);

  let newDummyStream = createBlankVideoStream();

  // peerRef.current?.on("call", (call) => {
  //   console.log(call);
  //   call.answer(newDummyStream);
  //   call.on("stream", (remoteStream) => {
  //     console.log("Received screen sharing stream",screenSharing);
  //     // Handle the received screen sharing stream
  //     // addVideoStream(remoteStream);
  //   });
  // });

  useEffect(() => {
    socket.on("timerStarted", (questionControl, duration) => {
      console.log("stimer");
      let newTimeHolder = {
        ...timerHolder,
        [questionControl]: {
          duration,
          remainingTime: duration,
        },
      };
      setTimerHolder(newTimeHolder);
    });
    return () => {
      socket.off("timerStarted");
      // socket.off("timerTick");
      // socket.off("timerEnded");
      // socket.off("timerError");
    };
  }, [roomid]);

  useEffect(() => {
    socket.on("timerTick", (questionControl, remainingTime) => {
      console.log("first");
      console.log(timerHolder);
      if (timerHolder[questionControl]) {
        let newTimeHolder = {
          ...timerHolder,
          [questionControl]: {
            ...timerHolder[questionControl],
            remainingTime,
          },
        };
        setTimerHolder(newTimeHolder);
      }
    });
    return () => {
      // socket.off("timerStarted");
      socket.off("timerTick");
      // socket.off("timerEnded");
      // socket.off("timerError");
    };
  }, [roomid, timerHolder]);

  function createBlankVideoStream() {
    const canvas = Object.assign(document.createElement("canvas"), {
      width: 1,
      height: 1,
    });
    const context = canvas.getContext("2d");
    context.fillRect(0, 0, canvas.width, canvas.height);

    const stream = canvas.captureStream();
    return stream;
  }
  useEffect(() => {
    socket.on("screenPeer", (data) => {
      console.log("screen peer recieved");

      // myPeer.destroy();
      // currentPeer?.destroy();

      const screenPeer = new Peer();

      screenPeer.on("open", (user) => {
        console.log("screen peer created");
        // find a way to delete current stream

        const blankStream = createBlankVideoStream();
        console.log(blankStream);
        const call = screenPeer.call(data, blankStream);
        call.on("stream", (remoteStream) => {
          // Add the remote stream to the video element
          console.log("remote stream should be the screen display ");

          addVideoStream(remoteStream);
        });
      });
    });
  }, [roomid]);

  useEffect(() => {
    socket.on("end-stream", () => {
      console.log("broadcaster left");

      // setDisconnect(true);
      // myPeer.destroy();
    });
  }, [roomid]);
  useEffect(() => {
    socket.on("user-disconnected", (userId, roomSize) => {
      setAttendees(roomSize);
    });
  });

  useEffect(() => {
    socket.on("broadcaster-disconnected", () => {
      console.log("broadcaster left");
      setDisconnect(true);
    });
  }, [roomid]);
  useEffect(() => {
    socket.on("special close", (index) => {
      const updatedChat = defaultChat.filter((item, i) => i !== index);
      setDefaultChat(updatedChat);
      const updatedStatusHolder = { ...submitStatusHolder };
      delete updatedStatusHolder.index;
      setSubmitStatusHolder(updatedStatusHolder);
      console.log("special close");
    });
  });
  useEffect(() => {
    if (schoolname?.length > 0) {
      getSchoolLandingPageContents(schoolname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schoolname]);
  // const myPeer = new Peer({ videoCodec: "h264" });

  useEffect(() => {
    const initializePeer = async () => {
      const peerInstance = new Peer();
      setCurrentPeer(peerInstance);
      peerRef.current = peerInstance;

      peerInstance.on("open", (peerId) => {
        // socket.emit("join", peerId);
        socket.emit("watcher", roomid, peerId);
      });

      // socket.on("screenSharingStatus", (status) => {
      //   setScreenSharing(status);
      // });

      // peerInstance.on("call", (call) => {
      //   const blankStream = createBlankVideoStream();

      //   call.answer(blankStream);
      //   call.on("stream", (remoteStream) => {
      //     console.log(" ssfsd")

      //     addVideoStream(remoteStream);

      //   });
      //   // navigator.mediaDevices
      //   //   .getUserMedia({ video: true, audio: true })
      //   //   .then((stream) => {
      //   //     call.answer(stream);
      //   //     call.on("stream", (remoteStream) => {
      //   //       // Handle the incoming stream
      //   //     });
      //   //   })
      //   //   .catch((error) => {
      //   //     console.error("Error accessing media devices:", error);
      //   //   });
      // });
    };

    initializePeer();

    return () => {
      currentPeer?.destroy();
    };
  }, [roomid, trigger]);

  const initiateCall = (peerId) => {
    if (currentPeer) {
      const blankStream = createBlankVideoStream();
      const call = currentPeer.call(peerId, blankStream);

      call.on("stream", (remoteStream) => {
        console.log("first");
        addVideoStream(remoteStream);

        // Handle the incoming stream
      });
    }
  };

  useEffect(() => {
    socket.on("watcher", (userId, roomSize) => {
      setAttendees(roomSize);
    });
  });

  useEffect(() => {
    socket.on("join stream", (roomSize, peerId) => {
      console.log("first");
      // Handle the join stream event
      console.log(
        `Received join stream event with room size ${roomSize} and peerId ${peerId}`
      );
      initiateCall(peerId);
    });

    return () => {
      socket.off("join stream");
    };
  }, [roomid, currentPeer]);

  useEffect(() => {
    socket.on("for your eyes only", (roomSize) => {
      setAttendees(roomSize);
    });
  });

  // useEffect(() => {
  //   myPeer.on("call", (call) => {
  //     console.log("call incoming");
  //     call.answer();
  //     call.on("stream", (userVideoStream) => {
  //       addVideoStream(userVideoStream);
  //     });
  //   });
  // }, [roomid]);

  useEffect(() => {
    socket.on("returnPeer", () => {
      const myPeer = new Peer({ videoCodec: "h264" });

      myPeer.on("open", (user) => {
        console.log("peer created");
        socket.emit("watcher", roomid, user);
        setReconnectLoading(true);
      });
      myPeer.on("call", (call) => {
        // stop reconnecting loading
        setReconnectLoading(false);

        console.log("call incoming");
        call.answer();
        call.on("stream", (userVideoStream) => {
          addVideoStream(userVideoStream);
        });
      });
    });
  }, [roomid]);

  function addVideoStream(stream) {
    const video = myVideoRef.current;
    if (video) {
      video.srcObject = stream;
      video.addEventListener("loadedmetadata", () => {
        video.play();
      });
    }
  }

  useEffect(() => {
    validateWebinar();
  }, []);

  useEffect(() => {
    getUserName();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [defaultChat]);
  return (
    <div className="dashboard-layout">
      <Container fluid>
        <Row>
          <Col className="page-actions__col">
            <div className="live-webinar">
              <div className="stream-webinar-content watch-webinar-content">
                <div
                  className="page-title"
                  style={{
                    backgroundColor: theme?.themestyles.primarybackgroundcolor,
                    color: theme?.themestyles.primarytextcolor,
                  }}
                >
                  <div className="time-constraints">
                    <div
                      className="time-tracker"
                      style={{
                        color: theme?.themestyles.primarytextcolor,
                      }}
                    >
                      <p
                        style={{
                          color: theme?.themestyles.primarytextcolor,
                        }}
                      >
                        Time Remaining
                      </p>
                      <p>00:00:00</p>
                    </div>

                    <Button
                      className="page-title_cta-btn"
                      onClick={() => {
                        handleExitStream();
                      }}
                    >
                      End Webinar &nbsp; <i className="fa fa-times"></i>
                    </Button>
                  </div>
                  <div
                    className="page-title__text"
                    style={{
                      color: theme?.themestyles.primarytextcolor,
                    }}
                  >
                    {isLoading ? "..." : title}
                    <p style={{ margin: "0" }}>
                      {isLoading ? "..." : presenterName}
                    </p>
                  </div>
                </div>
                <div className="live-webinar-watch">
                  <div className="watch-left">
                    {/* <div id="video-grid" ref={videoGridRef}> */}
                    {reconnectLoading ? (
                      <div className="reconnect-loading">
                        <p>Tutor reconnecting</p>
                        <Spinner />
                      </div>
                    ) : (
                      <div>
                        {disconnect ? (
                          <div
                            className="video-background"
                            style={{ height: "50vh" }}
                          >
                            <div className="broadcaster-disconnected reconnect-loading">
                              <p> Broadcaster Disconnected</p>
                            </div>
                          </div>
                        ) : (
                          <div className="video-background">
                            <video
                              ref={myVideoRef}
                              muted
                              style={{ width: "100%" }}
                            />
                          </div>
                        )}
                      </div>
                    )}
                    <Card className="presenter-controls-wrapper">
                      {" "}
                      <div
                        className="presenter-controls pc-top"
                        style={{
                          backgroundColor:
                            theme?.themestyles.primarybackgroundcolor,
                          color: theme?.themestyles.primarytextcolor,
                        }}
                      >
                        {formattedDate} | Attendies ({attendees}){" "}
                      </div>
                      <div
                        className="presenter-controls  pc-bottom watcher-pc"
                        style={{
                          backgroundColor:
                            theme?.themestyles.primarybackgroundcolor,
                          color: theme?.themestyles.primarytextcolor,
                        }}
                      >
                        <div className="control-object more">
                          <i className="fa fa-ellipsis-h"></i>

                          <p>More</p>
                        </div>
                        <div
                          className="control-object"
                          // onClick={() => {
                          //   setAudioVisuals({
                          //     audio: !audioVisuals.audio,
                          //    video:audioVisuals.video
                          //   });
                          // }}
                        >
                          <i
                            className="fas fa-microphone"
                            // style={
                            //   !audioVisuals.audio
                            //     ? {
                            //         background: "#cecece",
                            //         color: "#888",
                            //       }
                            //     : null // No additional style for the active state
                            // }
                          ></i>

                          <p>Mic</p>
                        </div>
                        <div className="control-object">
                          <i className="fas fa-video"></i>
                          <p>Webcam</p>
                        </div>

                        <div
                          className="control-object"
                          onClick={() => {
                            handleExitStream();
                          }}
                        >
                          <i className="fas fa-times" style={{ color: "red" }}>
                            {" "}
                          </i>

                          <p>Exit</p>
                        </div>
                      </div>
                    </Card>
                  </div>

                  <div className="chat-box">
                    <div className="chat-interface">
                      {defaultChat.map((singleChat, index) => {
                        return singleChat.type === "quiz" ? (
                          <div
                            className="inchat-poll   inchat-quiz"
                            style={{
                              backgroundColor:
                                theme?.themestyles.primarybackgroundcolor,
                              color: theme?.themestyles.primarytextcolor,
                            }}
                          >
                            <div
                              className="top"
                              style={{
                                backgroundColor:
                                  theme?.themestyles.secondarybackgroundcolor,
                                color:
                                  theme?.themestyles.primarytextcolor || "#fff",
                              }}
                            >
                              <span style={{ color: "#fff" }}>
                                Pop Quiz{" "}
                                <i className="fas fa-book-open poll"></i>
                              </span>
                              <p>
                                {Number(
                                  timerHolder[singleChat.questionControl]
                                    ?.remainingTime
                                )}
                              </p>
                              <CountdownTimer
                                // duration={convertToSeconds(
                                //   singleChat.duration?.durationValue,
                                //   singleChat.duration?.durationUnit
                                // )}
                                duration={
                                  Number(
                                    timerHolder[singleChat.questionControl]
                                      ?.remainingTime
                                  )
                                    ? Number(
                                        timerHolder[singleChat.questionControl]
                                          ?.remainingTime
                                      )
                                    : 0
                                }
                                onCompletion={handleCompletion}
                                style={{ color: "#fff" }}
                              />
                            </div>

                            <div className="bottom">
                              {submitStatusHolder[
                                singleChat.questionControl
                              ] ? (
                                <p>Submitted!!!</p>
                              ) : (
                                singleChat.quizHolder.map(
                                  (item, index, arr) => {
                                    // return submitStatusHolder[
                                    //   singleChat.questionControl
                                    // ] ? (
                                    //   <p>Submitted</p>
                                    // ) : (
                                    return (
                                      <div
                                        className="single-question-holder"
                                        key={index}
                                        style={{
                                          display:
                                            index + 1 === currentQuestion ||
                                            arr.length === 1
                                              ? "block"
                                              : "none",
                                        }}
                                      >
                                        <p>{item.question}</p>
                                        <ul
                                          className="question-options "
                                          type="A"
                                        >
                                          {item.options.map((option, index) => {
                                            return (
                                              <li
                                                key={index}
                                                style={{
                                                  listStyleType:
                                                    answers[
                                                      currentQuestion - 1
                                                    ] ===
                                                    String.fromCharCode(
                                                      65 + index
                                                    )
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

                                          {index + 1 >= arr.length ||
                                          arr.length === 1 ? (
                                            ""
                                          ) : (
                                            <Button
                                              onClick={() => {
                                                setCurrentQuestion(
                                                  currentQuestion + 1
                                                );
                                              }}
                                            >
                                              Next {arr.length}
                                            </Button>
                                          )}
                                          {submitStatusHolder[
                                            singleChat.questionControl
                                          ] ? (
                                            <Button disabled>Submitted</Button>
                                          ) : (
                                            // <Button
                                            //   onClick={() => {
                                            //     handleUniqueSubmission(
                                            //       answers,
                                            //       "quiz",
                                            //       singleChat.questionControl
                                            //     );
                                            //   }}
                                            // >
                                            //   Unique Submission
                                            // </Button>
                                            <Button
                                              onClick={() => {
                                                handleUniqueSubmission(
                                                  answers,
                                                  "quiz",
                                                  singleChat.questionControl
                                                );
                                              }}
                                            >
                                              Submit
                                            </Button>
                                          )}
                                          {/* {submittedObject[index] ? (
                                        <Button disabled>Submitted</Button>
                                      ) : (
                                        <Button
                                          onClick={() => {
                                            handleSpecialSubmit(
                                              answers,
                                              "quiz"
                                            );
                                            setSubmitedObject((prevState) => ({
                                              ...prevState,
                                              [index]: true,
                                            }));
                                            console.log(
                                              answers,
                                              submittedObject
                                            );
                                          }}
                                        >
                                          Submit
                                        </Button>
                                      )} */}
                                        </div>
                                      </div>
                                    );
                                  }
                                )
                              )}
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
                            {singleChat.type === "poll" ? (
                              <div
                                className="inchat-poll"
                                style={{
                                  backgroundColor:
                                    theme?.themestyles.primarybackgroundcolor,
                                  color: theme?.themestyles.primarytextcolor,
                                }}
                              >
                                <div
                                  className="top"
                                  style={{
                                    backgroundColor:
                                      theme?.themestyles
                                        .secondarybackgroundcolor,
                                    color: theme?.themestyles.primarytextcolor,
                                  }}
                                >
                                  <span>
                                    Poll <i className="fas fa-poll poll"></i>
                                  </span>
                                </div>
                                <div className="bottom">
                                  {pollResults[singleChat.questionControl] ? (
                                    ""
                                  ) : (
                                    <Progress
                                      max={
                                        Number(
                                          timerHolder[
                                            singleChat.questionControl
                                          ]?.duration
                                        )
                                          ? `${Number(
                                              timerHolder[
                                                singleChat.questionControl
                                              ]?.duration
                                            )}`
                                          : "0"
                                      }
                                      value={
                                        Number(
                                          timerHolder[
                                            singleChat.questionControl
                                          ]?.remainingTime
                                        )
                                          ? Number(
                                              timerHolder[
                                                singleChat.questionControl
                                              ]?.remainingTime
                                            )
                                          : 0
                                      }
                                    />
                                  )}
                                  <p>{singleChat.title}</p>
                                  <div className="poll-options">
                                    {/* add POLL RES HERES */}
                                    {pollResults[singleChat.questionControl] ? (
                                      <Poll
                                        pollOptions={singleChat.options}
                                        pollResult={
                                          pollResults[
                                            singleChat.questionControl
                                          ]
                                            ? pollResults[
                                                singleChat.questionControl
                                              ]
                                            : []
                                        }
                                        // pollResult={[submitted[singleChat.questionControl]]}
                                      />
                                    ) : (
                                      <ul>
                                        {singleChat.options.map(
                                          (option, index) => {
                                            return (
                                              <li
                                                key={index}
                                                style={{
                                                  listStyleType:
                                                    pollAnswerHolder[
                                                      singleChat.questionControl
                                                    ] ===
                                                    String.fromCharCode(
                                                      65 + index
                                                    )
                                                      ? "disc"
                                                      : "circle",
                                                }}
                                                onClick={() =>
                                                  handlePollOptionClick(
                                                    index,
                                                    singleChat.questionControl
                                                  )
                                                }
                                              >
                                                {option}
                                              </li>
                                            );
                                          }
                                        )}
                                      </ul>
                                    )}
                                  </div>
                                  {/* {submitted ? ( */}
                                  {submitted[singleChat.questionControl] ? (
                                    <Button disabled>Submitted</Button>
                                  ) : (
                                    <Button
                                      onClick={() => {
                                        handlePollSubmit(
                                          singleChat.questionControl
                                        );
                                        // handleSpecialSubmit(
                                        //   pollAnswers,
                                        //   "poll",
                                        //   index
                                        // );
                                      }}
                                    >
                                      Submit
                                    </Button>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "flex-end",
                                }}
                              >
                                <p
                                  style={{
                                    marginBottom: "0",
                                    alignSelf:
                                      singleChat.user === watcherUsername
                                        ? ""
                                        : "flex-start",
                                  }}
                                >
                                  {singleChat.user}
                                </p>
                                <div
                                  key={index}
                                  className={`chat-bubble ${
                                    singleChat.user === watcherUsername
                                      ? "user-bubble"
                                      : ""
                                  }`}
                                >
                                  {singleChat.msg}
                                </div>
                              </div>
                            )}
                          </>
                        );
                      })}
                      <div ref={chatInterfaceRef} />
                    </div>
                    <div
                      className="chat-control"
                      style={{
                        backgroundColor:
                          theme?.themestyles.primarybackgroundcolor,
                        color: theme?.themestyles.primarytextcolor,
                      }}
                    >
                      {showEmojiPicker && (
                        // <Picker
                        //
                        // />
                        <div
                          className="emoji-wrapper"
                          style={{
                            position: "absolute",
                            bottom: "90px",

                            width: "100%",
                          }}
                        >
                          <Picker
                            previewPosition="none"
                            showPreview="false"
                            data={data}
                            onClickOutside={() => {
                              setShowEmojiPicker(false);
                            }}
                            // onEmojiSelect={()=>{console.log("first")}}
                            onEmojiSelect={(emoji) => {
                              handleSelectEmoji(emoji);
                            }}
                            perLine="7"
                          />
                        </div>
                      )}
                      <div
                        className="action-wrapper"
                        style={{ justifyContent: "center" }}
                        onClick={() => {
                          handleToggleEmojiPicker();
                        }}
                      >
                        <img src={smiley} alt="emoji" />
                      </div>
                      <input
                        value={chatMessage}
                        onChange={(e) => {
                          setChatMessage(e.target.value);
                          console.log(e.target.value);
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message"
                        style={{
                          width: "auto",
                          marginRight: ".5rem",
                          marginLeft: ".5rem",
                        }}
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

const mapStateToProps = (state) => ({
  user: state.auth.user,
  userAuthenticated: state.auth.authenticated,
  schoolname: state.subdomain,
});

const mapDispatchToProps = (dispatch) => ({
  getLoggedInUser: () => dispatch(loadUser()),
});

export default connect(mapStateToProps, mapDispatchToProps)(WatchStream);
