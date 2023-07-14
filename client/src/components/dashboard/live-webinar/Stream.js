import React, { useEffect, useRef, useState } from "react";

import Peer from "peerjs";
import axios from "axios";
import socket from "../../../utilities/client-socket-connect";
import { Col, Container, Row, Button, Card, Modal, Progress } from "reactstrap";
import "../../../custom-styles/dashboard/live-webinar.css";
import smiley from "../../../images/emojisvg.svg";
import { useAlert } from "react-alert";
import DashboardNavbar from "../DashboardNavbar";
import { useParams, useHistory } from "react-router-dom";

import Poll from "./Poll";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import CountdownTimer from "./CountDownTimer";
import setAuthToken from "../../../utilities/setAuthToken";

export default function Stream() {
  const { roomid } = useParams();
  const myVideoRef = useRef();
  const peerRef = useRef();
  const screenStreamRef = useRef(null);
  const [audioDevices, setAudioDevices] = useState([]);
  const [videoDevices, setVideoDevices] = useState([]);

  const history = useHistory();
  const chatInterfaceRef = useRef(null);
  const alert = useAlert();
  const [title, setTitle] = useState("");
  const [quizStatus, setQuizStatus] = useState(false);
  const [startController, setStartController] = useState(false);
  const [quizHolder, setQuizHolder] = useState([]);
  const [quizResultHolder, setQuizResultHolder] = useState([]);
  const [allQuizHolder, setAllQuizHolderHolder] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [chatMessage, setChatMessage] = useState(null);
  const [pollStatus, setPollStatus] = useState(false);
  const [answerHolder, setAnswerHolder] = useState({});
  const [timerHolder, setTimerHolder] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [pollTitle, setPollTitle] = useState("");
  const [defaultChat, setDefaultChat] = useState([]);
  const [specialChat, setSpecialChat] = useState([]);
  const [timeOutModal, setTimeOutModal] = useState(false);
  const [pollOptions, setPollOptions] = useState(["", "", "", ""]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attendies, setAttendies] = useState(1);
  const [audioVisuals, setAudioVisuals] = useState({
    video: true,
    audio: true,
  });
  const [presenterDetails, setPresenterDetails] = useState(null);
  const [planname, setPlanname] = useState(null);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [pollConfirmation, setPollConfirmation] = useState(false);
  const [quizConfirmation, setQuizConfirmation] = useState(false);
  const [quizSubmission, setQuizSubmission] = useState({});
  const [pollResultHolder, setPollResultHolder] = useState([]);
  const [answers, setAnswers] = useState([]);

  const [durationValue, setDurationValue] = useState(""); // State to track the input value
  const [durationUnit, setDurationUnit] = useState("secs"); // State to track the selected unit
  const [viewDuration, setViewDuration] = useState(false);
  const [pollDuration, setPollDuration] = useState(false);
  const [totalQuestion, setTotalQuestion] = useState(0);
  const [screenSharing, setScreenSharing] = useState(false);
  const [peerHolder, setPeerHolder] = useState(null);
  const [screenStream, setScreenStream] = useState(null);
  const [mobileChat, setMobileChat] = useState(false);

  //

  const handleDurationValueChange = (event) => {
    setDurationValue(event.target.value);
  };

  const handleDurationUnitChange = (event) => {
    setDurationUnit(event.target.value);
  };
  const handlePlanTimeOut = () => {
    handleExitStream();
  };
  const questionArray = Array.from(
    { length: totalQuestion },
    (_, index) => index
  );

  const handleScreenSharingEnded = () => {
    socket.emit("stopScreenSharing", roomid);
    setScreenSharing(false);
    setScreenStream(null);
    navigator.mediaDevices
      .getUserMedia(audioVisuals)
      .then((stream) => {
        addVideoStream(myVideoRef.current, stream);
        const connections = peerHolder._connections;
        const second = peerRef.current._connections;
        connections.forEach((value, key) => {
          const call = peerHolder.call(key, stream);
          call.on("stream", (userVideoStream) => {});
        });
      })
      .catch((error) => console.error(error));
  };

  const handleExitStream = () => {
    socket.emit("endstream", roomid);

    // Disable camera
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

    // Destroy the peer connection
    if (peerHolder) {
      peerHolder.destroy();
      setPeerHolder(null);
    }
    history.push("/dashboard/livewebinar");
  };
  const getSchoolUrl = (schoolname) => {
    const host = window.location.host;
    if (host.includes("localhost")) {
      return `http://${schoolname}.${host}`;
    }
    const baseDomain = host.split(".")[1];
    return baseDomain.includes("localhost")
      ? `http://${schoolname}.${baseDomain}`
      : `https://${schoolname}.${baseDomain}.com`;
  };
  function copyText() {
    navigator.clipboard
      .writeText(
        `${getSchoolUrl(presenterDetails.school)}/live/preview/${
          presenterDetails.id
        }`
      )
      .then(() => {})
      .catch((error) => {
        console.error("Error copying text: ", error);
      });
    alert.show("Link Copied", {
      type: "success",
    });
  }
  const validateWebinar = async () => {
    if (localStorage.getItem("tutorToken")) {
      setAuthToken(localStorage.getItem("tutorToken"));
    }
    setIsLoading(true);
    try {
      let res = await axios.get(`/api/v1/livewebinar/stream/${roomid}`);
      if (res) {
        console.log(res);
        setPresenterDetails({
          name: `${res.data.firstname} ${res.data.lastname} `,
          username: res.data.username,
          avatar: res.data.avatar,
          id: res.data.id,
          school: res.data.school,
        });
        setPlanname(res.data.planname);

        setTitle(res.data.title);

        setTimeLeft(res.data.timeLeft);
        setIsLoading(false);
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

  const handleQuizTitleChange = (event) => {
    if (questionNumber > totalQuestion) {
      setPollTitle(event.target.value);
    } else {
      alert.show("Can not Edit");
    }
  };
  const handleCreatePoll = () => {
    let durationInSec = convertToSeconds(durationValue, durationUnit);
    let newDefaultChat = [
      ...defaultChat,
      {
        user: 1,
        type: "poll",
        title: pollTitle,
        options: pollOptions,
        durationInSec,
      },
    ];
    setDefaultChat([
      ...defaultChat,
      {
        user: 1,
        type: "poll",
        title: pollTitle,
        options: pollOptions,
        durationInSec,
      },
    ]);
    // handle special chat
    setSpecialChat([
      // ...specialChat,
      {
        user: 1,
        type: "poll",
        title: pollTitle,
        options: pollOptions,
        durationInSec,
        submissionStatus: false,
      },
    ]);
    socket.emit(
      "specialchat",
      {
        title: pollTitle,
        user: presenterDetails.username || 1,
        options: pollOptions,
        type: "poll",
        timeStamp: Date.now(),
        durationInSec,
      },
      roomid
    );
    let newIndex = newDefaultChat.length;
    socket.emit(
      "message",
      {
        title: pollTitle,
        user: presenterDetails.username || 1,
        options: pollOptions,
        type: "poll",
        timeStamp: Date.now(),
        questionControl: newIndex,
        durationInSec,
      },
      roomid
    );
    let timerData = {
      duration: durationInSec,
      roomid,
    };
    socket.emit("startTimer", timerData);
    setPollTitle("");
    setPollOptions(["", "", "", ""]);
    setDurationValue("");
    setDurationUnit("secs");
  };
  const handleQuizCreate = () => {
    if (pollOptions.every((option) => option !== "") && pollTitle !== "") {
      // handle special chat

      let newQuizHolder = [
        ...quizHolder,
        { question: pollTitle, options: pollOptions },
      ];

      setQuizHolder(newQuizHolder);
      setDefaultChat([
        ...defaultChat,
        {
          user: 1,
          quizHolder: newQuizHolder,
          type: "quiz",
          timeStamp: Date.now(),
          duration: { durationUnit, durationValue },
        },
      ]);
      // setSpecialChat

      setSpecialChat([
        {
          user: 1,
          quizHolder: newQuizHolder,
          type: "quiz",
          timeStamp: Date.now(),
          duration: { durationUnit, durationValue },
          submissionStatus: false,
        },
      ]);

      const newIndex = defaultChat.length;

      // let newAnswerHolder = { ...answerHolder, [newIndex]: answers };

      setAnswerHolder(answers);
      setAnswers([]);
      let newAllQuizHolder = { ...allQuizHolder, [newIndex]: quizHolder };
      setAllQuizHolderHolder(newAllQuizHolder);
      setQuizHolder([]);

      const messageData = {
        user: 1,
        quizHolder: newQuizHolder,
        type: "quiz",
        timeStamp: Date.now(),
        duration: { durationUnit, durationValue },
        questionControl: newIndex,
      };
      // convert duration to second
      let durationInSec = convertToSeconds(durationValue, durationUnit);

      let timerData = {
        duration: durationInSec,
        roomid,
      };
      socket.emit("specialchat", messageData, roomid);
      setQuizSubmission(false);
      setQuizResultHolder([]);

      socket.emit("message", messageData, roomid);
      socket.emit("startTimer", timerData);
      setPollTitle("");
      setPollOptions(["", "", "", ""]);
      setDurationValue("");
      setDurationUnit("secs");
      setTotalQuestion(0);
      setQuestionNumber(1);
    } else {
      setDefaultChat([
        ...defaultChat,
        {
          user: 1,
          quizHolder,
          type: "quiz",
          timeStamp: Date.now(),
          duration: { durationUnit, durationValue },
        },
      ]);
      setSpecialChat([
        {
          user: 1,
          quizHolder,
          type: "quiz",
          timeStamp: Date.now(),
          duration: { durationUnit, durationValue },
          submissionStatus: false,
        },
      ]);
      const newIndex = defaultChat.length;

      // let newAnswerHolder = { ...answerHolder, [newIndex]: answers };

      setAnswerHolder(answers);
      setAnswers([]);
      let newAllQuizHolder = { ...allQuizHolder, [newIndex]: quizHolder };
      setAllQuizHolderHolder(newAllQuizHolder);

      const messageData = {
        user: 1,
        quizHolder,
        type: "quiz",
        timeStamp: Date.now(),
        duration: { durationUnit, durationValue },
        questionControl: newIndex,
      };

      let durationInSec = convertToSeconds(durationValue, durationUnit);

      let timerData = {
        duration: durationInSec,
        questionControl: newIndex,
        roomid,
      };
      socket.emit("specialchat", messageData, roomid);

      socket.emit("message", messageData, roomid);
      socket.emit("startTimer", timerData);

      setQuizHolder([]);
      setPollTitle("");
      setPollOptions(["", "", "", ""]);
      setDurationValue("");
      setDurationUnit("secs");
      setTotalQuestion(0);
      setQuestionNumber(1);
    }
  };

  const handleToggleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };
  const handleSelectEmoji = (emoji) => {
    setChatMessage(
      chatMessage === null ? emoji.native : chatMessage + emoji.native
    );
    setShowEmojiPicker(!showEmojiPicker);
  };
  const scrollToBottom = () => {
    if (chatInterfaceRef && chatInterfaceRef.current) {
      chatInterfaceRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // const sendMessage = () => {
  //   if (chatMessage !== null) {
  //     socket.emit(
  //       "message",
  //       {
  //         user: presenterDetails?.username,
  //         msg: chatMessage,
  //         timeStamp: Date.now(),
  //         type: "text",
  //       },
  //       roomid
  //     );

  //     setDefaultChat([
  //       ...defaultChat,
  //       {
  //         user: presenterDetails?.username,
  //         msg: chatMessage,
  //         timeStamp: Date.now(),
  //         type: "text",
  //       },
  //     ]);
  //   }
  //   setChatMessage("");
  // };
  const sendMessage = () => {
    if (chatMessage && chatMessage.trim() !== "") {
      socket.emit(
        "message",
        {
          user: presenterDetails?.username,
          msg: chatMessage,
          timeStamp: Date.now(),
          type: "text",
        },
        roomid
      );

      setDefaultChat([
        ...defaultChat,
        {
          user: presenterDetails?.username,
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
  const handlePollOptionChange = (index, event) => {
    if (questionNumber > totalQuestion) {
      const newOptions = [...pollOptions];
      newOptions[index] = event.target.value;
      setPollOptions(newOptions);
    } else {
      alert.show("Can not Edit");
    }
  };
  const handleQuizOptionChange = (index, event) => {
    if (questionNumber > totalQuestion) {
      handlePollOptionChange(index, event);
    } else {
      alert.show("Can not Edit");
    }
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
    if (
      questionNumber < totalQuestion - 1 ||
      totalQuestion - questionNumber > 1
    ) {
      setPollTitle(quizHolder[questionNumber + 1]?.question);
      setPollOptions(quizHolder[questionNumber + 1]?.options);
      setQuestionNumber(questionNumber + 1);
    } else {
      if (totalQuestion > questionNumber && totalQuestion !== 0) {
        setPollTitle(quizHolder[questionNumber]?.question);
        setPollOptions(quizHolder[questionNumber]?.options);
        setQuestionNumber(questionNumber + 1);
      } else {
        alert.show("No next question");
      }
    }
  };
  const handleSelectQuestion = (number) => {
    if (number === totalQuestion + 1) {
      setQuestionNumber(number);

      setPollTitle("");
      setPollOptions(["", "", "", ""]);
    }
    if (number > totalQuestion) {
      setQuestionNumber(number);

      setPollTitle("");
      setPollOptions(["", "", "", ""]);
    } else {
      setQuestionNumber(number);
      setPollTitle(quizHolder[number - 1].question);
      setPollOptions(quizHolder[number - 1].options);
    }
  };
  const handlePreviousQuestion = () => {
    if (questionNumber - 1 > 0) {
      setQuestionNumber(questionNumber - 1);
      setPollTitle(quizHolder[questionNumber - 2].question);
      setPollOptions(quizHolder[questionNumber - 2].options);
    } else {
      alert.show("No previous question");
    }
  };
  const handleAddNextQuestion = () => {
    if (
      pollOptions.every((option) => option !== "") &&
      pollTitle !== "" &&
      // answers.length >= totalQuestion
      answers.length === totalQuestion + 1
    ) {
      if (totalQuestion < questionNumber) {
        setTotalQuestion(totalQuestion + 1);

        setQuizHolder([
          ...quizHolder,
          { question: pollTitle, options: pollOptions },
        ]);
        setQuestionNumber(totalQuestion + 2);
        setPollTitle("");
        setPollOptions(["", "", "", ""]);
      } else {
        // move to the correct number
        handleSelectQuestion(totalQuestion + 1);
        setAnswers((prevAnswers) => prevAnswers.slice(0, -1));
      }
    } else {
      if (
        totalQuestion - 1 >= questionNumber ||
        questionNumber === totalQuestion
      ) {
        setQuestionNumber(totalQuestion + 1);
        setPollTitle("");
        setPollOptions(["", "", "", ""]);
      } else {
        alert.show("Please fill in all options.");
      }
    }
  };
  const handleCreateQuiz = () => {
    if (
      pollOptions.every((option) => option !== "") &&
      pollTitle !== "" &&
      answers.length === questionNumber
    ) {
      setQuizStatus(false);
      setViewDuration(true);
    } else {
      if (
        pollOptions.every((option) => option === "") &&
        pollTitle === "" &&
        answers.length === totalQuestion &&
        totalQuestion > 0
      ) {
        setQuizStatus(false);
        setViewDuration(true);
        setTotalQuestion(totalQuestion + 1);
      } else {
        if (
          (pollOptions.every((option) => option === "") && pollTitle !== "") ||
          (pollOptions.every((option) => option !== "") && pollTitle === "")
        ) {
          alert.show("Please fill in all options.");
        } else {
          alert.show("Please fill in all options.");
        }
      }
    }
  };
  const hanlePollQuizTimeOut = () => {
    setSpecialChat((prevSpecialChat) => {
      const updatedChat = {
        ...prevSpecialChat[0],
        submissionStatus: true,
      };

      return [updatedChat];
    });
  };
  const handleCancelQuizCreation = () => {
    setQuizStatus(false);
    setPollTitle("");
    setPollOptions(["", "", "", ""]);
    setDurationValue("");
    setDurationUnit("secs");
    setTotalQuestion(0);
    setAnswers([]);
    setQuestionNumber(1);
  };
  function addVideoStream(video, stream) {
    video.srcObject = stream;
    video.addEventListener("loadedmetadata", () => {
      video.play();
    });
  }

  const removePollQuizFromChat = (index) => {
    setSpecialChat([]);

    setTimerHolder(false);

    socket.emit("special close", roomid);

    // confirm the index again in
  };

  const onConnect = () => {
    navigator.mediaDevices
      .getUserMedia(audioVisuals)
      .then((stream) => {
        addVideoStream(myVideoRef.current, stream);
      })
      .catch((error) => console.error(error));
  };

  const convertToSeconds = (value, unit) => {
    let seconds = parseFloat(value);

    switch (unit) {
      case "secs":
        break;
      case "min":
        seconds *= 60;
        break;
      case "hour":
        seconds *= 3600;
        break;
      default:
        break;
    }

    return seconds;
  };

  const handleStudentPollSubmit = (newResult) => {
    let newResultHolder = [...pollResultHolder, newResult];
    setPollResultHolder(newResultHolder);

    socket.emit("updatedPollResult", roomid, newResultHolder, 0);
  };

  useEffect(() => {
    socket.on("watcher-exit", (size) => {
      setAttendies(size);
    });

    return () => {
      socket.off("watcher-exit");
    };
  }, [roomid, attendies]);

  useEffect(() => {
    socket.on("roomTimerStarted", (roomTimer) => {
      setTimeLeft(roomTimer);
    });

    return () => {
      socket.off("roomTimerStarted");
    };
  }, [roomid, timeLeft]);
  useEffect(() => {
    socket.on("freeTimerEnded", () => {
      handleExitStream();
    });

    return () => {
      socket.off("freeTimerEnded");
    };
  }, [roomid, timeLeft]);

  useEffect(() => {
    socket.on("timer elapsed for room", (roomTimer) => {
      setTimeLeft(roomTimer);
      handleExitStream();
    });

    return () => {
      socket.off("timer elapsed for room");
    };
  }, [roomid, timeLeft]);
  useEffect(() => {
    socket.on("roomTimerTick", (roomTimer) => {
      setTimeLeft(roomTimer);
      console.log(roomTimer);
      if (roomTimer === 600) {
        console.log(roomTimer, "fsd");
        setTimeOutModal(true);
      }
    });

    return () => {
      socket.off("roomTimerTick");
    };
  }, [roomid, timeLeft, timeOutModal]);

  useEffect(() => {
    socket.on("special submit", (type, result, user) => {
      if (type === "poll") {
        handleStudentPollSubmit(result);
      }

      if (type === "quiz") {
        if (answerHolder) {
          let studentRes = analyseStudentResult(answerHolder, result);

          let newSubmission = {
            user,
            result: studentRes,
          };
          // let newResult = [...quizResultHolder, newSubmission];
          // setQuizResultHolder(newResult);
          // setQuizSubmission(true);
          const userHasSubmitted = quizResultHolder.some(
            (submission) => submission.user === user
          );

          if (!userHasSubmitted) {
            let newResult = [...quizResultHolder, newSubmission];
            setQuizResultHolder(newResult);
            setQuizSubmission(true);
          } else {
            console.log("User has already submitted");
          }
        }
      }
    });
    return () => {
      socket.off("special submit");
    };
  }, [
    pollResultHolder,
    answerHolder,
    roomid,
    quizResultHolder,
    quizSubmission,

    setQuizResultHolder,
  ]);

  useEffect(() => {
    socket.on("timerStarted", (duration) => {
      let newTimeHolder = {
        duration,
        remainingTime: duration,
      };
      setTimerHolder(newTimeHolder);
    });
    return () => {
      socket.off("timerStarted");
    };
  }, [roomid, timerHolder]);

  useEffect(() => {
    socket.on("timerTick", (remainingTime) => {
      if (timerHolder) {
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
  useEffect(() => {
    socket.on("timerEnded", () => {
      if (specialChat && specialChat.length > 0) {
        if (specialChat[0].type === "poll") {
          hanlePollQuizTimeOut();
          setTimerHolder(false);
        }
        if (specialChat[0].type === "quiz") {
          hanlePollQuizTimeOut();
          setTimerHolder(false);
        }
      } else {
        // Handle the case when specialChat is not defined or empty
      }
    });
    return () => {
      socket.off("timerEnded");
    };
  }, [roomid, timerHolder]);

  useEffect(() => {
    socket.on("user-disconnected", (userId, roomSize) => {
      setAttendies(roomSize);
    });
    return () => {
      socket.off("user-disconnected");
    };
  });
  useEffect(() => {
    validateWebinar();
  }, [roomid]);

  useEffect(() => {
    socket.on("message", (message) => {
      setDefaultChat([...defaultChat, { ...message }]);
    });
    return () => {
      socket.off("message");
    };
  });

  useEffect(() => {
    scrollToBottom();
  }, [defaultChat]);

  useEffect(() => {
    socket.on("watcher", (userId, roomSize) => {
      setAttendies(roomSize);
    });
  }, [roomid]);

  useEffect(() => {
    const initializePeer = async () => {
      const peerInstance = new Peer();
      peerRef.current = peerInstance;
      setPeerHolder(peerInstance);

      peerInstance.on("open", (peerId) => {
        socket.emit("broadcaster", roomid, peerId);
        if (planname === "free") {
          socket.emit("freeTimer", roomid);
        }
      });
      peerInstance.on("call", (call) => {
        // check if livestream
        if (screenSharing && screenStreamRef.current) {
          call.answer(screenStreamRef.current);
        } else {
          navigator.mediaDevices
            // .getUserMedia({ audio: true, video: true })
            .getUserMedia(audioVisuals)

            .then((stream) => {
              call.answer(stream);
            });
        }
      });
    };
    if (startController) {
      onConnect();
      initializePeer();
    }

    // return () => {
    //   peerHolder?.destroy();
    // };
  }, [screenSharing, audioVisuals, startController, roomid, planname]);

  useEffect(() => {
    async function getMediaDevices() {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioDevices = devices.filter(
          (device) => device.kind === "audioinput"
        );
        const videoDevices = devices.filter(
          (device) => device.kind === "videoinput"
        );
        setAudioDevices(audioDevices);
        setVideoDevices(videoDevices);
      } catch (error) {
        console.error("Error enumerating media devices:", error);
      }
    }

    getMediaDevices();
  }, []);

  // trigger intialize Peeer
  const handleInitializePeer = () => {
    setStartController(true);
  };

  const toggleScreenSharing = () => {
    if (screenSharing) {
      setScreenSharing(false);
      handleScreenSharingEnded();
      screenStreamRef.current = null;
    } else {
      setScreenSharing(true);

      navigator.mediaDevices
        .getDisplayMedia({ video: true, audio: true })
        .then((stream) => {
          addVideoStream(myVideoRef.current, stream);

          screenStreamRef.current = stream;
          // setScreenStream(stream);

          const screenSharingTrack = stream.getVideoTracks()[0];
          screenSharingTrack.addEventListener(
            "ended",
            handleScreenSharingEnded
          );
          // if (myVideoRef.current) {
          //   myVideoRef.current.srcObject = stream;

          // }

          socket.emit("startScreenSharing", roomid);

          const connections = peerHolder._connections;
          connections.forEach((value, key) => {
            const call = peerHolder.call(key, stream);
            call.on("stream", (userVideoStream) => {});
          });
        })
        .catch((error) => console.error(error));
    }
  };

  return (
    <div className="dashboard-layout">
      <Container fluid>
        <Row>
          <DashboardNavbar />
          <Col className="page-actions__col">
            <div className="live-webinar">
              <div className="stream-webinar-content">
                <Modal isOpen={timeOutModal}>
                  <div className="close-time-out">
                    <h4
                      onClick={() => {
                        setTimeOutModal(false);
                      }}
                      style={{ alignSelf: "end" }}
                    >
                      <i className="fa fa-times"></i>
                    </h4>

                    <h2 style={{ alignSelf: "center" }}>10 minutes left</h2>
                  </div>
                </Modal>
                <Modal isOpen={pollStatus} className="poll-modal-wrapper">
                  <div className="poll-modal">
                    <div className="top">
                      <h4
                        onClick={() => {
                          setPollStatus(false);
                          setPollTitle("");
                          setPollOptions(["", "", "", ""]);
                        }}
                      >
                        <i className="fa fa-times"></i>
                      </h4>
                    </div>
                    <p className="poll-heading">Create Poll</p>
                    <form className="poll-form">
                      <div className="poll-item">
                        <p>Poll title</p>
                        <input
                          className="poll-input"
                          value={pollTitle || ""}
                          onChange={handlePollTitleChange}
                        />
                      </div>
                      {pollOptions?.map((option, index) => (
                        <div className="poll-option" key={index}>
                          <p>{String.fromCharCode(65 + index)}</p>
                          <input
                            className="poll-input"
                            placeholder={`Option ${String.fromCharCode(
                              65 + index
                            )}`}
                            value={option}
                            onChange={(event) => {
                              handlePollOptionChange(index, event);
                            }}
                          />
                        </div>
                      ))}
                      <div className="button-wrapper">
                        <Button
                          type="button"
                          onClick={() => {
                            setPollStatus(false);
                            setPollTitle("");
                            setPollOptions(["", "", "", ""]);
                          }}
                          className="cancel"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={() => {
                            if (
                              pollOptions.every((option) => option !== "") &&
                              pollTitle !== ""
                            ) {
                              setPollStatus(false);
                              setPollDuration(true);
                            } else {
                              alert.show("Please fill in all options.");
                            }
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
                      <h4 onClick={handleCancelQuizCreation}>
                        <i className="fa fa-times"></i>
                      </h4>
                    </div>
                    <p className="poll-heading">Create Pop Quiz</p>
                    <form className="poll-form" onSubmit={handleQuizSubmit}>
                      {totalQuestion > 0 ? (
                        <select
                          onChange={(e) =>
                            handleSelectQuestion(parseInt(e.target.value))
                          }
                          value={questionNumber}
                        >
                          {questionNumber < totalQuestion + 1 ? (
                            <option className="1" value={totalQuestion + 1}>
                              Question {totalQuestion + 1}
                            </option>
                          ) : (
                            <option
                              className="2"
                              value={questionNumber}
                              selected={true}
                            >
                              Question {questionNumber}
                            </option>
                          )}

                          {questionArray.map((index) => (
                            <option className="3" key={index} value={index + 1}>
                              Question {index + 1}
                            </option>
                          ))}
                          {}
                        </select>
                      ) : (
                        <p>Question</p>
                      )}
                      <div className="poll-item quiz-item">
                        <p>Question {questionNumber}</p>

                        <textarea
                          className="poll-input"
                          value={pollTitle}
                          onChange={handleQuizTitleChange}
                        />
                      </div>
                      <br />
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <p>Question</p>
                        <p>Correct Option</p>
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
                              handleQuizOptionChange(index, event)
                            }
                          />
                          <input
                            type="checkbox"
                            value={String.fromCharCode(65 + index)}
                            onClick={(e) => {
                              const newAnswers = [...answers];
                              newAnswers[questionNumber - 1] = e.target.value;
                              setAnswers(newAnswers);
                            }}
                            checked={
                              answers[questionNumber - 1] ===
                              String.fromCharCode(65 + index)
                            }
                            style={{ width: "10%", height: "2rem" }}
                          />
                        </div>
                      ))}
                      <div className="button-wrapper quiz-button-wrapper">
                        <Button
                          type="button"
                          className="cancel-button"
                          onClick={handleCancelQuizCreation}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          className="add-button"
                          onClick={handleAddNextQuestion}
                        >
                          Add Q{totalQuestion + 1}
                        </Button>
                        <Button
                          type="button"
                          className="cancel-button"
                          onClick={handlePreviousQuestion}
                        >
                          Previous
                        </Button>
                        <Button
                          type="button"
                          className="cancel-button"
                          onClick={handleNextQuestion}
                        >
                          Next
                        </Button>
                      </div>
                      <Button
                        type="button"
                        className="cancel-button cancel-big"
                        style={{ width: "100%" }}
                        onClick={handleCreateQuiz}
                      >
                        Create
                      </Button>
                    </form>
                  </div>
                </Modal>
                <Modal isOpen={pollConfirmation} className="confirm-poll-modal">
                  <div className="top">
                    <h4 onClick={() => setPollConfirmation(false)}>
                      {" "}
                      <i className="fa fa-times"></i>
                    </h4>
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
                      className="cancel"
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
                <Modal isOpen={viewDuration} className="confirm-poll-modal">
                  <div className="top">
                    <h4
                      onClick={() => {
                        setQuizStatus(true);
                        setViewDuration(false);
                        if (
                          pollOptions.every((option) => option === "") &&
                          pollTitle === ""
                          // &&
                          // answers.length === totalQuestion &&
                          // totalQuestion > 0
                        ) {
                          setTotalQuestion(questionNumber - 1);
                        }
                      }}
                    >
                      <i className="fa fa-times"></i>
                    </h4>
                  </div>
                  <p className="confirm-heading">
                    Set the duration of the quiz
                  </p>

                  <div className="confirm-heading time-selector">
                    <input
                      style={{ width: "50%", marginRight: "1.5rem" }}
                      type="number"
                      value={durationValue}
                      onChange={handleDurationValueChange}
                    />
                    <select
                      value={durationUnit}
                      onChange={handleDurationUnitChange}
                    >
                      <option value="secs">Seconds</option>
                      <option value="min">Minutes</option>
                      <option value="hour">Hour</option>
                    </select>
                  </div>
                  <div className="button-wrapper">
                    <Button
                      onClick={() => {
                        setViewDuration(false);

                        setQuizConfirmation(true);
                      }}
                    >
                      Next
                    </Button>{" "}
                  </div>
                </Modal>
                <Modal isOpen={pollDuration} className="confirm-poll-modal">
                  <div className="top">
                    <h4
                      onClick={() => {
                        setPollStatus(true);
                        setPollDuration(false);
                        setDurationValue("");
                        setDurationUnit("secs");
                      }}
                    >
                      <i className="fa fa-times"></i>
                    </h4>
                  </div>
                  <p className="confirm-heading">
                    Set the duration of the Poll
                  </p>

                  <div className="confirm-heading time-selector">
                    <input
                      style={{ width: "50%", marginRight: "1.5rem" }}
                      type="number"
                      value={durationValue}
                      onChange={handleDurationValueChange}
                    />
                    <select
                      value={durationUnit}
                      onChange={handleDurationUnitChange}
                    >
                      <option value="secs">Seconds</option>
                      <option value="min">Minutes</option>
                      <option value="hour">Hour</option>
                    </select>
                  </div>
                  <div className="button-wrapper">
                    <Button
                      onClick={() => {
                        setPollDuration(false);
                        setPollConfirmation(true);
                      }}
                    >
                      Next
                    </Button>{" "}
                  </div>
                </Modal>
                <Modal isOpen={quizConfirmation} className="confirm-poll-modal">
                  <div className="top">
                    <h4
                      onClick={() => {
                        setViewDuration(true);

                        setQuizConfirmation(false);
                      }}
                    >
                      {" "}
                      <i className="fa fa-times"></i>
                    </h4>
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
                <div
                  className="time-constraints mobile-control mobile-time-constraints"
                  style={{ display: startController ? "" : "none" }}
                >
                  <i
                    className="fas fa-bars toggler-style mobile-control"
                    aria-hidden="true"
                  ></i>
                  <div className="time-tracker">
                    <p>Time Remaining</p>
                    {planname && timeLeft ? (
                      planname === "free" ? (
                        !isLoading && (
                          <CountdownTimer
                            duration={timeLeft}
                            onCompletion={handlePlanTimeOut}
                          />
                        )
                      ) : (
                        ""
                      )
                    ) : (
                      <span>00:00:00</span>
                    )}
                  </div>

                  <Button
                    className="page-title_cta-btn"
                    onClick={handleExitStream}
                  >
                    End Webinar &nbsp; <i className="fa fa-times"></i>
                  </Button>
                </div>
                <div className="page-title" style={{ display: "block" }}>
                  <div
                    className="time-constraints desktop-control"
                    style={{ visibility: startController ? "" : "hidden" }}
                  >
                    <i
                      className="fas fa-bars toggler-style mobile-control"
                      aria-hidden="true"
                    ></i>
                    <div className="time-tracker">
                      <p>Time Remaining</p>
                      {planname && timeLeft ? (
                        planname === "free" ? (
                          !isLoading && (
                            <CountdownTimer
                              duration={timeLeft}
                              onCompletion={handlePlanTimeOut}
                            />
                          )
                        ) : (
                          ""
                        )
                      ) : (
                        <span>00:00:00</span>
                      )}
                    </div>

                    <Button
                      className="page-title_cta-btn"
                      onClick={handleExitStream}
                    >
                      End Webinar &nbsp; <i className="fa fa-times"></i>
                    </Button>
                  </div>
                  <div className="title-bar">
                    <div className="page-title__text">
                      {isLoading ? "..." : title}
                      {/* <br />
                    <span>Chukwuemeka Chemazu</span> */}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span>{isLoading ? "..." : presenterDetails?.name}</span>
                      <span
                        style={{
                          width: "30%",
                          textAlign: "right",
                          visibility: startController ? "" : "hidden",
                        }}
                        className="attendies-span"
                      >
                        Attendies{" "}
                        <strong>
                          {"("}
                          {attendies - 1}
                          {")"}
                        </strong>
                      </span>
                    </div>
                  </div>
                  <div className="live-webinar-interface">
                    <div
                      className={`video-background ${
                        startController
                          ? mobileChat
                            ? "video-background-inactive"
                            : "video-background-active"
                          : ""
                      }`}
                    >
                      {startController ? (
                        <>
                          {!audioVisuals.video && (
                            <div className="waiting-image-presenter" style={{}}>
                              <img
                                style={{ borderRadius: "50%" }}
                                src={
                                  presenterDetails?.avatar ||
                                  "http://www.gravatar.com/avatar/0a97ede75643b8da8e5174438a9f7a3c?s=250&r=pg&d=mm"
                                }
                                alt="user avatar"
                                className="img-fluid"
                              />
                            </div>
                          )}
                          <video ref={myVideoRef} muted />
                        </>
                      ) : (
                        <>
                          <div className="waiting-room">
                            <div className="waiting-image">
                              <img
                                src={
                                  presenterDetails?.avatar ||
                                  "http://www.gravatar.com/avatar/0a97ede75643b8da8e5174438a9f7a3c?s=250&r=pg&d=mm"
                                }
                                alt="user avatar"
                                className="img-fluid"
                              />
                            </div>
                          </div>
                          <div className="waiting-controls">
                            <div
                              className="control-object"
                              onClick={() => {
                                setAudioVisuals({
                                  audio: !audioVisuals.audio,
                                  video: true,
                                });
                              }}
                            >
                              <i
                                className="fas fa-microphone"
                                style={
                                  !audioVisuals.audio
                                    ? {
                                        color: "#888",
                                      }
                                    : null // No additional style for the active state
                                }
                              ></i>
                              <p
                                style={
                                  !audioVisuals.audio
                                    ? {
                                        textDecoration: "line-through",
                                      }
                                    : null // No additional style for the active state
                                }
                              >
                                {audioDevices.length > 0 &&
                                  audioDevices[0].label}
                              </p>
                            </div>
                            <div
                              className="control-object"
                              onClick={() => {
                                socket.emit(
                                  "disablevideo",
                                  roomid,
                                  !audioVisuals.video
                                );

                                setAudioVisuals({
                                  video: !audioVisuals.video,
                                  audio: true,
                                });
                              }}
                              // onClick={toggleVideo}
                            >
                              <i
                                className="fas fa-video"
                                style={
                                  !audioVisuals.video
                                    ? {
                                        color: "#888",
                                      }
                                    : null // No additional style for the active state
                                }
                              ></i>
                              <p
                                style={
                                  !audioVisuals.video
                                    ? {
                                        textDecoration: "line-through",
                                      }
                                    : null // No additional style for the active state
                                }
                              >
                                {videoDevices.length > 0 &&
                                  videoDevices[0].label}
                              </p>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                    {startController ? (
                      <>
                        <Card
                          className="presenter-controls-wrapper mobile-control"
                          style={{ display: startController ? "" : "none" }}
                        >
                          {" "}
                          <div className="presenter-controls">
                            {/* <div
                              className="control-object more"
                              onClick={copyText}
                            >
                              <i className="fa fa-ellipsis-h"></i>

                              <p>More</p>
                            </div> */}
                            <div
                              className="control-object "
                              onClick={() => {
                                setAudioVisuals({
                                  audio: !audioVisuals.audio,
                                  video: true,
                                });
                              }}
                            >
                              <i
                                className="fas fa-microphone"
                                style={
                                  !audioVisuals.audio
                                    ? {
                                        background: "#cecece",
                                        color: "#888",
                                      }
                                    : null // No additional style for the active state
                                }
                              ></i>

                              <p>Mic</p>
                            </div>
                            <div
                              className="control-object"
                              onClick={() => {
                                socket.emit(
                                  "disablevideo",
                                  roomid,
                                  !audioVisuals.video
                                );

                                setAudioVisuals({
                                  video: !audioVisuals.video,
                                  audio: true,
                                });
                              }}
                              // onClick={toggleVideo}
                            >
                              <i
                                className="fas fa-video"
                                style={
                                  !audioVisuals.video
                                    ? {
                                        background: "#cecece",
                                        color: "#888",
                                      }
                                    : null // No additional style for the active state
                                }
                              ></i>

                              <p>Webcam</p>
                            </div>
                            {screenSharing ? (
                              <div
                                className="control-object more share"
                                onClick={toggleScreenSharing}
                              >
                                <i className="fa fa-desktop"></i>
                                <p>Stop Screen Share</p>
                              </div>
                            ) : (
                              <div
                                className="control-object more share"
                                onClick={toggleScreenSharing}
                              >
                                <i className="fa fa-desktop"></i>
                                <p>Share screen</p>
                              </div>
                            )}
                            {/* <div
                              className="control-object"
                              onClick={() => {
                                if (!timerHolder) {
                                  setPollStatus(true);
                                } else {
                                  alert.show("ASSESSMENT ONGOING");
                                }
                              }}
                            >
                              <i className="fas fa-poll poll"></i>

                              <p>Polls</p>
                            </div> */}
                            {/* <div
                              className="control-object"
                              onClick={() => {
                                if (!timerHolder) {
                                  setQuizStatus(true);
                                } else {
                                  alert.show("ASSESSMENT ONGOING");
                                }
                              }}
                            >
                              <i className="fas fa-book-open"></i>

                              <p>Pop Quiz</p>
                            </div> */}
                          </div>
                        </Card>

                        <div className="chat-box desktop-control">
                          <div className="chat-interface">
                            <div className="chat-interface-text">
                              {defaultChat.map((item, index) => {
                                return item.type === "quiz" ? (
                                  <></>
                                ) : (
                                  <>
                                    {item.type === "poll" ? (
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
                                              item.user ===
                                              presenterDetails?.username
                                                ? ""
                                                : "flex-start",
                                          }}
                                        >
                                          {item.user}
                                        </p>
                                        <div
                                          key={index}
                                          className={`${
                                            item.user ===
                                            presenterDetails?.username
                                              ? "user-bubble"
                                              : "chat-bubble"
                                          }`}
                                        >
                                          {item.msg}
                                        </div>
                                      </div>
                                    )}
                                  </>
                                );
                              })}
                              <div ref={chatInterfaceRef} />
                            </div>
                            <div className="chat-interface-quiz">
                              {/* {specialChat.map((i) => (
                              <p>dsd</p>
                            ))} */}
                              {specialChat.map((item, index) => {
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
                                          removePollQuizFromChat(index);
                                        }}
                                      ></i>
                                    </div>
                                    <div className="bottom">
                                      <div className="quiz-progress">
                                        {quizSubmission ||
                                        item.submissionStatus ? (
                                          <p>Quiz Over</p>
                                        ) : (
                                          <p>Quiz in Progress</p>
                                        )}

                                        <CountdownTimer
                                          // duration={convertToSeconds(
                                          //   item.duration?.durationValue,
                                          //   item.duration?.durationUnit
                                          // )}
                                          duration={
                                            Number(timerHolder.remainingTime)
                                              ? Number(
                                                  timerHolder.remainingTime
                                                )
                                              : 0
                                          }
                                          // onCompletion={handleQuizTimeOut}
                                          style={
                                            {
                                              // color: "rgb(82, 95, 127)",
                                              // fontSize: "1rem",
                                              // fontWeight: "300",
                                              // lineHeight: "1.7",
                                            }
                                          }
                                        />
                                      </div>{" "}
                                      {quizSubmission && (
                                        <div className="quiz-submission">
                                          <p>
                                            ({quizResultHolder.length}
                                            )Submitted
                                          </p>
                                          <p>View Results</p>
                                        </div>
                                      )}{" "}
                                      {quizSubmission && (
                                        <div className="quiz-submitted">
                                          <p>
                                            ({quizResultHolder?.length}
                                            )Submitted
                                          </p>
                                          <div className="quiz-result-wrapper">
                                            <div className="quiz-result">
                                              {quizResultHolder.map(
                                                (item, index) => {
                                                  return (
                                                    <div
                                                      className="single-quiz-result"
                                                      key={index}
                                                    >
                                                      <p>{index + 1}.</p>
                                                      <p
                                                        style={{
                                                          width: "55%",
                                                          wordWrap:
                                                            "break-word",
                                                        }}
                                                      >
                                                        {item.user}
                                                      </p>
                                                      <p>{item.result}%</p>
                                                    </div>
                                                  );
                                                }
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    {item.type === "poll" ? (
                                      <div className="inchat-poll">
                                        <div className="top">
                                          <span>
                                            Poll{" "}
                                            <i
                                              className="fas fa-poll poll"
                                              style={{
                                                color: "yellow",
                                                marginLeft: "5px",
                                              }}
                                            ></i>
                                          </span>
                                          <i
                                            className="fa fa-times"
                                            onClick={() => {
                                              removePollQuizFromChat(index);
                                            }}
                                          ></i>
                                        </div>
                                        <div className="bottom">
                                          <p
                                            style={{
                                              fontSize: "12px",
                                              fontWeight: "500",
                                              marginBottom: "5px",
                                            }}
                                          >
                                            {item.title}
                                          </p>

                                          <div className="poll-options">
                                            {item.submissionStatus ? (
                                              <p>Poll Over !!!</p>
                                            ) : (
                                              <Progress
                                                max={`${item.durationInSec}`}
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
                                            <Poll
                                              pollOptions={item.options}
                                              pollResult={
                                                pollResultHolder[index]
                                              }
                                            />
                                          </div>
                                        </div>
                                      </div>
                                    ) : (
                                      <></>
                                    )}
                                  </>
                                );
                              })}
                              {/* <div ref={chatInterfaceRef} /> */}
                            </div>
                          </div>

                          <div className="chat-control">
                            {showEmojiPicker && (
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
                        <div className="mobile-control presenter-room-info">
                          <div
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            <i className="fa fa-gift"></i>
                            <p
                              style={{
                                margin: 0,
                                marginLeft: "2px",
                                lineHeight: "normal",
                              }}
                              onClick={() => {
                                setMobileChat(!mobileChat);
                              }}
                            >
                              <strong> Gift</strong>
                            </p>
                          </div>
                          <p>
                            Attendies{" "}
                            <strong>
                              {"("}
                              {attendies - 1}
                              {")"}
                            </strong>
                          </p>
                        </div>
                        {mobileChat ? (
                          // <div className="mobile-control" onClick={()=>{setMobileChat(true)}}>

                          <div
                            className="chat-box mobile-control mobile-chat-box"
                            onClick={() => {
                              setMobileChat(true);
                            }}
                          >
                            <div className="chat-interface">
                              <div className="chat-interface-text">
                                {defaultChat.map((item, index) => {
                                  return item.type === "quiz" ? (
                                    <></>
                                  ) : (
                                    <>
                                      {item.type === "poll" ? (
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
                                                item.user ===
                                                presenterDetails?.username
                                                  ? ""
                                                  : "flex-start",
                                            }}
                                          >
                                            {item.user}
                                          </p>
                                          <div
                                            key={index}
                                            className={`${
                                              item.user ===
                                              presenterDetails?.username
                                                ? "user-bubble"
                                                : "chat-bubble"
                                            }`}
                                          >
                                            {item.msg}
                                          </div>
                                        </div>
                                      )}
                                    </>
                                  );
                                })}
                                <div ref={chatInterfaceRef} />
                              </div>
                              <div className="chat-interface-quiz">
                                {/* {specialChat.map((i) => (
                              <p>dsd</p>
                            ))} */}
                                {specialChat.map((item, index) => {
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
                                            removePollQuizFromChat(index);
                                          }}
                                        ></i>
                                      </div>
                                      <div className="bottom">
                                        <div className="quiz-progress">
                                          {quizSubmission ||
                                          item.submissionStatus ? (
                                            <p>Quiz Over</p>
                                          ) : (
                                            <p>Quiz in Progress</p>
                                          )}

                                          <CountdownTimer
                                            // duration={convertToSeconds(
                                            //   item.duration?.durationValue,
                                            //   item.duration?.durationUnit
                                            // )}
                                            duration={
                                              Number(timerHolder.remainingTime)
                                                ? Number(
                                                    timerHolder.remainingTime
                                                  )
                                                : 0
                                            }
                                            // onCompletion={handleQuizTimeOut}
                                            style={
                                              {
                                                // color: "rgb(82, 95, 127)",
                                                // fontSize: "1rem",
                                                // fontWeight: "300",
                                                // lineHeight: "1.7",
                                              }
                                            }
                                          />
                                        </div>{" "}
                                        {quizSubmission && (
                                          <div className="quiz-submission">
                                            <p>
                                              ({quizResultHolder.length}
                                              )Submitted
                                            </p>
                                            <p>View Results</p>
                                          </div>
                                        )}{" "}
                                        {quizSubmission && (
                                          <div className="quiz-submitted">
                                            <p>
                                              ({quizResultHolder?.length}
                                              )Submitted
                                            </p>
                                            <div className="quiz-result-wrapper">
                                              <div className="quiz-result">
                                                {quizResultHolder.map(
                                                  (item, index) => {
                                                    return (
                                                      <div
                                                        className="single-quiz-result"
                                                        key={index}
                                                      >
                                                        <p>{index + 1}.</p>
                                                        <p
                                                          style={{
                                                            width: "55%",
                                                            wordWrap:
                                                              "break-word",
                                                          }}
                                                        >
                                                          {item.user}
                                                        </p>
                                                        <p>{item.result}%</p>
                                                      </div>
                                                    );
                                                  }
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ) : (
                                    <>
                                      {item.type === "poll" ? (
                                        <div className="inchat-poll">
                                          <div className="top">
                                            <span>
                                              Poll{" "}
                                              <i
                                                className="fas fa-poll poll"
                                                style={{
                                                  color: "yellow",
                                                  marginLeft: "5px",
                                                }}
                                              ></i>
                                            </span>
                                            <i
                                              className="fa fa-times"
                                              onClick={() => {
                                                removePollQuizFromChat(index);
                                              }}
                                            ></i>
                                          </div>
                                          <div className="bottom">
                                            <p
                                              style={{
                                                fontSize: "12px",
                                                fontWeight: "500",
                                                marginBottom: "5px",
                                              }}
                                            >
                                              {item.title}
                                            </p>

                                            <div className="poll-options">
                                              {item.submissionStatus ? (
                                                <p>Poll Over !!!</p>
                                              ) : (
                                                <Progress
                                                  max={`${item.durationInSec}`}
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
                                              <Poll
                                                pollOptions={item.options}
                                                pollResult={
                                                  pollResultHolder[index]
                                                }
                                              />
                                            </div>
                                          </div>
                                        </div>
                                      ) : (
                                        <></>
                                      )}
                                    </>
                                  );
                                })}
                                {/* <div ref={chatInterfaceRef} /> */}
                              </div>
                            </div>

                            <div className="chat-control">
                              {showEmojiPicker && (
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
                        ) : (
                          <div
                            className="mobile-control mobile-message"
                            onClick={() => {
                              setMobileChat(true);
                            }}
                          >
                            <div className="message-bubble">
                              <i class="fa fa-envelope" aria-hidden="true"></i>
                              <h4>New Message</h4>
                              <p>0</p>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="chat-box no-start">
                        <p>
                          Your Live Webinar is ready, press Start to begin your
                          Webinar
                        </p>
                        <Button
                          onClick={() => {
                            // onConnect();
                            handleInitializePeer();
                          }}
                        >
                          Start
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                <Card
                  className="presenter-controls-wrapper desktop-control"
                  style={{ display: startController ? "" : "none" }}
                >
                  {" "}
                  <div className="presenter-controls">
                    <div className="control-object more" onClick={copyText}>
                      <i className="fa fa-ellipsis-h"></i>

                      <p>More</p>
                    </div>
                    <div
                      className="control-object"
                      onClick={() => {
                        setAudioVisuals({
                          audio: !audioVisuals.audio,
                          video: true,
                        });
                      }}
                    >
                      <i
                        className="fas fa-microphone"
                        style={
                          !audioVisuals.audio
                            ? {
                                background: "#cecece",
                                color: "#888",
                              }
                            : null // No additional style for the active state
                        }
                      ></i>

                      <p>Mic</p>
                    </div>
                    <div
                      className="control-object"
                      onClick={() => {
                        socket.emit(
                          "disablevideo",
                          roomid,
                          !audioVisuals.video
                        );

                        setAudioVisuals({
                          video: !audioVisuals.video,
                          audio: true,
                        });
                      }}
                      // onClick={toggleVideo}
                    >
                      <i
                        className="fas fa-video"
                        style={
                          !audioVisuals.video
                            ? {
                                background: "#cecece",
                                color: "#888",
                              }
                            : null // No additional style for the active state
                        }
                      ></i>

                      <p>Webcam</p>
                    </div>
                    {screenSharing ? (
                      <div
                        className="control-object more share"
                        onClick={toggleScreenSharing}
                      >
                        <i className="fa fa-desktop"></i>
                        <p>Stop Screen Share</p>
                      </div>
                    ) : (
                      <div
                        className="control-object more share"
                        onClick={toggleScreenSharing}
                      >
                        <i className="fa fa-desktop"></i>
                        <p>Share screen</p>
                      </div>
                    )}
                    <div
                      className="control-object"
                      onClick={() => {
                        if (!timerHolder) {
                          setPollStatus(true);
                        } else {
                          alert.show("ASSESSMENT ONGOING");
                        }
                      }}
                    >
                      <i className="fas fa-poll poll"></i>

                      <p>Polls</p>
                    </div>
                    <div
                      className="control-object"
                      onClick={() => {
                        if (!timerHolder) {
                          setQuizStatus(true);
                        } else {
                          alert.show("ASSESSMENT ONGOING");
                        }
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
