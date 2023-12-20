import React, { useEffect, useRef, useState } from "react";
import Peer from "peerjs";
import axios from "axios";
import socket from "../../../utilities/client-socket-connect";
import {
  Col,
  Container,
  Row,
  Button,
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
import uuid from "react-uuid";
import setAuthToken from "../../../utilities/setAuthToken";
import wave from "../../../images/wave.svg";

import Poll from "./Poll";
import { useStore } from "react-redux";
import videojs from "video.js";
import CustomTextArea from "./CustomTextArea";
import classroomAudio from "./audioEmitter";
import peerConfig from "./peerConfig";

function WatchStream({ schoolname }) {
  const { roomid } = useParams();
  let history = useHistory();

  const myVideoRef = useRef();
  const videoRef = useRef(null);
  const secondVideoRef = useRef(null);
  let studentSharePeerRef = useRef(null);

  const screenRef = useRef(null);
  const screenPeerRef = useRef(null);
  const secondScreenPlayer = useRef(null);
  const studentStream = useRef(null);
  const audioRef = useRef(null);
  const audioRefs = useRef({});

  const peerRef = useRef(null);
  const chatInterfaceRef = useRef(null);
  let [currentPeer, setCurrentPeer] = useState(null);
  let [submitQuizModal, setSubmitQuizModal] = useState(false);
  let [audioVisuals, setAudioVisuals] = useState({ video: true, audio: true });
  let [screenSharing, setScreenSharing] = useState(false);
  const [title, setTitle] = useState("");
  const [minimizedPoll, setMinimizedPoll] = useState(false);
  const [minimizedQuiz, setMinimizedQuiz] = useState(false);
  const [attendance, setAttendance] = useState(1);
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
  const [watcherAvatar, setWatcherAvatar] = useState(null);
  const [studentIp, setStudentIp] = useState("");
  const [watcherUsernameInput, setWatcherUsernameInput] = useState("");
  const [disableVideoStream, setDisableVideoStream] = useState(null);
  const [videoFill, setVideoFill] = useState(false);
  const [presenterAvatar, setPresenterAvatar] = useState(
    "http://www.gravatar.com/avatar/0a97ede75643b8da8e5174438a9f7a3c?s=250&r=pg&d=mm"
  );
  const [theme, setTheme] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [specialChat, setSpecialChat] = useState([]);
  const [pollResults, setPollResults] = useState(null);
  const [waiting, setWaiting] = useState(false);
  const [disconnect, setDisconnect] = useState(false);
  const [height, setHeight] = useState("40px");
  let [studentMic, setStudentMic] = useState(false);
  let [studentMicControl, setStudentMicControl] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [registeredUser, setRegisteredUser] = useState(false);
  const [attendanceList, setAttendanceList] = useState([]);

  const handleStartStudentAudio = () => {
    socket.emit("request audio", roomid);
  };
  const handleStopStudentAudio = () => {
    studentSharePeerRef.current.destroy();
    socket.emit("student audio over", roomid);
    setStudentMic(false);
    setStudentMicControl(false);
    // toggle audio
  };
  const handleTurnOnStudentAudio = () => {
    setStudentMicControl(true);

    socket.emit("on student audio", roomid);
  };
  const handleTurnOffStudentAudio = () => {
    setStudentMicControl(false);
    socket.emit("off student audio", roomid);
  };
  /* eslint-disable react-hooks/exhaustive-deps */
  const playerRef = React.useRef(null);
  const screenPlayerRef = React.useRef(null);

  const getUserId = (roomid) => {
    let userId = localStorage.getItem(roomid);
    if (!userId) {
      userId = uuid();
      localStorage.setItem(roomid, userId);
    }
    return userId;
  };
  const handleAddStream = (stream, audioStat) => {
    const pop = videoRef.current;

    if (pop) {
      if (!playerRef.current) {
        const videoElement = document.createElement("video-js");
        videoElement.setAttribute("playsinline", true);
        videoElement.classList.add("vjs-big-play-centered");
        videoElement.srcObject = stream;

        if (!audioStat.audio) {
          videoElement.muted = true; // Mute the video if audio is false
        }
        videoRef.current.appendChild(videoElement);
        const player = (playerRef.current = videojs(
          videoElement,
          options,
          () => {
            videojs.log("player is ready");
            // onReady && onReady(player);
          }
        ));
        player.muted(!audioStat.audio);

        player.autoplay(true);
      } else {
      }
    }
    // }

    /*  */
    else {
    }
    // You could update an existing player in the `else` block here
    // on prop change, for example:
  };
  const secondHandleAddStream = (stream, audioStat) => {
    const pop = secondVideoRef.current;
    if (pop) {
      if (!secondScreenPlayer.current) {
        const videoElement = document.createElement("video-js");
        videoElement.setAttribute("playsinline", true);
        videoElement.classList.add("vjs-big-play-centered");

        videoElement.srcObject = stream;
        if (!audioStat.audio) {
          videoElement.muted = true; // Mute the video if audio is false
        }

        secondVideoRef.current.appendChild(videoElement);

        const player = (secondScreenPlayer.current = videojs(
          videoElement,
          options,
          () => {
            videojs.log("player is ready");
            // onReady && onReady(player);
          }
        ));
        player.muted(!audioStat.audio);
        player.autoplay(true);
      }
    } else {
      /*  */
    }
    // You could update an existing player in the `else` block here
    // on prop change, for example:
  };
  const handleAddScreenStream = (stream) => {
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
        screenPlayer.muted(!audioVisuals.audio);
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

  var currentDate = new Date();
  var options = { day: "numeric", month: "long", year: "numeric" };

  var formattedDate = currentDate.toLocaleString("en-US", options);

  const getUserName = async () => {
    try {
      let res = await axios.get("/api/v1/livewebinar/studentdetails");
      if (res) {
        setWatcherUsername(res.data.username);
        console.log(res.data);
        localStorage.setItem(roomid, res.data.id);
        setWatcherAvatar(res.data.avatar);
        setRegisteredUser(true);
      }
    } catch (error) {
      console.log(error);
    }
  };
  //

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
    socket.emit("watcher-exit", roomid, getUserId(roomid));

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
    if (studentSharePeerRef.current) {
      studentSharePeerRef.current.destroy();
    }
    if (peerRef) {
      peerRef.current.destroy();
    }
    localStorage.removeItem(roomid);
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
      return res.data;
    } catch (error) {
      if (error.response.status === 404) {
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
      }
      console.log(error);
      return null;
    }
  };
  const getSchoolLandingPageContents = async (schoolName) => {
    const school = await getSchoolBySchoolName(schoolName);
    if (school) {
      setDocumentTitle(school);
      await getSchoolThemeBySchoolId(school._id);
    }
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
        setStudentIp(res.data.studentIp);
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
          img: watcherAvatar,
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
    setHeight("40px");
    setChatMessage("");
  };

  const handleKeyDown = (event) => {
    if (event.keyCode === 13) {
      event.preventDefault();
      sendMessage();
    }
  };

  const handleUniqueSubmission = (result, type) => {
    setAnswers([]);
    socket.emit("special submit", type, result, roomid, watcherUsername);

    setSubmitted(true);
  };

  useEffect(() => {
    if (playerRef.current && audioVisuals) {
      playerRef.current.muted(!audioVisuals.audio);
    }
    if (secondScreenPlayer.current && audioVisuals) {
      secondScreenPlayer.current.muted(!audioVisuals.audio);
    }
  }, [audioVisuals]);
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
  // useEffect(() => {
  //   const peerInstance = new Peer();
  //   peerRef.current = peerInstance;
  //   peerInstance.on("open", (user) => {
  //     socket.emit("watcher", roomid, user, getUserId(roomid));
  //   });
  //   const startClass = (peerId, stat, audioStat) => {
  //     navigator.mediaDevices
  //       .getUserMedia({ video: true, audio: true })
  //       .then((newStream) => {
  //         let call = peerInstance.call(peerId, newStream);
  //         // const call = peerInstance.call(peerId, fast);
  //         call?.on("stream", (remoteStream) => {
  //           handleAddStream(remoteStream, audioStat);

  //           setWaiting(false);
  //           secondHandleAddStream(remoteStream, audioStat);
  //         });
  //         call?.on("error", (error) => {
  //           console.error("Call error:", error);
  //         });
  //         // });
  //       });
  //   };

  //   socket.on("audio status", () => {});
  //   socket.on("join stream", (roomSize, peerId, roomStatus) => {
  //     setAudioVisuals(roomStatus);
  //     startClass(peerId, "join", roomStatus);
  //     setWaiting(false);
  //     setDisconnect(false);
  //   });
  //   socket.on("broadcaster", (peerId, roomStatus) => {
  //     startClass(peerId, "broadcaster");
  //     setWaiting(false);
  //     setDisconnect(false);
  //   });

  //   return () => {
  //     peerInstance.destroy();
  //     socket.off("join stream");
  //     socket.off("broadcaster");
  //   };
  // }, [roomid, waiting, disconnect]);

  useEffect(() => {


  //   const peer = new Peer({
  //     key: 'peerjs',
  //     host: 'yourHerokuHostName.com',
  //     port: 443,
  //     path: '/',
  //     secure: true,
  // })
    const peerInstance = new Peer( {
      host: "tuturlybeta.com",
      // port: 443, // Assuming your server uses HTTPS
      // port: 5000,
      port: 443,
      key: 'peerjs',
      path: "/peerjs",
      secure: true,

      // secure: true, // Use secure connection for deployment
    });

    peerRef.current = peerInstance;
    if (watcherUsername !== "") {
      console.log("wew");
      peerInstance.on("open", () => {
        console.log("watcher");
        socket.emit(
          "watcher",
          roomid,
          "user",
          getUserId(roomid),
          watcherUsername,
          watcherAvatar,
          registeredUser,
          studentIp
        );
      });
    }
    const handleBlockStudent = () => {
      peerInstance.disconnect();
    };
    const startClass = (peerId, stat, audioStat) => {
      console.log(stat);
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((newStream) => {
          let call = peerInstance.call(peerId, newStream);
          // const call = peerInstance.call(peerId, fast);
          call?.on("stream", (remoteStream) => {
            handleAddStream(remoteStream, audioStat);

            setWaiting(false);
            secondHandleAddStream(remoteStream, audioStat);
          });
          call?.on("error", (error) => {
            console.error("Call error:", error);
          });
          // });
        });
    };

    socket.on("audio status", () => {});

    socket.on("join stream", (roomSize, peerId, roomStatus) => {
      setAudioVisuals(roomStatus);
      startClass(peerId, "join", roomStatus);
      setWaiting(false);
      setDisconnect(false);
    });
    socket.on("blocked", () => {
      handleBlockStudent();
    });

    socket.on("broadcaster", (peerId, roomStatus) => {
      startClass(peerId, "broadcaster");
      setWaiting(false);
      setDisconnect(false);
    });

    return () => {
      peerInstance.destroy();
      socket.off("join stream");
      socket.off("broadcaster");
    };
  }, [roomid, waiting, disconnect, watcherUsername, registeredUser]);
  const attendanceCount = attendance || 1;

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
    // Send a heartbeat to the server periodically
    const heartbeatInterval = setInterval(() => {
      socket.emit("heartbeat", getUserId(roomid), roomid); // Replace 'yourUserId' with the actual user identifier
    }, 5000); // Send a heartbeat every 5 seconds (adjust as needed)

    socket.on("updateAttendance", (users) => {
      setAttendance(users);
    });

    // Clean up the event listener and heartbeat interval when the component unmounts
    return () => {
      socket.off("updateAttendance");
      clearInterval(heartbeatInterval);
    };
  }, [roomid]);
  useEffect(() => {
    const screenInstance = new Peer();
    screenPeerRef.current = screenInstance;
    screenInstance.on("open", (user) => {});
    const startScreenSharing = (peerId, stat) => {
      let newStream = createBlankVideoStream();
      const call = screenInstance?.call(peerId, newStream);
      call?.on("stream", (remoteStream) => {
        handleAddScreenStream(remoteStream);
      });
    };
    socket.on("join screen stream", (peerId) => {
      setScreenSharing(true);
      startScreenSharing(peerId, "enterace");
    });
    socket.on("startScreenSharing", (peerId) => {
      setScreenSharing(true);
      startScreenSharing(peerId, "screnn");
    });

    socket.on("stopScreenSharing", () => {
      setScreenSharing(false);

      revertHandleAddScreenStream();
    });
    return () => {
      socket.off("screenSharingStatus");
    };
  }, [roomid, audioVisuals]);

  useEffect(() => {
    socket.on("watcher-exit", (size) => {});

    return () => {
      socket.off("watcher-exit");
    };
  }, [roomid]);
  const colors = [
    "#128C7E", // Dark Teal
    "#D62246", // Dark Red
    "#F06D06", // Dark Orange
    "#485460", // Dark Grayish Blue
    "#833471", // Dark Magenta
    "#1E272E", // Dark Navy
    "#006266", // Dark Cyan
    "#5758BB", // Dark Indigo
    "#6F1E51", // Dark Violet
    "#009432", // Dark Green
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
    });
    return () => {
      socket.off("no stream");
    };
  }, [roomid, waiting]);
  useEffect(() => {
    socket.on("audiovisuals", (status) => {
      setAudioVisuals(status);
    });
    return () => {
      socket.off("audiovisuals");
    };
  }, [roomid]);

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
      setScreenSharing(false);
      console.log(audioRefs.current);

      if (studentSharePeerRef.current) {
        console.log(" ");
        handleStopStudentAudio();
      }

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
    socket.on("update-attendance", (newAttendanceList) => {
      console.log(newAttendanceList);
      setAttendanceList(newAttendanceList);
    });
  }, [roomid]);
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
  useEffect(() => {
    socket.on("start streaming", () => {
      const studentSharePeer = new Peer();
      studentSharePeerRef.current = studentSharePeer;

      setStudentMic(true);
      studentSharePeerRef.current.on("open", (peerId) => {
        socket.emit("student stream", roomid, peerId, studentMicControl);

        // socket.emit("audiovisuals", roomid, audioVisuals);
      });
      navigator.mediaDevices
        .getUserMedia({ video: false, audio: true })
        .then((stream) => {
          studentStream.current = stream;
          console.log(watcherUsername);

          const audioContext = new AudioContext();
          const analyser = audioContext.createAnalyser();
          const microphone = audioContext.createMediaStreamSource(stream);
          microphone.connect(analyser);
          analyser.fftSize = 256;

          const bufferLength = analyser.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);
          let previousSpeakingStatus = false;
          const checkAudioActivity = () => {
            analyser.getByteFrequencyData(dataArray);
            const average = dataArray.reduce((a, b) => a + b, 0) / bufferLength;
            const isSpeakingNow = average > 10; // Adjust this threshold as needed
            if (isSpeakingNow !== previousSpeakingStatus) {
              console.log(isSpeakingNow);
              previousSpeakingStatus = isSpeakingNow;
              console.log(isSpeakingNow, 1);

              console.log(roomid, isSpeakingNow, watcherUsername);
              socket.emit("speaking_status", roomid, isSpeakingNow);
              if (isSpeakingNow) {
                setIsSpeaking(true);
              } else {
                setIsSpeaking(false);
              }
            }

            requestAnimationFrame(checkAudioActivity);
          };
          checkAudioActivity();
        })
        .catch((error) => console.error(error));

      studentSharePeer.on("call", (call) => {
        call.answer(studentStream.current);

        call.on("close", () => {
          console.log("ewe");
        });
      });
    });
    socket.on("stop student speaking", () => {
      console.log("stop student speaking");
      handleStopStudentAudio();
    });
    return () => {
      if (audioRef.current) {
        const stream = audioRef.current.srcObject;
        if (stream) {
          stream.getTracks()[0].stop();
        }
      }
    };
  }, [roomid]);
  useEffect(() => {
    socket.on("student stream", (peerId, audioStat) => {
      console.log(audioStat, peerId);
      const receiveSudentPeer = new Peer();
      receiveSudentPeer.on("open", () => {
        navigator.mediaDevices
          .getUserMedia({ video: false, audio: true })
          .then((newStream) => {
            let call = receiveSudentPeer.call(peerId, newStream);
            // const call = peerInstance.call(peerId, fast);
            call?.on("stream", (remoteStream) => {
              if (audioRef.current) {
                audioRef.current.srcObject = remoteStream;
                audioRef.current.muted = !audioStat;
                audioRef.current.onloadedmetadata = () => {
                  // Media has loaded, you can now play it
                  audioRef.current
                    .play()
                    .then(() => {
                      console.log("Audio playback started successfully");
                    })
                    .catch((error) => {
                      console.error("Audio playback error:", error);
                    });
                };
                audioRef.current.oncanplay = () => {
                  // Media can be played, but it may not have fully loaded yet
                };

                // Add an event listener to handle interruptions
                audioRef.current.onabort = () => {
                  console.error("Audio load request was interrupted");
                };
                // const audioContext = new AudioContext();
                // const source =
                //   audioContext.createMediaStreamSource(remoteStream);

                // source.connect(audioContext.destination);

                // // Define a threshold for sound activity (adjust as needed)
                // const soundThreshold = 0.05;

                // // Listen for audio activity
                // source.onaudioprocess = (event) => {
                //   const audioBuffer = event.inputBuffer.getChannelData(0);
                //   const rms = calculateRMS(audioBuffer);

                //   if (rms > soundThreshold) {
                //     console.log("student Sound is being inputted");
                //   }
                // };

                // Listen for audio activity
              } else {
                console.log("error");
                console.log(audioRef.current);
              }
              function calculateRMS(buffer) {
                let sum = 0;
                for (let i = 0; i < buffer.length; i++) {
                  sum += buffer[i] * buffer[i];
                }
                return Math.sqrt(sum / buffer.length);
              }
            });
            call?.on("error", (error) => {
              console.error("Call error:", error);
            });
            // });
          });
      });
    });

    return () => {};
  }, [roomid]);

  useEffect(() => {
    socket.on("student audio stat", (audioStat, socketId) => {
      if (audioRefs.current[socketId]) {
        audioRefs.current[socketId].muted = !audioStat;
      }
    });

    return () => {
      socket.off("student audio stat");
    };
  }, [roomid]);

  // useEffect(() => {
  //   socket.on("welcome student speaking", (speakingArray) => {
  //     console.log(speakingArray)
  //   });

  //   return () => {
  //     socket.off("welcome student speaking");
  //   };
  // }, [roomid]);

  useEffect(() => {
    socket.on("welcome student speaking", (speakingArray) => {
      // Connect to each speaking student in the array
      speakingArray.forEach(({ peerId, audioStat }) => {
        const receiveStudentPeer = new Peer();

        receiveStudentPeer.on("open", () => {
          navigator.mediaDevices
            .getUserMedia({ video: false, audio: true })
            .then((newStream) => {
              const call = receiveStudentPeer.call(peerId, newStream);

              call?.on("stream", (remoteStream) => {
                if (audioRef.current) {
                  audioRef.current.srcObject = remoteStream;
                  audioRef.current.muted = !audioStat;

                  audioRef.current.onloadedmetadata = () => {
                    // Media has loaded, you can now play it
                    audioRef.current
                      .play()
                      .then(() => {
                        console.log("Audio playback started successfully");
                      })
                      .catch((error) => {
                        console.error("Audio playback error:", error);
                      });
                  };

                  // Add an event listener to handle interruptions
                  audioRef.current.onabort = () => {
                    console.error("Audio load request was interrupted");
                  };
                } else {
                  console.log("Error: Audio ref not available");
                }
              });
            });
        });
      });
    });

    return () => {
      socket.off("welcome student speaking");
    };
  }, [audioRef, socket]);

  useEffect(() => {
    const peers = {}; // Store peers for each speaker

    socket.on("student stream", (peerId, audioStat, socketId) => {
      const receiveStudentPeer = new Peer();
      receiveStudentPeer.on("open", () => {
        navigator.mediaDevices
          .getUserMedia({ video: false, audio: true })
          .then((newStream) => {
            const call = receiveStudentPeer.call(peerId, newStream);

            call?.on("stream", (remoteStream) => {
              const newAudioRef = createAudioRef(); // Implement your logic to create an audio element
              newAudioRef.srcObject = remoteStream;
              newAudioRef.muted = !audioStat;
              audioRefs.current[socketId] = newAudioRef;

              newAudioRef.onloadedmetadata = () => {
                newAudioRef
                  .play()
                  .then(() => {
                    console.log("Audio playback started successfully");
                  })
                  .catch((error) => {
                    console.error("Audio playback error:", error);
                  });
              };

              // Store the peer and audio reference
              peers[peerId] = {
                peer: receiveStudentPeer,
                audioRef: newAudioRef,
              };
            });
          });
      });
    });

    return () => {
      socket.off("student stream");
      // Clean up peers when the component is unmounted
      Object.values(peers).forEach(({ peer }) => {
        peer.destroy();
      });
    };
  }, []);

  useEffect(() => {
    socket.on("student audio stat", (audioStat, socketId) => {
      console.log("Audio Stat:", audioStat, "Socket ID:", socketId);

      // Mute or unmute the audio reference based on socketId
      if (audioRefs.current[socketId]) {
        console.log(audioRefs.current[socketId]);

        audioRefs.current[socketId].muted = !audioStat;
        // Update the state if needed
        // setSpeakingPeers((prevSpeakingPeers) => ({
        //   ...prevSpeakingPeers,
        //   [socketId]: {
        //     ...prevSpeakingPeers[socketId],
        //     audioStatus: audioStat,
        //   },
        // }));
      }
    });

    return () => {
      socket.off("student audio stat");
    };
  }, []);

  useEffect(() => {
    socket.on("disable student audio", (roomid, socketId) => {
      // if your and the socket id matches the socket id , it should emit something,
      //
    });

    return () => {
      socket.off("disable student audio");
    };
  }, []);
  // Helper function to create an audio element
  const createAudioRef = () => {
    const audioElement = document.createElement("audio");
    document.body.appendChild(audioElement); // Append to the body or another container as needed
    return audioElement;
  };

  return (
    <div className="dashboard-layout">
      <audio ref={audioRef} />

      <Modal isOpen={submitQuizModal}>
        <ModalHeader>
          <p style={{ textAlign: "center", margin: 0 }}>
            Are you sure you want to submit this quiz
          </p>
        </ModalHeader>

        <ModalFooter>
          <div className="button-wrapper">
            <Button
              type="button"
              onClick={() => {
                setSubmitQuizModal(false);
              }}
              className="cancel"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                handleUniqueSubmission(answers, "quiz");
                setSubmitQuizModal(false);

                // handleExitStreamModal();
              }}
            >
              Submit
            </Button>
          </div>
        </ModalFooter>
        <ModalFooter></ModalFooter>
      </Modal>
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
                    <>
                      <div className="video-background-parent">
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
                              background: "#fff",
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
                                  {attendanceCount}
                                </div>
                                <i
                                  onClick={() => {
                                    handleExitStream();
                                  }}
                                  style={{ color: "red" }}
                                  className="fa fa-times"
                                ></i>
                              </div>
                            </div>

                            <div
                              style={{
                                position: "relative",
                                maxHeight: "60vh",
                                height: "auto",

                                borderRadius: "10px",
                              }}
                            >
                              {studentMic &&
                                (studentMicControl ? (
                                  <p className="watcher-speaking-status">
                                    Your mic is on, speak now
                                  </p>
                                ) : (
                                  <p className="watcher-speaking-status">
                                    Request granted, turn mic on to speak
                                  </p>
                                ))}
                              <div>
                                <div
                                  ref={videoRef}
                                  // style={{ height: screenSharing && "0px" }}

                                  className={`${videoFill && "videoRef"} ${
                                    screenSharing && "active-screen-ref"
                                  }`}
                                ></div>
                                {!screenSharing && (
                                  <>
                                    {!audioVisuals?.video && (
                                      <div className="broadcaster-disconnected reconnect-loading webcam-off">
                                        <img
                                          src={presenterAvatar}
                                          alt=""
                                          style={{
                                            borderRadius: "50%",
                                            width: "15%",
                                          }}
                                        />
                                        {studentMic &&
                                          (studentMicControl ? (
                                            <p className="watcher-speaking-status">
                                              Your mic is on, speak now
                                            </p>
                                          ) : (
                                            <p className="watcher-speaking-status">
                                              Request granted, turn mic on to
                                              speak
                                            </p>
                                          ))}
                                      </div>
                                    )}
                                  </>
                                )}
                                <div
                                  ref={screenRef}
                                  // style={{
                                  //   height: !screenSharing && "0px",
                                  // }}
                                  className={screenSharing && "active-screen"}
                                ></div>
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
                        <div className="student-room-info-parent desktop-control">
                          <div
                            className="student-room-info desktop-control"
                            style={{
                              color: theme?.themestyles.navbartextcolor,
                            }}
                          >
                            <span className="date-span">{formattedDate}</span>
                            <span className="divider-span"></span>
                            <span>Attendees ({attendanceCount})</span>
                          </div>
                          <div>
                            {studentMic && (
                              <span
                                className="end-speaking hover"
                                onClick={() => {
                                  handleStopStudentAudio();
                                }}
                              >
                                Stop Speaking
                              </span>
                            )}
                          </div>
                          <div
                            className="audio-wrapper"
                            onClick={
                              studentMic
                                ? studentMicControl
                                  ? handleTurnOffStudentAudio
                                  : handleTurnOnStudentAudio
                                : handleStartStudentAudio
                            }
                          >
                            {studentMic ? (
                              studentMicControl ? (
                                <i
                                  className="fa fa-microphone"
                                  aria-hidden="true"
                                ></i>
                              ) : (
                                <i
                                  className="fa fa-microphone-slash"
                                  aria-hidden="true"
                                ></i>
                              )
                            ) : (
                              <i
                                className="fa fa-microphone-slash"
                                aria-hidden="true"
                              ></i>
                            )}

                            {studentMic ? (
                              studentMicControl ? (
                                <span>Turn mic off</span>
                              ) : (
                                <span>Turn mic On</span>
                              )
                            ) : (
                              <span>Ask to speak</span>
                            )}
                          </div>
                        </div>
                      )}
                    </>

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

                  <div className="chat-box watcher-chat-box">
                    {/* {!audioVisuals.video && (
                      <div
                        className={`broadcaster-disconnected reconnect-loading webcam-off ${
                          screenSharing ? "share-active-mini" : "share-inactive"
                        }`}
                      >
                        <img
                          src={presenterAvatar}
                          alt=""
                          style={{
                            borderRadius: "50%",
                            width: "15%",
                          }}
                        />
                      </div>
                    )} */}

                    <div className="mini-screen">
                      {!audioVisuals?.video && screenSharing && (
                        <div className="no-camera"></div>
                      )}
                      <div
                        ref={secondVideoRef}
                        className={`${
                          screenSharing ? "share-active" : "share-inactive"
                        } `}
                      ></div>
                    </div>

                    {disconnect || waiting ? (
                      ""
                    ) : (
                      <>
                        {4 > 2 ? (
                          <div>
                            {" "}
                            {attendanceList.map((item, i) => {
                              return (
                                <div
                                  className="single-attendee hover"
                                  key={i}
                                  onClick={() => {
                                    setAttendanceList((prevAttendanceList) => {
                                      const updatedList =
                                        prevAttendanceList.map(
                                          (listItem, index) => {
                                            if (index === i) {
                                              // Clicked on the current item, toggle menuActive to true
                                              return {
                                                ...listItem,
                                                menuActive:
                                                  !listItem.menuActive,
                                              };
                                            } else {
                                              // Clicked on another item, set menuActive to false
                                              return {
                                                ...listItem,
                                                menuActive: false,
                                              };
                                            }
                                          }
                                        );

                                      return updatedList;
                                    });
                                  }}
                                >
                                  <div>
                                    {item.speakingStatus ? (
                                      <img src={wave} alt="wave" />
                                    ) : (
                                      <i
                                        className="fa fa-microphone-slash"
                                        aria-hidden="true"
                                      ></i>
                                    )}
                                  </div>
                                  {/* <p
                                  className="speaking-icon"
                                  style={{
                                    background: "green",
                                  }}
                                >
                                  {item.userName
                                    .charAt(0)
                                    .toUpperCase() || "T"}
                                </p> */}
                                  <p>{item.userName || "Chadius"}</p>
                                  {item.menuActive && (
                                    <div
                                      className={`attendance-mute-delete${
                                        i === 0 || i % 3 === 0
                                          ? " firstColumn"
                                          : ""
                                      }${
                                        i === 1 || i % 3 === 1
                                          ? " secondColumn"
                                          : ""
                                      }${
                                        i === 2 || i % 3 === 2
                                          ? " thirdColumn"
                                          : ""
                                      }`}
                                      onClick={() => {}}
                                    >
                                      <p>Give permission to speak</p>
                                      <p>Mute student</p>
                                      <p>Block student</p>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="chat-interface">
                            <div className="chat-interface-text">
                              {defaultChat.map((singleChat, index) => {
                                return (
                                  // <div
                                  //   style={{
                                  //     display: "flex",
                                  //     flexDirection: "column",
                                  //     alignItems: "flex-end",
                                  //   }}
                                  // >
                                  //   <p
                                  //     className="watcher-username"
                                  //     style={{
                                  //       color: singleChat.color || "#fe0017",

                                  //       marginBottom: "0",
                                  //       alignSelf:
                                  //         singleChat.user === watcherUsername
                                  //           ? ""
                                  //           : "flex-start",
                                  //     }}
                                  //   >
                                  //     {singleChat.user}
                                  //   </p>
                                  //   <div
                                  //     key={index}
                                  //     className={`chat-bubble ${
                                  //       singleChat.user === watcherUsername
                                  //         ? "user-bubble"
                                  //         : ""
                                  //     }`}
                                  //   >
                                  //     {singleChat.msg}
                                  //   </div>
                                  // </div>
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                    }}
                                  >
                                    <div
                                      style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "flex-end",
                                        flex: 5,
                                        // paddingRight: "5%",
                                      }}
                                    >
                                      <p
                                        style={{
                                          fontWeight: 600,

                                          marginBottom: "0",
                                          color: singleChat.color
                                            ? singleChat.color
                                            : "#200b72",
                                          alignSelf:
                                            singleChat.user === watcherUsername
                                              ? ""
                                              : "flex-start",
                                        }}
                                      >
                                        {singleChat.user}
                                      </p>
                                      <div
                                        className={`in-chat-message ${
                                          singleChat.user !== watcherUsername &&
                                          "watcher-message"
                                        }`}
                                      >
                                        {singleChat.user === watcherUsername ? (
                                          watcherAvatar ? (
                                            <img
                                              src={watcherAvatar}
                                              alt="user"
                                              style={{
                                                width: "25px",
                                                height: "auto",

                                                borderRadius: "50%",
                                                marginLeft: "5px",
                                              }}
                                            />
                                          ) : (
                                            <span
                                              style={{
                                                color: "#fff",
                                                background: singleChat.color
                                                  ? singleChat.color
                                                  : "#200b72",
                                                borderRadius: "50%",
                                                zIndex: 5,
                                                marginLeft: "5px",
                                                width: "25px",
                                                height: "25px",
                                                textAlign: "center",
                                              }}
                                            >
                                              {watcherUsername
                                                .charAt(0)
                                                .toUpperCase()}
                                            </span>
                                          )
                                        ) : (
                                          <>
                                            {singleChat.img ? (
                                              <img
                                                src={singleChat.img}
                                                alt="user"
                                                style={{
                                                  width: "25px",
                                                  height: "auto",

                                                  borderRadius: "50%",
                                                  marginLeft: "5px",
                                                  marginRight: "5px",
                                                }}
                                              />
                                            ) : (
                                              <span
                                                style={{
                                                  color: "#fff",
                                                  background: singleChat.color
                                                    ? singleChat.color
                                                    : "#200b72",
                                                  borderRadius: "50%",

                                                  width: "25px",
                                                  height: "25px",
                                                  textAlign: "center",
                                                }}
                                              >
                                                {singleChat.user
                                                  .charAt(0)
                                                  .toUpperCase()}
                                              </span>
                                            )}
                                          </>
                                        )}
                                        <div
                                          key={index}
                                          className={`${
                                            singleChat.user === watcherUsername
                                              ? "user-bubble"
                                              : "chat-bubble"
                                          }`}
                                        >
                                          {singleChat.msg}
                                        </div>
                                      </div>
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
                                          theme?.themestyles
                                            .navbarbackgroundcolor,
                                        color:
                                          theme?.themestyles.primarytextcolor,
                                      }}
                                    >
                                      <span style={{ color: "#fff" }}>
                                        Pop Quiz{" "}
                                        <i className="fas fa-book-open poll"></i>
                                      </span>
                                      {minimizedQuiz ? (
                                        <i
                                          className="fa fa-expand"
                                          style={{
                                            color: "#fff",
                                          }}
                                          onClick={() => {
                                            setMinimizedQuiz(false);
                                          }}
                                        ></i>
                                      ) : (
                                        <i
                                          className="fa fa-minus"
                                          style={{
                                            color: "#fff",
                                          }}
                                          onClick={() => {
                                            setMinimizedQuiz(true);
                                          }}
                                        ></i>
                                      )}
                                    </div>
                                    {!minimizedQuiz && (
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
                                                      index + 1 ===
                                                        currentQuestion ||
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
                                                              currentQuestion -
                                                                1
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
                                                          setSubmitQuizModal(
                                                            true
                                                          );
                                                        }}
                                                        className={`submit-button ${
                                                          index + 1 >=
                                                            arr.length ||
                                                          arr.length === 1
                                                            ? "quiz-button"
                                                            : "prev"
                                                        }`}
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
                                    )}
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
                                              theme?.themestyles
                                                .primarytextcolor,
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
                                          {minimizedPoll ? (
                                            <i
                                              className="fa fa-expand"
                                              style={{
                                                color: "#fff",
                                              }}
                                              onClick={() => {
                                                setMinimizedPoll(false);
                                              }}
                                            ></i>
                                          ) : (
                                            <i
                                              className="fa fa-minus"
                                              style={{
                                                color: "#fff",
                                              }}
                                              onClick={() => {
                                                setMinimizedPoll(true);
                                              }}
                                            ></i>
                                          )}
                                        </div>
                                        {!minimizedPoll && (
                                          <div className="bottom">
                                            {pollResults ? (
                                              ""
                                            ) : (
                                              <Progress
                                                max={`${singleChat.durationInSec}`}
                                                value={
                                                  Number(
                                                    timerHolder?.remainingTime
                                                  )
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
                                                  pollOptions={
                                                    singleChat.options
                                                  }
                                                  pollResult={
                                                    pollResults
                                                      ? pollResults
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
                                        )}
                                      </div>
                                    ) : (
                                      <></>
                                    )}
                                  </>
                                );
                              })}
                            </div>
                            <div
                              className="chat-control"
                              style={{
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

                              {/* 
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
                        /> */}

                              <CustomTextArea
                                text={chatMessage}
                                setText={setChatMessage}
                                keyDown={handleKeyDown}
                                height={height}
                                setHeight={setHeight}
                              />
                              {studentMic ? (
                                studentMicControl ? (
                                  <div
                                    className="mobile-audio-wrapper mobile-control audio-active"
                                    onClick={handleTurnOffStudentAudio}
                                  >
                                    {" "}
                                    <i
                                      className="fa fa-microphone"
                                      aria-hidden="true"
                                    ></i>
                                  </div>
                                ) : (
                                  <div
                                    className="mobile-audio-wrapper mobile-control  audio-active"
                                    onClick={handleTurnOnStudentAudio}
                                  >
                                    {" "}
                                    <i
                                      className="fa fa-microphone-slash"
                                      // className="fa fa-microphone"
                                      aria-hidden="true"
                                    ></i>
                                  </div>
                                )
                              ) : (
                                <div
                                  className="mobile-audio-wrapper mobile-control  audio-inactive"
                                  onClick={handleStartStudentAudio}
                                >
                                  {" "}
                                  <i
                                    className="fa fa-microphone"
                                    aria-hidden="true"
                                  ></i>
                                </div>
                              )}
                              <div
                                className="expand-wrapper"
                                onClick={() => {
                                  setVideoFill(!videoFill);
                                }}
                              >
                                <i
                                  className="fa fa-expand"
                                  aria-hidden="true"
                                  style={{ color: "#ccc" }}
                                ></i>
                              </div>
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
                      </>
                    )}
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
