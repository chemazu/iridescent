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

  const chatInterfaceRef = useRef(null);
  const [title, setTitle] = useState("");
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [presenterName, setPresenterName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [chatMessage, setChatMessage] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [answers, setAnswers] = useState([]);
  const [timerHolder, setTimerHolder] = useState({});
  const [pollAnswerHolder, setPollAnswerHolder] = useState([]);
  // const [submitStatusHolder, setSubmitStatusHolder] = useState(false);
  const [defaultChat, setDefaultChat] = useState([]);
  const [watcherUsername, setWatcherUsername] = useState("");
  const [school, setSchool] = useState(null);
  const [disableVideoStream, setDisableVideoStream] = useState(null);

  const [pageLoading, setPageLoading] = useState(true);
  const [presenterAvatar, setPresenterAvatar] = useState(
    "http://www.gravatar.com/avatar/0a97ede75643b8da8e5174438a9f7a3c?s=250&r=pg&d=mm"
  );

  const [reconnectLoading, setReconnectLoading] = useState(false);
  const [attendees, setAttendees] = useState(true);
  const [theme, setTheme] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [specialChat, setSpecialChat] = useState([]);

  const [pollResults, setPollResults] = useState(null);
  const [waiting, setWaiting] = useState(false);
  const [disconnect, setDisconnect] = useState(false);
  const [screenSharing, setScreenSharing] = useState(false);
  const [webinarRoomTimer, setWebinarRoomTimer] = useState(null);

  if (localStorage.getItem("studentToken")) {
    setAuthToken(localStorage.getItem("studentToken"));
  }
  const handleToggleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };
  if (localStorage.getItem("studentToken")) {
    setAuthToken(localStorage.getItem("studentToken"));
  }

  function addVideoStream(stream) {
    const video = myVideoRef.current;
    if (video) {
      video.srcObject = stream;
      video.addEventListener("loadedmetadata", () => {
        video.play();
      });
    }
  }

  var currentDate = new Date();
  var options = { day: "numeric", month: "long", year: "numeric" };

  var formattedDate = currentDate.toLocaleString("en-US", options);

  const getUserName = async () => {
    try {
      let res = await axios.get("/api/v1/livewebinar/studentdetails/");
      setWatcherUsername(res.data.username);
    } catch (error) {
      console.log(error);
    }
  };
  //
  const toggleVideo = () => {
    const videoTracks = myVideoRef.current.srcObject.getVideoTracks();

    videoTracks.forEach((track) => {
      track.enabled = !isVideoEnabled;
    });
    setIsVideoEnabled(!isVideoEnabled);
  };

  const toggleAudio = () => {
    const audioTracks = myVideoRef.current.srcObject.getAudioTracks();

    if (audioTracks.length > 0) {
      audioTracks.forEach((track) => {
        track.enabled = !isAudioEnabled;
      });
      setIsAudioEnabled(!isAudioEnabled);
    } else {
      // Handle the case when there are no audio tracks in the stream
      console.log("No audio tracks found");
    }
  };

  const handleOptionClick = (index) => {
    // here sets the settings for answers
    const newAnswers = [...answers];
    newAnswers[currentQuestion - 1] = String.fromCharCode(65 + index);
    setAnswers(newAnswers);
  };
  const handlePollSubmit = () => {
    setSubmitted(true);

    socket.emit(
      "special submit",
      "poll",
      pollAnswerHolder,
      roomid,
      watcherUsername
    );
  };
  const handlePollOptionClick = (index) => {
    let newAnswerHolder = [String.fromCharCode(65 + index)];
    setPollAnswerHolder(newAnswerHolder);
  };

  const handleExitStream = () => {
    // Perform any necessary actions before exiting the stream
    // For example, stop the video stream, disconnect from the peer, etc.
    // check if they are video streams avalilbe
    socket.emit("watcher-exit", roomid);

    if (myVideoRef.current) {
      let videoTracks = myVideoRef.current.srcObject.getVideoTracks();
      videoTracks.forEach((track) => (track.enabled = false));

      // Stop audio and video tracks
      let tracks = myVideoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());

      // Set video source object to null
      myVideoRef.current.srcObject = null;
    }

    // Stop all media tracks from the user media stream
    navigator.mediaDevices
      .getUserMedia({ audio: true, video: true })
      .then((stream) => {
        stream.getTracks().forEach((track) => track.stop());
      });

    if (currentPeer) {
      currentPeer.destroy();
      setCurrentPeer(null);
    }
    if (peerRef) {
      peerRef.current.destroy();
    }

    history.push("/");
  };
  const removeStream = () => {
    // Perform any necessary actions before exiting the stream
    // For example, stop the video stream, disconnect from the peer, etc.
    // check if they are video streams avalilbe
    // socket.emit("watcher-exit", roomid);

    // let videoTracks = myVideoRef.current.srcObject.getVideoTracks();
    // videoTracks.forEach((track) => (track.enabled = false));

    // // Stop audio and video tracks
    // let tracks = myVideoRef.current.srcObject.getTracks();
    // tracks.forEach((track) => track.stop());

    // Set video source object to null
    if (myVideoRef.current) {
      myVideoRef.current.srcObject = null;
    }

    // Stop all media tracks from the user media stream
    navigator.mediaDevices
      .getUserMedia({ audio: true, video: true })
      .then((stream) => {
        stream.getTracks().forEach((track) => track.stop());
      });

    if (currentPeer) {
      currentPeer.destroy();
      setCurrentPeer(null);
    }
    if (peerRef) {
      peerRef.current.destroy();
    }

    // history.push("/");
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
      console.log(error);
      return null;
    }
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
      console.log(error);
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

        setTitle(res.data.title);

        setPresenterName(`${res.data.firstname} ${res.data.lastname}`);
        setPresenterAvatar(res.data.avatar);
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
  // const sendMessage = () => {
  //   if (chatMessage !== null) {
  //     socket.emit(
  //       "message",
  //       {
  //         user: watcherUsername || 1,
  //         msg: chatMessage,
  //         timeStamp: Date.now(),
  //         type: "text",
  //       },
  //       roomid
  //     );
  //     setDefaultChat([
  //       ...defaultChat,
  //       {
  //         user: watcherUsername || 1,
  //         msg: chatMessage,
  //         timeStamp: Date.now(),
  //         type: "text",
  //       },
  //     ]);
  //   }
  //   setChatMessage("");
  // };
  const sendMessage = () => {
    if (chatMessage.trim() !== "") {
      // Check if the trimmed chatMessage is not empty
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
  const handleUniqueSubmission = (result, type) => {
    setAnswers([]);
    socket.emit("special submit", type, result, roomid, watcherUsername);

    setSubmitted(true);
  };
  useEffect(() => {
    socket.on("timerEnded", (questionControl, remainingTime) => {
      setTimerHolder({});
      handlePollSubmit();
      if (specialChat && specialChat.length > 0) {
        if (specialChat[0].type === "poll") {
          handlePollSubmit();
        }
        // check if they have submitted

        if (specialChat[0].type === "quiz") {
          handleUniqueSubmission(answers, "quiz");
        }
      } else {
        // Handle the case when specialChat is not defined or empty
      }
      // check if they have submitted

      // hanlePollQuizTimeOut();
    });
    return () => {
      socket.off("timerEnded");
    };
  }, [roomid, timerHolder]);
  useEffect(() => {
    socket.on("watcher-exit", (size) => {
      setAttendees(size);
    });

    return () => {
      socket.off("watcher-exit");
    };
  }, [roomid, attendees]);

  useEffect(() => {
    socket.on("message", (message) => {
      setDefaultChat([...defaultChat, { ...message, submitted: false }]);
    });
    return () => {
      socket.off("message");
    };
  }, [defaultChat, roomid]);
  useEffect(() => {
    socket.on("specialchat", (message) => {
      setSubmitted(false);
      setPollResults(null);
      setPollAnswerHolder([]);

      setSpecialChat([{ ...message, submitted: false }]);
    });
    return () => {
      socket.off("specialchat");
    };
  }, [defaultChat, roomid]);

  useEffect(() => {
    socket.on("no stream", () => {
      setWaiting(true);
    });
    return () => {
      socket.off("no stream");
    };
  }, [roomid, waiting]);

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
    socket.on("updatedPollResult", (updatedResults) => {
      setPollResults(updatedResults);
    });
    return () => {
      socket.off("updatedPollResult");
    };
  }, [roomid, pollResults]);

  useEffect(() => {
    socket.on("broadcaster", () => {
      peerRef.current.destroy();
      setDisconnect(false);
      setWaiting(false);
      const NewPeer = new Peer();
      NewPeer.on("open", (user) => {
        socket.emit("watcher", roomid, user);
      });

      setCurrentPeer(NewPeer);
      peerRef.current = NewPeer;
      NewPeer.on("call", (call) => {
        // stop reconnecting loading
        setReconnectLoading(true);

        call.answer();
        call.on("stream", (userVideoStream) => {
          setReconnectLoading(false);
          addVideoStream(userVideoStream);
        });
      });
    });
    return () => {
      socket.off("broadcaster");
    };
  }, [roomid, waiting]);

  useEffect(() => {
    socket.on("screenSharingStatus", (status) => {
      setScreenSharing(status);
      let newDummyStream = createBlankVideoStream();
      if (status) {
        peerRef.current.on("call", (call) => {
          call.answer(newDummyStream);
          call.on("stream", (remoteStream) => {
            addVideoStream(remoteStream);
          });
        });
      } else {
        peerRef.current.on("call", (call) => {
          navigator.mediaDevices
            .getUserMedia({ video: true, audio: true })
            .then((newStream) => {
              call.answer(newStream);
              call.on("stream", (remoteStream) => {
                // Handle the received screen sharing stream
                addVideoStream(remoteStream);
              });
            });
        });
      }
    });
    return () => {
      socket.off("screenSharingStatus");
    };
  }, [roomid, screenSharing]);

  useEffect(() => {
    socket.on("timerStarted", (duration) => {
      setTimerHolder({
        duration,
        remainingTime: duration,
      });
    });
    return () => {
      socket.off("timerStarted");
    };
  }, [roomid]);

  useEffect(() => {
    socket.on(
      "currentStatus",
      (roomSize, roomTimer, pollQuizHolder, broadcasterScreen) => {
        setAttendees(roomSize);
        setDisableVideoStream(broadcasterScreen);
        if (pollQuizHolder) {
          setSpecialChat([...defaultChat, ...pollQuizHolder]);
        }
        if (roomTimer) {
          setWebinarRoomTimer(roomTimer);
        }
      }
    );
    return () => {
      socket.off("currentStatus");
    };
  }, [defaultChat]);
  useEffect(() => {
    socket.on("roomTimerTick", (roomTimer) => {
      setWebinarRoomTimer(roomTimer);
      // console.log(roomTimer)
    });
    return () => {
      socket.off("roomTimerTick");
    };
  }, [roomid]);

  useEffect(() => {
    socket.on("timerTick", (remainingTime, a) => {
      if (timerHolder) {
        if (remainingTime === 0) {
          // handlePollSubmit(questionControl);
        }
        let newTimeHolder = {
          ...timerHolder,
          remainingTime,
        };

        setTimerHolder(newTimeHolder);
      }
    });
    return () => {
      socket.off("timerTick");
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
    socket.on("broadcaster-disconnected", () => {
      setDisconnect(true);
      setSpecialChat([]);
      removeStream();
    });
    return () => {
      socket.off("broadcaster-disconnected");
    };
  }, [roomid]);
  useEffect(() => {
    socket.on("special close", (index) => {
      setSpecialChat([]);
      setSubmitted(false);
    });
    return () => {
      socket.off("special close");
    };
  }, [roomid, specialChat]);
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
    };

    initializePeer();

    return () => {
      currentPeer?.destroy();
    };
  }, [roomid]);

  const initiateCall = (peerId) => {
    if (currentPeer) {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((newStream) => {
          const call = currentPeer?.call(peerId, newStream);
          call?.on("stream", (remoteStream) => {
            setWaiting(false);
            addVideoStream(remoteStream);

            // Handle the incoming stream
          });
        });
    }
  };

  useEffect(() => {
    socket.on("watcher", (userId, roomSize) => {
      setAttendees(roomSize);
    });
    return () => {
      socket.off("watcher");
    };
  });
  useEffect(() => {
    socket.on("disablevideo", (status) => {
      setDisableVideoStream(status);
    });

    return () => {
      socket.off("disablevideo");
    };
  }, [roomid, disableVideoStream]);
  useEffect(() => {
    socket.on("join stream", (roomSize, peerId) => {
      // Handle the join stream event

      initiateCall(peerId);
    });

    return () => {
      socket.off("join stream");
    };
  }, [roomid, currentPeer]);

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
            {waiting ? (
              <div className="waiting-div live-webinar">
                <div className="stream-webinar-content watch-webinar-content">
                  <div
                    className="page-title"
                    style={{
                      backgroundColor:
                        theme?.themestyles.primarybackgroundcolor,
                      color: theme?.themestyles.primarytextcolor,
                    }}
                  >
                    <div className="time-constraints"></div>
                    <div
                      className="page-title__text"
                      style={{
                        color: theme?.themestyles.primarytextcolor,
                      }}
                    >
                      {isLoading ? "..." : title}
                      <p style={{ margin: "0" }}>
                        {/* <Button onClick={startStream}>Join Webinar</Button> */}
                        {isLoading ? "..." : presenterName}
                      </p>
                    </div>
                  </div>
                  <div className="live-webinar-watch">
                    <div className="watch-left">
                      <div
                        className="video-background"
                        style={{ height: "50vh" }}
                      >
                        <div className="broadcaster-disconnected reconnect-loading">
                          <p>Waiting</p>

                          <img
                            src={presenterAvatar}
                            alt=""
                            style={{ borderRadius: "50%", width: "15%" }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="live-webinar">
                <div className="stream-webinar-content watch-webinar-content">
                  <div
                    className="page-title"
                    style={{
                      backgroundColor:
                        theme?.themestyles.primarybackgroundcolor,
                      color: theme?.themestyles.primarytextcolor,
                    }}
                  >
                    <div className="time-constraints">
                      {webinarRoomTimer && (
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
                          <CountdownTimer duration={webinarRoomTimer} />
                        </div>
                      )}

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
                        {/* <Button onClick={startStream}>Join Webinar</Button> */}
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

                                <img
                                  src={presenterAvatar}
                                  alt=""
                                  style={{ borderRadius: "50%", width: "15%" }}
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="video-background">
                              {!disableVideoStream && (
                                <div
                                  style={{
                                    position: "absolute",
                                    width: "100%",
                                    height: "100%",
                                    background: "#000",
                                    zIndex: "4",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    borderRadius: "10px",

                                  }}
                                >
                                  {" "}
                                  <img
                                    src={presenterAvatar}
                                    alt=""
                                    style={{
                                      borderRadius: "50%",
                                      width: "15%",
                                    }}
                                  />
                                </div>
                              )}
                              <video
                                ref={myVideoRef}
                                style={{ width: "100%" }}
                                muted={false}
                                typeof="video/mp4"
                              />
                            </div>
                          )}
                        </div>
                      )}
                      {disconnect ? (
                        ""
                      ) : (
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
                              onClick={toggleAudio}
                            >
                              <i
                                className="fas fa-microphone"
                                style={
                                  !isAudioEnabled
                                    ? {
                                        // background: "#cecece",
                                        color: "#888",
                                      }
                                    : null
                                  // No additional style for the active state
                                }
                              ></i>
                              <p>Mic</p>
                            </div>
                            <div
                              className="control-object"
                              onClick={toggleVideo}
                            >
                              <i
                                className="fas fa-video"
                                style={
                                  !isVideoEnabled
                                    ? {
                                        // background: "#cecece",
                                        color: "#888",
                                      }
                                    : null
                                  // No additional style for the active state
                                }
                              ></i>
                              <p>Webcam</p>
                            </div>

                            <div
                              className="control-object"
                              onClick={() => {
                                handleExitStream();
                              }}
                            >
                              <i
                                className="fas fa-times"
                                style={{ color: "red" }}
                              >
                                {" "}
                              </i>

                              <p>Exit</p>
                            </div>
                          </div>
                        </Card>
                      )}
                    </div>

                    {disconnect ? (
                      <div className="chat-box"></div>
                    ) : (
                      <div className="chat-box">
                        <div className="chat-interface">
                          <div className="chat-interface-text">
                            {defaultChat.map((singleChat, index) => {
                              return singleChat.type === "quiz" ? (
                                <></>
                              ) : (
                                <>
                                  {singleChat.type === "poll" ? (
                                    <></>
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
                          <div className="chat-interface-quiz">
                            {specialChat?.map((singleChat, index) => {
                              return singleChat.type === "quiz" ? (
                                <div
                                  className="inchat-poll   inchat-quiz"
                                  style={{
                                    backgroundColor:
                                      theme?.themestyles.primarybackgroundcolor,
                                    color:
                                      theme?.themestyles.secondarytextcolor,
                                  }}
                                >
                                  <div
                                    className="top"
                                    style={{
                                      backgroundColor:
                                        theme?.themestyles
                                          .secondarybackgroundcolor,
                                      color:
                                        theme?.themestyles.primarytextcolor ||
                                        "#fff",
                                    }}
                                  >
                                    <span style={{ color: "#fff" }}>
                                      Pop Quiz{" "}
                                      <i className="fas fa-book-open poll"></i>
                                    </span>

                                    <CountdownTimer
                                      // duration={convertToSeconds(
                                      //   singleChat.duration?.durationValue,
                                      //   singleChat.duration?.durationUnit
                                      // )}
                                      duration={
                                        Number(timerHolder.remainingTime)
                                          ? Number(timerHolder.remainingTime)
                                          : 0
                                      }
                                      onCompletion={() => {
                                        handleUniqueSubmission(answers, "quiz");
                                      }}
                                      style={{ color: "#fff" }}
                                    />
                                  </div>

                                  <div className="bottom">
                                    {submitted ? (
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
                                                  index + 1 ===
                                                    currentQuestion ||
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
                                                {item.options.map(
                                                  (option, index) => {
                                                    return (
                                                      <li
                                                        key={index}
                                                        style={{
                                                          listStyleType:
                                                            answers[
                                                              currentQuestion -
                                                                1
                                                            ] ===
                                                            String.fromCharCode(
                                                              65 + index
                                                            )
                                                              ? "disc"
                                                              : "circle",
                                                        }}
                                                        onClick={() =>
                                                          handleOptionClick(
                                                            index
                                                          )
                                                        }
                                                      >
                                                        {option}
                                                      </li>
                                                    );
                                                  }
                                                )}
                                              </ul>
                                              <div
                                                className="quiz-button-wrapper"
                                                style={{ padding: "0 7%" }}
                                              >
                                                {currentQuestion > 1 &&
                                                  currentQuestion <=
                                                    item.options.length && (
                                                    <Button
                                                      onClick={() => {
                                                        setCurrentQuestion(
                                                          currentQuestion - 1
                                                        );
                                                      }}
                                                      className="quiz-button prev"
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
                                                    className="quiz-button"
                                                  >
                                                    Next
                                                  </Button>
                                                )}
                                                {submitted ? (
                                                  <Button disabled>
                                                    Submitted
                                                  </Button>
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
                                                        "quiz"
                                                      );
                                                    }}
                                                    className="quiz-button"
                                                  >
                                                    Submit
                                                  </Button>
                                                )}
                                              </div>
                                            </div>
                                          );
                                        }
                                      )
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <>
                                  {singleChat.type === "poll" ? (
                                    <div
                                      className="inchat-poll"
                                      style={{
                                        backgroundColor:
                                          theme?.themestyles
                                            .primarybackgroundcolor,
                                        color:
                                          theme?.themestyles.primarytextcolor,
                                      }}
                                    >
                                      <div
                                        className="top"
                                        style={{
                                          backgroundColor:
                                            theme?.themestyles
                                              .secondarybackgroundcolor,
                                          color:
                                            theme?.themestyles.primarytextcolor,
                                        }}
                                      >
                                        <span
                                          style={{
                                            color: "#fff",
                                          }}
                                        >
                                          <i
                                            className="fas fa-poll poll"
                                            style={{
                                              color: "yellow",
                                            }}
                                          ></i>{" "}
                                          Poll
                                        </span>
                                      </div>
                                      <div className="bottom">
                                        {pollResults ? (
                                          ""
                                        ) : (
                                          <Progress
                                            max={`${singleChat.durationInSec}`}
                                            value={
                                              Number(timerHolder?.remainingTime)
                                                ? Number(
                                                    timerHolder?.remainingTime
                                                  )
                                                : 0
                                            }
                                          />
                                        )}
                                        <p>Question : </p>
                                        <p>{singleChat.title}</p>
                                        <div className="poll-options">
                                          {/* add POLL RES HERES */}
                                          {pollResults && submitted ? (
                                            <Poll
                                              pollOptions={singleChat.options}
                                              pollResult={
                                                pollResults ? pollResults : []
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
                                                          pollAnswerHolder[0] ===
                                                          String.fromCharCode(
                                                            65 + index
                                                          )
                                                            ? "disc"
                                                            : "circle",
                                                      }}
                                                      onClick={() =>
                                                        handlePollOptionClick(
                                                          index
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
                                        {submitted ? (
                                          <Button disabled>Voted</Button>
                                        ) : (
                                          <Button
                                            onClick={() => {
                                              handlePollSubmit();
                                              // handleSpecialSubmit(
                                              //   pollAnswers,
                                              //   "poll",
                                              //   index
                                              // );
                                            }}
                                            className="vote"
                                          >
                                            Vote
                                          </Button>
                                        )}
                                      </div>
                                    </div>
                                  ) : (
                                    <></>
                                  )}
                                </>
                              );
                            })}
                          </div>
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
                              sendMessage();
                            }}
                          >
                            Send
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
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
