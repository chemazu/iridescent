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
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "reactstrap";
import { connect } from "react-redux";
import { loadUser } from "../../../actions/auth";
import "../../../custom-styles/dashboard/live-webinar.css";
import { useParams, useHistory } from "react-router-dom";
import setDocumentTitle from "../../../utilities/setDocumentTitle";
import smiley from "../../../images/emojisvg.svg";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";

import setAuthToken from "../../../utilities/setAuthToken";
import Poll from "./Poll";
import { useStore } from "react-redux";
import videojs from "video.js";

function WatchStream({ schoolname }) {
  const { roomid } = useParams();
  let history = useHistory();
  let [currentPeer, setCurrentPeer] = useState(null);
  let [presenterPeer, setPresenterPeer] = useState(null);
  let [audioVisuals, setAudioVisuals] = useState({ video: true, audio: true });

  const myVideoRef = useRef();
  const videoRef = useRef(null);
  const screenRef = useRef(null);
  const screenPeerRef = useRef(null);

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
  const [defaultChat, setDefaultChat] = useState([]);
  const [watcherUsername, setWatcherUsername] = useState("");
  const [watcherUsernameInput, setWatcherUsernameInput] = useState("");
  const [school, setSchool] = useState(null);
  const [disableVideoStream, setDisableVideoStream] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [VideoFill, setVideoFill] = useState(false);
  const [vidStackSource, setVidStackSource] = useState("");
  // "https://stream.mux.com/VZtzUzGRv02OhRnZCxcNg49OilvolTqdnFLEqBsTwaxU/low.mp4"

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
  const [streamSource, setStreamSource] = useState(null);

  const playerRef = React.useRef(null);
  const screenPlayerRef = React.useRef(null);

  const handleAddStream = (stream) => {
    const pop = videoRef.current;

    // The Video.js player needs to be _inside_ the component el for React 18 Strict Mode.
    // if (pop) {
    // if (!playerRef.current) {
    //   const videoElement = document.createElement("video-js");
    //   videoElement.srcObject = stream;
    //   videoElement.classList.add("vjs-big-play-centered");

    //   videoRef.current.appendChild(videoElement);

    //   const player = (playerRef.current = videojs(videoElement, options, () => {
    //     videojs.log("player is ready");
    //     // onReady && onReady(player);
    //   }));
    //   player.autoplay(true);
    // } else {
    if (pop) {
      if (!playerRef.current) {
        const videoElement = document.createElement("video-js");
        videoElement.setAttribute("playsinline", true);
        videoElement.classList.add("vjs-big-play-centered");

        videoElement.srcObject = stream;

        videoRef.current.appendChild(videoElement);

        const player = (playerRef.current = videojs(
          videoElement,
          options,
          () => {
            videojs.log("player is ready");
            // onReady && onReady(player);
          }
        ));
        player.autoplay(true);
      } else {
        console.log("disconnect");
      }
    }
    // }

    /*  */
    else {
      console.log("firstyuyuy");
    }
    // You could update an existing player in the `else` block here
    // on prop change, for example:
  };
  const handleAddScreenStream = (stream) => {
    console.log("handleAddScreenStream");
    const pop = screenRef.current;
    if (pop) {
      if (!screenPlayerRef.current) {
        const videoElement = document.createElement("video-js");
        videoElement.setAttribute("playsinline", true);
        videoElement.srcObject = stream;
        videoElement.classList.add("vjs-big-play-centered");
        screenRef.current.appendChild(videoElement);
        const screenPlayer = (screenPlayerRef.current = videojs(
          videoElement,
          options,
          () => {
            videojs.log("screen player is ready");
          }
        ));
        screenPlayer.autoplay(true);
      }
    } else {
    }
  };

  const store = useStore();
  const appState = store.getState();
  const { student } = appState;
  const { authenticated } = student;

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
    setStreamSource(stream);
    if (video) {
      video.srcObject = stream;
      video.addEventListener("loadedmetadata", () => {
        video.play();
      });
    }
    // handleAddStream(stream);
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
    if (playerRef.current) {
      playerRef.current.muted(!audioVisuals?.audio);
    }
  }, [audioVisuals]);

  useEffect(() => {
    const peerInstance = new Peer();
    peerRef.current = peerInstance;
    peerInstance.on("open", (user) => {
      socket.emit("watcher", roomid, user);
    });
    const startClass = (peerId, stat) => {
      console.log("ksdsd", stat);
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((newStream) => {
          console.log(peerInstance, peerId, newStream);
          const call = peerInstance.call(peerId, newStream);
          console.log(call);
          call?.on("stream", (remoteStream) => {
            console.log("fish");
            handleAddStream(remoteStream);
            setWaiting(false);
          });
        });
    };
    socket.on("join stream", (roomSize, peerId, roomStatus) => {
      startClass(peerId, "join");
      setWaiting(false);
    });
    socket.on("broadcaster", (peerId) => {
      console.log(peerId);
      startClass(peerId, "broadcaster");
      setWaiting(false);
      setDisconnect(false);
    });

    return () => {
      peerInstance.destroy();
      socket.off("join stream");
      socket.off("broadcaster");
    };
  }, [roomid, waiting, disconnect]);
  const revertHandleAddScreenStream = () => {
    const pop = screenRef.current;

    if (pop) {
      // Check if there is an existing screenPlayer and remove it
      if (screenPlayerRef.current) {
        screenPlayerRef.current.dispose(); // Dispose of the videojs player
        screenPlayerRef.current = null;
      }

      // Clear any existing content in screenRef
      screenRef.current.innerHTML = "";
    } else {
      // Handle the case where 'pop' is falsy (e.g., screenRef doesn't exist)
      console.error("screenRef is not available");
    }
  };
  useEffect(() => {
    const screenInstance = new Peer();
    screenPeerRef.current = screenInstance;
    screenInstance.on("open", (user) => {});
    const startScreenSharing = (peerId, stat) => {
      console.log(stat);
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((newStream) => {
          console.log("foo");
          const call = screenInstance?.call(peerId, newStream);
          console.log(call);
          call?.on("stream", (remoteStream) => {
            console.log("start stream");
            handleAddScreenStream(remoteStream);
          });
        });
    };
    socket.on("join screen stream", (peerId) => {
      startScreenSharing(peerId, "enterace");

      console.log("screensharing available");
    });
    socket.on("startScreenSharing", (peerId) => {
      console.log("first");
      startScreenSharing(peerId, "screnn");
    });

    socket.on("stopScreenSharing", () => {
      console.log("stopScreenSharing available ");
      revertHandleAddScreenStream();
    });
    return () => {
      socket.off("screenSharingStatus");
    };
  }, [roomid]);

  useEffect(() => {
    socket.on("watcher-exit", (size) => {
      setAttendees(size);
    });

    return () => {
      socket.off("watcher-exit");
    };
  }, [roomid, attendees]);
  const colors = [
    "#c65e8e",
    "#c792ea",
    "#faa773",
    "#f37ffe",
    "#fe0017",
    "#fee700",
    "#200b72",
    "#240638",
    "#2cff28",
    "#fff6d5",
    "#96ffbe",
  ];
  function generateUserColor(username) {
    const index = username.charCodeAt(0) % colors.length;
    return colors[index];
  }
  useEffect(() => {
    socket.on("message", (message) => {
      const userExists = defaultChat.find((item) => item.user === message.user);
      let newMessage;
      if (userExists) {
        newMessage = { ...message, color: userExists.color };
      } else {
        let color = generateUserColor(message.user);
        newMessage = { ...message, color };
      }

      setDefaultChat([...defaultChat, { ...newMessage }]);
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
      console.log("no stream");
    });
    return () => {
      socket.off("no stream");
    };
  }, [roomid, waiting]);

  useEffect(() => {
    socket.on("updatedPollResult", (updatedResults) => {
      setPollResults(updatedResults);
    });
    return () => {
      socket.off("updatedPollResult");
    };
  }, [roomid, pollResults]);

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
      }
    );
    return () => {
      socket.off("currentStatus");
    };
  }, [defaultChat]);

  useEffect(() => {
    socket.on("broadcaster-disconnected", () => {
      setDisconnect(true);
      setWaiting(false);
      playerRef.current = null;

      setSpecialChat([]);
      // removeStream();
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
      <Modal isOpen={!authenticated && watcherUsername === ""}>
        <ModalHeader>Enter Username</ModalHeader>
        <ModalBody>
          <input
            placeholder="Input Username"
            style={{ width: "100%" }}
            value={watcherUsernameInput}
            onChange={(e) => {
              setWatcherUsernameInput(e.target.value);
            }}
          />
        </ModalBody>

        <ModalFooter>
          <Button
            type="button"
            onClick={() => {
              setWatcherUsername(watcherUsernameInput);
            }}
            style={{ borderRadius: "22px", border: "none" }}
            className={watcherUsernameInput === "" ? "" : "modal-button"}
          >
            Enter
          </Button>
        </ModalFooter>
      </Modal>
      <Container fluid>
        <Row>
          <Col className="page-actions__col">
            {/* {waiting && <p>dsd</p>} */}
            <div className="live-webinar watch-screen">
              <div className="stream-webinar-content watch-webinar-content">
                <div
                  className="page-title"
                  style={{
                    backgroundColor:
                      theme?.themestyles.secondarybackgroundcolor,
                    color: theme?.themestyles.navbartextcolor,
                  }}
                >
                  <div className="time-constraints">
                    <Button
                      className="page-title_cta-btn"
                      onClick={() => {
                        handleExitStream();
                      }}
                    >
                      Leave Class &nbsp; <i className="fa fa-times"></i>
                    </Button>
                  </div>

                  <div
                    className="page-title__text"
                    style={{
                      color: theme?.themestyles.navbartextcolor,
                    }}
                  >
                    <img src={presenterAvatar} alt={title || ""} />
                    <div>
                      <span style={{ fontWeight: "600", fontSize: "22px" }}>
                        {isLoading ? "..." : title}
                      </span>
                      <p style={{ margin: "0" }}>
                        {/* <Button onClick={startStream}>Join Webinar</Button> */}
                        {isLoading ? "..." : presenterName}
                      </p>
                    </div>
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
                      <>
                        <div
                          className="video-background-parent"
                          style={{
                            background: "yellow",
                          }}
                        >
                          {disconnect || waiting ? (
                            <div
                              className="video-background"
                              style={{ height: "50vh" }}
                            >
                              <div className="broadcaster-disconnected reconnect-loading">
                                {disconnect && <p> Broadcaster Disconnected</p>}
                                {waiting && <p>Waiting for Tutor</p>}
                                <img
                                  src={presenterAvatar}
                                  alt=""
                                  style={{
                                    borderRadius: "50%",
                                    width: "15%",
                                  }}
                                />
                              </div>
                            </div>
                          ) : (
                            <div
                              className="video-background"
                              style={{
                                background:
                                  "linear-gradient(0deg, rgba(2,0,36,1) 0%, rgba(0,212,255,1) 100%)",
                              }}
                            >
                              <div className="mobile-control mobile-header">
                                <div className="mobile-presenter-info">
                                  <img
                                    src={presenterAvatar}
                                    alt=""
                                    style={{
                                      borderRadius: "50%",
                                      width: "15%",
                                    }}
                                  />
                                  <p>{presenterName}</p>
                                </div>

                                <div className="room-info">
                                  <div>
                                    <i className="fa fa-eye" />
                                    {attendees}
                                  </div>
                                  <i
                                    onClick={() => {
                                      handleExitStream();
                                    }}
                                    className="fa fa-times"
                                  ></i>
                                </div>
                              </div>
                              <div
                                style={{
                                  position: "relative",
                                  maxHeight: "60vh",
                                  height: "auto",
                                  backgroundColor: "#000",
                                  borderRadius: "10px",
                                }}
                              >
                                <div>
                                  <div
                                    ref={videoRef}
                                    className={
                                      VideoFill ? "filled-video" : "empty"
                                    }
                                  ></div>
                                  <div ref={screenRef}></div>
                                </div>
                                {!audioVisuals?.video ||
                                  (false && (
                                    <div className="broadcaster-disconnected reconnect-loading no-video">
                                      <img
                                        src={presenterAvatar}
                                        alt=""
                                        style={{
                                          borderRadius: "50%",
                                          width: "15%",
                                        }}
                                      />
                                    </div>
                                  ))}
                              </div>
                            </div>
                          )}
                        </div>
                        {disconnect || waiting ? (
                          <></>
                        ) : (
                          <div
                            className="student-room-info desktop-control"
                            style={{
                              backgroundColor:
                                theme?.themestyles.secondarybackgroundcolor,
                              color: theme?.themestyles.navbartextcolor,
                            }}
                          >
                            <span className="date-span">{formattedDate}</span>
                            <span className="divider-span"></span>
                            <span>Attendees ({attendees - 1 || 1})</span>
                          </div>
                        )}
                      </>
                    )}
                    {/* {disconnect ? (
                        ""
                      ) : (
                        <Card className="presenter-controls-wrapper">
                          {" "}
                          <div
                            className="presenter-controls pc-top"
                            style={{
                              backgroundColor:
                                theme?.themestyles.secondarybackgroundcolor,
                              color: theme?.themestyles.navbartextcolor,
                            }}
                          >
                            {formattedDate} | Attendies ({attendees}){" "}
                          </div>
                          <div
                            className="presenter-controls  pc-bottom watcher-pc"
                            style={{
                              backgroundColor:
                                theme?.themestyles.secondarybackgroundcolor,
                              color: theme?.themestyles.navbartextcolor,
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
                      )} */}
                  </div>

                  {disconnect || waiting ? (
                    <div className="chat-box"></div>
                  ) : (
                    <div className="chat-box watcher-chat-box">
                      <div className="chat-interface">
                        <div className="chat-interface-text">
                          {defaultChat.map((singleChat, index) => {
                            return (
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "flex-end",
                                }}
                              >
                                <p
                                  className="watcher-username"
                                  style={{
                                    color: singleChat.color || "#fe0017",

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
                            );
                          })}
                          <div ref={chatInterfaceRef} />
                        </div>
                        <div className="chat-interface-quiz">
                          {specialChat?.map((singleChat, index) => {
                            return singleChat.type === "quiz" ? (
                              <div className="inchat-poll   inchat-quiz">
                                <div
                                  className="top"
                                  style={{
                                    backgroundColor:
                                      theme?.themestyles.navbarbackgroundcolor,
                                    color: theme?.themestyles.primarytextcolor,
                                  }}
                                >
                                  <span style={{ color: "#fff" }}>
                                    Pop Quiz{" "}
                                    <i className="fas fa-book-open poll"></i>
                                  </span>
                                </div>

                                <div className="bottom">
                                  {submitted ? (
                                    <p className="resource-question">
                                      Submitted!!!
                                    </p>
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
                                            <p className="resource-question">
                                              {item.question}
                                            </p>
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
                                                        fontWeight: 400,

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
                                              {submitted || false ? (
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
                                    // style={{
                                    //   backgroundColor:
                                    //     theme?.themestyles
                                    //       .secondarybackgroundcolor,
                                    //   color:
                                    //     theme?.themestyles.navbartextcolor,
                                    // }}
                                  >
                                    <div
                                      className="top"
                                      style={{
                                        backgroundColor:
                                          theme?.themestyles
                                            .navbarbackgroundcolor,
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
                                      <p className="resource-question">
                                        Question :{" "}
                                      </p>
                                      <p className="resource-question">
                                        {singleChat.title}
                                      </p>
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
                            theme?.themestyles.secondarybackgroundcolor,
                          color: theme?.themestyles.navbartextcolor,
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
                        <div
                          className="expand-wrapper"
                          onClick={() => {
                            setVideoFill(!VideoFill);
                          }}
                        >
                          <i
                            className="fa fa-expand"
                            aria-hidden="true"
                            style={{ color: "#fff" }}
                          ></i>
                        </div>

                        <textarea
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
