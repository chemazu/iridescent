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
  Modal,
  Progress,
  ModalHeader,
  ModalFooter,
  Spinner,
} from "reactstrap";
import "../../../custom-styles/dashboard/live-webinar.css";
import smiley from "../../../images/emojisvg.svg";
import classEnd from "../../../images/class-end.svg";
import pollEnd from "../../../images/poll-end.svg";
import quizEnd from "../../../images/quiz-end.svg";
import wave from "../../../images/wave.svg";

import { useAlert } from "react-alert";
import DashboardNavbar from "../DashboardNavbar";
import { useParams, useHistory } from "react-router-dom";

import Poll from "./Poll";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import CountdownTimer from "./TimerCountdown";
import setAuthToken from "../../../utilities/setAuthToken";
import { useDispatch } from "react-redux";
import { startLoading, stopLoading } from "../../../actions/appLoading";
import PaymentModal from "./PaymentModal";
import LiveWebinarMobileNav from "./LiveWebinarMobileNav";
import CustomTextArea from "./CustomTextArea";
import classroomAudio from "./audioEmitter";
import peerConfig from "./peerConfig";

// import TutorNotificationNavbar from "../tutorly-courses/TutorArea/TutorNotificationNavbar";

export default function Stream() {
  const { roomid } = useParams();
  const dispatch = useDispatch();
  const myVideoRef = useRef();
  const mySecondVideoRef = useRef();
  const audioRef = useRef(null);

  const myScreenRef = useRef();
  const peerRef = useRef();
  const screenPeerRef = useRef();
  const videoStreamRef = useRef(null);
  const audioRefs = useRef({});

  const [reconnectLoading, setReconnectLoading] = useState(false);
  const [planStatus, setPlanStatus] = useState(null);

  const [trackResourceDeployment, setTrackResourceDeployment] = useState({
    pollCount: 0,
    quizCount: 0,
  });

  const [selectedAudioDevice, setSelectedAudioDevice] = useState(null);
  const [speakingPeers, setSpeakingPeers] = useState({});

  const [selectedVideoDevice, setSelectedVideoDevice] = useState(null);
  const [audioDevices, setAudioDevices] = useState([]);
  const [videoDevices, setVideoDevices] = useState([]);
  const [resources, setResources] = useState([]);
  const [freeTimerStatus, disableFreeTimer] = useState(true);
  const history = useHistory();
  const chatInterfaceRef = useRef(null);
  const alert = useAlert();
  const [title, setTitle] = useState("");
  const [attendance, setAttendance] = useState(1);
  const [quizStatus, setQuizStatus] = useState(false);
  const [startController, setStartController] = useState(false);
  const [quizHolder, setQuizHolder] = useState([]);
  const [quizResultHolder, setQuizResultHolder] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [chatMessage, setChatMessage] = useState(null);
  const [pollStatus, setPollStatus] = useState(false);
  const [answerHolder, setAnswerHolder] = useState({});
  const [timerHolder, setTimerHolder] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [resourceCount, setResourceCount] = useState(null);
  const [pollTitle, setPollTitle] = useState("");
  const [defaultChat, setDefaultChat] = useState([]);
  const [specialChat, setSpecialChat] = useState([]);
  const [timeOutModal, setTimeOutModal] = useState(false);
  const [moreResources, setMoreResources] = useState(false);
  const [pollOptions, setPollOptions] = useState(["", "", "", ""]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [resourceModal, setResourceModal] = useState(false);
  const [unReadCount, setUnReadCount] = useState(0);
  const [minimizedPoll, setMinimizedPoll] = useState(false);
  const [minimizedQuiz, setMinimizedQuiz] = useState(false);
  const [resourceType, setResourceType] = useState("");
  const [editStat, setEditStat] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [saveResource, setSaveResource] = useState(false);
  const [exitModal, setExitModal] = useState(false);
  const [resourceId, setResourceId] = useState("");
  const [height, setHeight] = useState("40px"); // Set the initial height to 'auto'
  const [audioVisuals, setAudioVisuals] = useState({
    video: true,
    audio: true,
  });
  const [screenStreamhandler, setScreenStreamhandler] = useState(null);
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
  const [mobileChat, setMobileChat] = useState(false);
  const [attendanceList, setAttendanceList] = useState([]);
  const [audioRequests, setAudioRequests] = useState([]);
  const [audioRequestModal, setAudioRequestModal] = useState(false);
  const [activeSpeaker, setActiveSpeaker] = useState(false);
  const [studentSpeaking, setStudentSpeaking] = useState({});
  const [showSpeakingRequest, setShowSpeakingRequest] = useState(false);
  const [muteDelete, setMuteDelete] = useState(false);
  const [stopStudentSpeakingModal, setStopStudentSpeakingModal] =
    useState(false);
  const [blockStudentModal, setBlockStudentModal] = useState(false);
  const [showAttendance, setShowAttendance] = useState(false);

  let myArray = new Array(2).fill(0);

  const handleBlockStudent = async (type, info) => {
    dispatch(startLoading());

    let { studentIp } = info;

    let body = {
      studentIp,
      blockType: type,
      roomId: roomid,
    };
    console.log(body);

    let res = await axios.post(
      "/api/v1/blockedstudents/blocked-students",
      body
    );
    if (res) {
      socket.emit("block-user", { ...info, roomId: roomid });
    } else {
    }
    dispatch(stopLoading());
  };

  const handleStopStudentSpeaking = () => {
    socket.emit("stop student speaking", roomid);
    setActiveSpeaker(false);
    setStopStudentSpeakingModal(false);
  };

  /* eslint-disable react-hooks/exhaustive-deps */
  const toggleAudioVisuals = (type) => {
    switch (type) {
      case "cam":
        let updated = {
          audio: audioVisuals.audio,
          video: !audioVisuals.video,
        };
        setAudioVisuals(updated);
        socket.emit("audiovisuals", roomid, updated, type);

        break;
      case "mic":
        let newUpdated = {
          audio: !audioVisuals.audio,
          video: audioVisuals.video,
        };
        setAudioVisuals(newUpdated);
        socket.emit("audiovisuals", roomid, newUpdated, type);
        break;

      default:
        break;
    }
  };
  const attendanceCount = attendance || 1;

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
    // Emit a socket event to inform others in the room that screen sharing has ended
    socket.emit("stopScreenSharing", roomid);
    // Stop and release the screen-sharing stream
    if (screenStreamhandler) {
      const tracks = screenStreamhandler.getTracks();
      tracks.forEach((track) => track.stop());
      screenStreamhandler.current = null;
    }

    // Set the state to indicate that screen sharing has ended
    setScreenSharing(false);

    // Optionally, you can do any additional cleanup or actions here
  };
  const handleExitStreamModal = () => {
    setExitModal(!exitModal);
  };
  function removeDefaultPrefix(inputString) {
    // Check if the input string starts with "Default - "
    if (inputString.startsWith("Default - ")) {
      // If it does, remove the prefix and return the rest of the string
      return inputString.substring("Default - ".length);
    } else {
      // If it doesn't start with "Default - ", return the original string
      return inputString;
    }
  }
  function toggleAudioDevice(device) {
    setSelectedAudioDevice(device);
  }
  function toggleVideoDevice(device) {
    setSelectedVideoDevice(device);
  }
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
      })
      .catch(() => {});

    // Destroy the peer connection
    if (peerHolder) {
      peerHolder.destroy();
      setPeerHolder(null);
    }
    localStorage.removeItem(roomid);
    history.push("/dashboard/livewebinar");
  };
  const getSchoolUrl = (schoolname) => {
    const host = window.location.host;
    if (host.includes("localhost")) {
      return `http://${schoolname}.${host}`;
    }

    const parts = host.split(".");

    const baseDomain = parts[0] === "www" ? parts[1] : parts[0];

    return baseDomain.includes("localhost")
      ? `http://${schoolname}.${baseDomain}`
      : `https://${schoolname}.${baseDomain}.com`;
  };

  const getResourceDeploymentCount = async () => {
    let res = await axios.get("/api/v1/classroomresource/deployment-count");

    if (res) {
      if (res.data.paymentInfo === "free") {
        let { pollCount, quizCount } = res.data;
        setPlanStatus("free");
        console.log(res.data);
        console.log(trackResourceDeployment);
        setTrackResourceDeployment({ pollCount, quizCount });
      } else {
      }
    }
  };
  const createResourceDeployment = async (type) => {
    try {
      await axios.post(
        "/api/v1/classroomresource/add-deployment",
        { type },
        {}
      );
      getResourceDeploymentCount();
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    // Send a heartbeat to the server periodically
    // const heartbeatInterval = setInterval(() => {
    //   socket.emit("heartbeat", "", roomid); // Replace 'yourUserId' with the actual user identifier
    // }, 5000); // Send a heartbeat every 5 seconds (adjust as needed)

    socket.on("updateAttendance", (users) => {
      setAttendance(users);
      console.log("heart beat");
    });

    // Clean up the event listener and heartbeat interval when the component unmounts
    return () => {
      socket.off("updateAttendance");
      // clearInterval(heartbeatInterval);
    };
  }, [roomid]);
  useEffect(() => {
    getResourceDeploymentCount();
  }, [roomid]);
  function copyText() {
    if (presenterDetails.fee === 0) {
      navigator.clipboard
        .writeText(
          `${getSchoolUrl(presenterDetails.school)}/livewebinar/watch/${roomid}`
        )

        .then(() => {})
        .catch((error) => {
          console.error("Error copying text: ", error);
        });
      alert.show("Link Copied", {
        type: "success",
      });
    } else {
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
  }

  const validateWebinar = async () => {
    if (localStorage.getItem("tutorToken")) {
      setAuthToken(localStorage.getItem("tutorToken"));
    }
    setIsLoading(true);
    try {
      let res = await axios.get(`/api/v1/livewebinar/stream/${roomid}`);
      if (res) {
        setPresenterDetails({
          name: `${res.data.firstname} ${res.data.lastname} `,
          username: res.data.username,
          avatar: res.data.avatar,
          id: res.data.id,
          school: res.data.school,
          fee: res.data.fee,
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
    const percentCorrect = [correctCount, totalCount];
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
  const handleCreatePoll = async () => {
    let durationInSec = convertToSeconds(durationValue, durationUnit);

    // handle special chat

    createResourceDeployment("poll");

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

    const body = {
      type: "poll",
      title: pollTitle,
      options: pollOptions,
      durationInSec,
      timeStamp: Date.now(),
      persist: saveResource,
    };

    if (localStorage.getItem("token")) {
      setAuthToken(localStorage.getItem("token"));
    }
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    if (editStat) {
      dispatch(startLoading());
      await axios
        .put(
          `/api/v1/classroomresource/${resourceId}`,
          JSON.stringify(body),
          config
        )
        .then((res) => {
          dispatch(stopLoading());
          alert.show("Poll Edited");
          setPollTitle("");
          setPollOptions(["", "", "", ""]);
          setDurationValue("");
          setDurationUnit("secs");
          getResourceDeploymentCount();
          setResourceModal(false);
          setSaveResource(false);
        })
        .catch((error) => {
          console.error(error);
          alert.show("Poll not edited ,try again");
        });
    }
    if (!editStat) {
      dispatch(startLoading());

      await axios
        .post(
          "/api/v1/classroomresource/create/poll",
          JSON.stringify(body),
          config
        )
        .then((res) => {
          dispatch(stopLoading());
          if (saveResource) {
            alert.show("Poll saved to resources");
          }

          setPollTitle("");
          setPollOptions(["", "", "", ""]);
          setDurationValue("");
          setDurationUnit("secs");
          setSaveResource(false);
          getResourceDeploymentCount();
          setResourceModal(false);
          setSaveResource(false);
        })
        .catch((error) => {
          console.error(error);
          alert.show("Poll not submitted ,try again");
        });
    }

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

  const handleQuizCreate = async () => {
    if (pollOptions.every((option) => option !== "") && pollTitle !== "") {
      // handle special chat
      let newQuizHolder = [
        ...quizHolder,
        { question: pollTitle, options: pollOptions },
      ];

      setQuizHolder(newQuizHolder);

      let durationInSec = convertToSeconds(durationValue, durationUnit);
      setQuizResultHolder([]);
      createResourceDeployment("quiz");

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
      let timeStamp = Date.now();
      let body = {
        quizHolder: newQuizHolder,
        timeStamp,
        type: "quiz",
        answers,
        durationInSec,
        persist: saveResource,
      };
      if (localStorage.getItem("token")) {
        setAuthToken(localStorage.getItem("token"));
      }

      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };
      if (editStat) {
        await axios
          .put(
            `/api/v1/classroomresource/${resourceId}`,
            JSON.stringify(body),
            config
          )
          .then((res) => {
            if (res) {
              alert.show("Quiz Edited");
              setAnswers([]);
              setQuizHolder([]);
              setPollTitle("");
              setPollOptions(["", "", "", ""]);
              setDurationValue("");
              setDurationUnit("secs");
              setTotalQuestion(0);
              setQuestionNumber(1);
              setSaveResource(false);
              dispatch(stopLoading());
              getResourceDeploymentCount();
            }
          })
          .catch((error) => {
            console.error(error);
          });
      }
      if (!editStat) {
        dispatch(startLoading());

        await axios
          .post(
            "/api/v1/classroomresource/create/quiz",
            JSON.stringify(body),
            config
          )
          .then((res) => {
            if (res) {
              setAnswers([]);
              setQuizHolder([]);
              setPollTitle("");
              setPollOptions(["", "", "", ""]);
              setDurationValue("");
              setDurationUnit("secs");
              setTotalQuestion(0);
              setQuestionNumber(1);
              setSaveResource(false);
              getResourceDeploymentCount();

              dispatch(stopLoading());
            }
          })
          .catch((error) => {
            console.error(error);
          });
      }
      const newIndex = defaultChat.length;

      setAnswerHolder(answers);
      setAnswers([]);

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

      let timerData = {
        duration: durationInSec,
        roomid,
      };
      socket.emit("specialchat", messageData, roomid);
      setQuizSubmission(false);
      setQuizResultHolder([]);

      // socket.emit("message", messageData, roomid);
      socket.emit("startTimer", timerData);
      setPollTitle("");
      setPollOptions(["", "", "", ""]);
      setDurationValue("");
      setDurationUnit("secs");
      setTotalQuestion(0);
      setQuestionNumber(1);
    } else {
      setQuizResultHolder([]);
      createResourceDeployment("quiz");
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

      setAnswerHolder(answers);
      setAnswers([]);
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

      // socket.emit("message", messageData, roomid);
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

  const sendMessage = () => {
    if (chatMessage && chatMessage.trim() !== "") {
      socket.emit(
        "message",
        {
          user: presenterDetails?.username,
          msg: chatMessage,
          timeStamp: Date.now(),
          type: "text",
          img: presenterDetails.avatar,
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
    // setHeight("40px");

    setHeight("40px");
    setChatMessage("");
  };

  const handleKeyDown = (event) => {
    if (event.keyCode === 13) {
      event.preventDefault(); //
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
    // check the payement status
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
      // console.lof(reset the poll array)
      // setPollStatus(false);
      // setPollDuration(true);
      // setPollResultHolder([]);
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

      if (roomTimer === 600) {
        // setTimeOutModal(true);
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
        console.log("first", result);
      }

      if (type === "quiz") {
        if (answerHolder) {
          let studentRes = analyseStudentResult(answerHolder, result);

          let newSubmission = {
            user,
            result: studentRes,
          };

          const userHasSubmitted = quizResultHolder.some(
            (submission) => submission.user === user
          );

          if (!userHasSubmitted) {
            let newResult = [...quizResultHolder, newSubmission];
            setQuizResultHolder(newResult);
            setQuizSubmission(true);
          } else {
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
    validateWebinar();
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
  const handleUpdateUnReadCount = () => {
    if (!mobileChat) {
      setUnReadCount(unReadCount + 1);
    }
  };
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
      handleUpdateUnReadCount();
    });
    return () => {
      socket.off("message");
    };
  });

  useEffect(() => {
    scrollToBottom();
  }, [defaultChat]);

  let handleFreeTimer = async () => {
    let now = Date.now();
    const endTime = now + 45 * 60 * 1000;
    if (localStorage.getItem("tutorToken")) {
      setAuthToken(localStorage.getItem("tutorToken"));
    }
    try {
      let res = await axios.get(`/api/v1/livewebinar/classtimer/${roomid}`);
      if (res) {
        localStorage.setItem(roomid, res?.data.classEndTime);
      } else {
        localStorage.setItem(roomid, endTime);
      }
    } catch (error) {
      localStorage.setItem(roomid, endTime);
    }
  };

  const initializePeer = async () => {
    getResourceDeploymentCount();
    // const peerInstance = new Peer(undefined, peerConfig);
    const peerInstance = new Peer(undefined, {
      debug: 3,
      config: {
        iceServers: [
          {
            url: "turn:tuturlybeta:3478",

            credential: "credentials",
            username: "password",
          },
        ],
      },
    });

    peerRef.current = peerInstance;

    peerInstance.on("open", (peerId) => {
      console.log(peerId);
      socket.emit("broadcaster", roomid, peerId, audioVisuals);

      socket.emit("audiovisuals", roomid, audioVisuals);
    });
    handleFreeTimer();
    navigator.mediaDevices
      .getUserMedia(audioVisuals)

      .then((stream) => {
        addVideoStream(myVideoRef.current, stream);
        addVideoStream(mySecondVideoRef.current, stream);

        videoStreamRef.current = stream;
      })
      .catch((error) => console.error(error));

    peerInstance.on("call", (call) => {
      call.answer(videoStreamRef.current);
    });
  };
  const handleMuteStudent = (studentSpeaking) => {
    console.log(studentSpeaking);
    audioRefs.current[studentSpeaking.socketId].muted = true;

    socket.emit("disable student audio", roomid, studentSpeaking.socketId);
  };
  const initializeScreenPeer = async () => {
    navigator.mediaDevices
      .getDisplayMedia({ video: true, audio: true })
      .then((stream) => {
        const screenSharingTrack = stream.getVideoTracks()[0];
        screenSharingTrack.addEventListener("ended", () => {
          handleScreenSharingEnded();
        });
        const screenInstance = new Peer();
        screenPeerRef.current = screenInstance;
        setScreenStreamhandler(stream);
        screenInstance.on("open", (peerId) => {
          socket.emit("startScreenSharing", roomid, peerId);
        });
        // screenStreamRef.current = stream;
        addVideoStream(myScreenRef.current, stream);
        // screenStreamRef.current = stream;
        // setScreenMedia(stream)
        screenInstance.on("call", (call) => {
          call.answer(stream);
        });
        setReconnectLoading(false);
      });
  };
  useEffect(() => {
    if (startController) {
      initializePeer();
    }
    return () => {
      // Destroy the Peer instance
      if (peerRef.current) {
        peerRef.current.destroy();
      }
    };
  }, [roomid, startController]);

  useEffect(() => {
    if (startController) {
      if (screenSharing) {
        initializeScreenPeer();
      } else {
        // handleScreenSharingEnded();
      }
    }
    return () => {};
  }, [roomid, screenSharing, startController]);

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

        // Check if there are audio devices available
        if (audioDevices.length > 0) {
          setSelectedAudioDevice(audioDevices[0]); // Set the first audio device as the initial selection
        }
        if (videoDevices.length > 0) {
          setSelectedVideoDevice(videoDevices[0]); // Set the first video device as the initial selection
        }

        setAudioDevices(audioDevices);
        setVideoDevices(videoDevices);
      } catch (error) {
        console.error("Error enumerating media devices:", error);
      }
    }

    getMediaDevices();
  }, []);
  useEffect(() => {
    socket.on("request audio", (studentSocketId) => {
      const foundStudent = attendanceList.find(
        (student) => student.socketId === studentSocketId
      );
      const foundStudentIndex = audioRequests.findIndex(
        (student) => student.socketId === studentSocketId
      );

      if (foundStudentIndex !== -1) {
        // Check if the existing entry is declined, and update it accordingly
        if (audioRequests[foundStudentIndex].declined) {
          const updatedAudioRequests = [...audioRequests];
          updatedAudioRequests[foundStudentIndex] = {
            ...foundStudent,
            selected: false,
            declined: false, // Reset declined to false
          };
          setAudioRequests(updatedAudioRequests);
          setAudioRequestModal(true);
        } else {
          // Entry already exists and is not declined
          console.log(
            `Student with socketId ${studentSocketId} already in audioRequests.`
          );
        }
      } else {
        // Add the new entry to audioRequests
        setAudioRequests((prevAudioRequests) => [
          ...prevAudioRequests,
          { ...foundStudent, selected: false, declined: false },
        ]);
        setAudioRequestModal(true);
      }
    });

    return () => {
      socket.off("request audio");
    };
  }, [attendanceList, audioRequests, socket]);

  // useEffect(() => {
  //   socket.on(
  //     "student stream",
  //     (peerId, audioStat) =>
  //     {
  //       console.log(audioStat, peerId);
  //       const receiveSudentPeer = new Peer();
  //       receiveSudentPeer.on("open", () => {
  //         navigator.mediaDevices
  //           .getUserMedia({ video: false, audio: true })
  //           .then((newStream) => {
  //             let call = receiveSudentPeer.call(peerId, newStream);
  //             // const call = peerInstance.call(peerId, fast);
  //             call?.on("stream", (remoteStream) => {
  //               if (audioRef.current) {
  //                 audioRef.current.srcObject = remoteStream;
  //                 audioRef.current.muted = !audioStat;
  //                 audioRef.current.onloadedmetadata = () => {
  //                   // Media has loaded, you can now play it
  //                   audioRef.current
  //                     .play()
  //                     .then(() => {
  //                       console.log("Audio playback started successfully");
  //                     })
  //                     .catch((error) => {
  //                       console.error("Audio playback error:", error);
  //                     });
  //                 };
  //                 audioRef.current.oncanplay = () => {
  //                   // Media can be played, but it may not have fully loaded yet
  //                 };

  //                 // Add an event listener to handle interruptions
  //                 audioRef.current.onabort = () => {
  //                   console.error("Audio load request was interrupted");
  //                 };
  //                 // const audioContext = new AudioContext();
  //                 // const source =
  //                 //   audioContext.createMediaStreamSource(remoteStream);

  //                 // source.connect(audioContext.destination);

  //                 // // Define a threshold for sound activity (adjust as needed)
  //                 // const soundThreshold = 0.05;

  //                 // // Listen for audio activity
  //                 // source.onaudioprocess = (event) => {
  //                 //   const audioBuffer = event.inputBuffer.getChannelData(0);
  //                 //   const rms = calculateRMS(audioBuffer);

  //                 //   if (rms > soundThreshold) {
  //                 //     console.log("student Sound is being inputted");
  //                 //   }
  //                 // };

  //                 // Listen for audio activity
  //               } else {
  //                 console.log("error");
  //                 console.log(audioRef.current);
  //               }
  //               function calculateRMS(buffer) {
  //                 let sum = 0;
  //                 for (let i = 0; i < buffer.length; i++) {
  //                   sum += buffer[i] * buffer[i];
  //                 }
  //                 return Math.sqrt(sum / buffer.length);
  //               }
  //             });
  //             call?.on("error", (error) => {
  //               console.error("Call error:", error);
  //             });
  //             // });
  //           });
  //       });
  //     }
  //   );

  //   return () => {};
  // }, [roomid]);
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

              const foundStudent = attendanceList.find(
                (student) => student.socketId === socketId
              );
              const foundStudentIndex = attendanceList.findIndex(
                (student) => student.socketId === socketId
              );
              console.log(foundStudent);
              if (foundStudentIndex !== -1) {
                setAttendanceList((prevAttendanceList) => {
                  const updatedAttendanceList = [...prevAttendanceList];
                  const foundStudent = updatedAttendanceList[foundStudentIndex];

                  // Update speaking status in the found student
                  foundStudent.speakingStatus = true;
                  foundStudent.audioStatus = audioStat;

                  return updatedAttendanceList;
                });
                setStudentSpeaking({
                  ...foundStudent,
                  status: false,
                  audioStatus: audioStat,
                });
                setActiveSpeaker(true);
              }
              setSpeakingPeers((prevSpeakingPeers) => {
                if (!prevSpeakingPeers.hasOwnProperty(peerId)) {
                  return {
                    ...prevSpeakingPeers,
                    [socketId]: {
                      peer: peerId,
                      audioRef: newAudioRef,
                      socket: socketId,
                    },
                  };
                }

                return prevSpeakingPeers;
              });
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

  // Helper function to create an audio element
  const createAudioRef = () => {
    const audioElement = document.createElement("audio");
    document.body.appendChild(audioElement); // Append to the body or another container as needed
    return audioElement;
  };

  useEffect(() => {
    socket.on("student audio stat", (audioStat, socketId) => {
      console.log("Audio Stat:", audioStat, "Socket ID:", socketId);

      // Mute or unmute the audio reference based on socketId
      if (Object.keys(studentSpeaking).length !== 0) {
        setActiveSpeaker(true);
      }
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
    socket.on("speaking_status", (status, studentSocketId, audioStatus) => {
      console.log(studentSocketId);

      const foundStudent = attendanceList.find(
        (student) => student.socketId === studentSocketId
      );
      const foundStudentIndex = attendanceList.findIndex(
        (student) => student.socketId === studentSocketId
      );
      console.log(foundStudent);
      if (foundStudentIndex !== -1) {
        setStudentSpeaking({ ...foundStudent, status, audioStatus });
        setActiveSpeaker(true);
      }
    });

    return () => {
      socket.off("speaking_status");
    };
  }, [roomid, attendanceList]);

  useEffect(() => {
    socket.on(
      "watcher",
      (
        socketId,
        peerId,
        userName,
        watcherAvatar,
        studentId,
        registeredUser,
        studentIp
      ) => {
        setAttendanceList((prevAttendanceList) => [
          ...prevAttendanceList,
          {
            socketId,
            peerId,
            userName,
            watcherAvatar,
            studentId,
            registeredUser,
            studentIp,
            speakingStatus: false,
          },
        ]);
        setShowAttendance(showAttendance);
      }
    );
  }, [roomid]);

  useEffect(() => {
    socket.on("speaking student has left", (socketId) => {
      console.log(socketId);

      const foundStudent = attendanceList.find(
        (student) => student.socketId === socketId
      );
      const foundStudentIndex = attendanceList.findIndex(
        (student) => student.socketId === socketId
      );
      console.log(foundStudent);
      console.log(speakingPeers);
      if (foundStudentIndex !== -1) {
        console.log(studentSpeaking);
        setActiveSpeaker(false);

        // setStudentSpeaking({});

        console.log(studentSpeaking);
        if (
          Object.keys(studentSpeaking).length !== 0 &&
          studentSpeaking.socketId === socketId
        ) {
          setStudentSpeaking({});
        }
        if (speakingPeers[socketId]) {
          setSpeakingPeers((prevSpeakingPeers) => {
            const updatedSpeakingPeers = { ...prevSpeakingPeers };
            delete updatedSpeakingPeers[socketId];
            return updatedSpeakingPeers;
          });
        }

        // console.log(speakingPeers);
        setAttendanceList((prevAttendanceList) =>
          prevAttendanceList.filter((student) => student.socketId !== socketId)
        );
      }
    });

    return () => {
      socket.off("speaking student has left");
    };
  }, [roomid, attendanceList, studentSpeaking]);

  useEffect(() => {
    socket.on("watcher-exit", (socketId) => {
      console.log("first");
      const foundStudentIndex = attendanceList.findIndex(
        (student) => student.socketId === socketId
      );
      console.log(foundStudentIndex);

      if (foundStudentIndex !== -1) {
        setAttendanceList((prevAttendanceList) =>
          prevAttendanceList.filter((student) => student.socketId !== socketId)
        );
      }
    });
  }, [roomid, showAttendance]);

  const handleInitializePeer = () => {
    setStartController(true);
  };

  const toggleScreenSharing = () => {
    if (screenSharing) {
      setScreenSharing(false);
      handleScreenSharingEnded();
    } else {
      setScreenSharing(true);
      setReconnectLoading(true);
    }
  };

  function formatTimeAndDate(timestamp) {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const dateObj = new Date(timestamp);
    const hours = String(dateObj.getHours()).padStart(2, "0");
    const minutes = String(dateObj.getMinutes()).padStart(2, "0");
    const month = months[dateObj.getMonth()];
    const day = dateObj.getDate();

    const formattedTime = `${hours}:${minutes}`;
    const formattedDate = `${month} ${day}`;

    return [formattedTime, formattedDate];
  }
  const handlePollEdit = async (id) => {
    dispatch(startLoading());
    setEditStat(true);
    setResourceModal(false);
    setResourceId(id);

    try {
      const response = await axios.get(`/api/v1/classroomresource/${id}`);
      const { title, options, durationInSec } = response?.data;
      setPollTitle(title);
      setPollOptions(options);
      setDurationValue(durationInSec);
      // handle duration unit
      setPollStatus(true);
      getResourceDeploymentCount();

      dispatch(stopLoading());

      //
    } catch (error) {
      console.error("Error fetching resources:", error);
    }
  };
  const handleQuizEdit = async (id) => {
    dispatch(startLoading());
    setEditStat(true);
    setResourceId(id);

    try {
      const response = await axios.get(`/api/v1/classroomresource/${id}`);
      const {
        durationInSec,
        quizHolder: quizHolderData,
        answers: answersData,
      } = response?.data;

      // handle duration unit
      setDurationValue(durationInSec);
      setQuizHolder(quizHolderData);
      setAnswers(answersData);
      setPollTitle(quizHolderData[quizHolderData.length - 1].question);
      setPollOptions(quizHolderData[quizHolderData.length - 1].options);
      setTotalQuestion(quizHolderData.length);
      setQuestionNumber(quizHolderData.length);
      setResourceModal(false);
      setQuizStatus(true);
      dispatch(stopLoading());

      //
    } catch (error) {
      // dispatch(stopLoading());
    }
  };

  const handleOpenResourceModalController = async (type) => {
    if (planStatus === "free") {
      if (type === "poll") {
        if (trackResourceDeployment.pollCount < 3) {
          handleOpenResourceModal(type);
        } else {
          setMoreResources({
            status: "true",
            type,
          });
        }
      }
      if (type === "quiz") {
        if (trackResourceDeployment.quizCount < 3) {
          handleOpenResourceModal(type);
        } else {
          setMoreResources({
            status: "true",
            type,
          });
        }
      }
    } else {
      handleOpenResourceModal(type);
    }
  };

  const handleOpenResourceModal = async (type) => {
    dispatch(startLoading());
    // check the
    try {
      console.log(type);
      const response = await axios.get(
        `/api/v1/classroomresource/creator-resources/${type}?page=${1}`
      );
      setResourceType(type);
      setResources(response.data.resources);
      dispatch(stopLoading());
      setResourceModal(true);
    } catch (error) {
      console.error("Error fetching resources:", error);
      dispatch(stopLoading());
    }
  };
  const handlePollSelect = (item) => {
    let { type, title, options, durationInSec } = item;
    if (type === "poll") {
      setPollResultHolder([]);

      createResourceDeployment("poll");
      setSpecialChat([
        {
          user: 1,
          type,
          title,
          options,
          durationInSec,
          submissionStatus: false,
        },
      ]);
      socket.emit(
        "specialchat",
        {
          user: presenterDetails.username || 1,
          type,
          title,
          options,
          timeStamp: Date.now(),
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
      setResourceModal(false);
    } else {
      let { durationInSec } = item;
      setAnswerHolder(item.answers);
      setQuizResultHolder([]);
      createResourceDeployment("quiz");
      setSpecialChat([
        {
          user: 1,
          quizHolder: item.quizHolder,
          type: "quiz",
          timeStamp: Date.now(),
          submissionStatus: false,
          duration: durationInSec,
        },
      ]);
      let timerData = {
        duration: durationInSec,
        roomid,
      };
      const messageData = {
        user: 1,
        quizHolder: item.quizHolder,
        type: "quiz",
        timeStamp: Date.now(),
        duration: durationInSec,

        questionControl: 1,
      };
      socket.emit("specialchat", messageData, roomid);

      socket.emit("startTimer", timerData);
      setResourceModal(false);

      setPollTitle("");
      setPollOptions(["", "", "", ""]);
      setDurationValue("");
      setDurationUnit("secs");
    }
  };

  const handleDeleteModal = (id) => {
    setDeleteModal(true);
    setResourceId(id);
    setResourceModal(false);
  };
  const handleDeleteResource = async () => {
    setDeleteModal(false);

    dispatch(startLoading());

    try {
      const response = await axios.delete(
        `/api/v1/classroomresource/${resourceId}`
      );
      if (response) {
        dispatch(stopLoading());
      }
    } catch (error) {
      dispatch(stopLoading());
    }
  };
  let parent = {
    startController,
    planname,
    isLoading,
    roomid,
    setTimeOutModal,
    handlePlanTimeOut,
    freeTimerStatus,
    handleExitStreamModal,
  };
  const grantStudentAudio = (studentInfo) => {
    const { peerId, socketId } = studentInfo;

    // Update the selected property for the chosen item
    const updatedAudioRequests = audioRequests.map((item) => {
      if (item.peerId === peerId && item.socketId === socketId) {
        return {
          ...item,
          selected: true,
        };
      } else {
        return item;
      }
    });

    // Emit the socket event and update the state
    socket.emit("grant student access", roomid, socketId);
    setAudioRequests(updatedAudioRequests);
    if (
      updatedAudioRequests.filter((item) => !item.selected && !item.declined)
        .length < 1
    ) {
      setAudioRequestModal(false);
    }
  };

  const rejectStudentAudio = (studentInfo) => {
    const { peerId, socketId } = studentInfo;

    // Update the selected property for the chosen item and set declined to true
    const updatedAudioRequests = audioRequests.map((item) => {
      if (item.peerId === peerId && item.socketId === socketId) {
        return {
          ...item,
          declined: true,
        };
      } else {
        return item;
      }
    });

    // Emit the socket event and update the state
    socket.emit("reject student access", roomid, socketId);
    setAudioRequests(updatedAudioRequests);
    if (
      updatedAudioRequests.filter((item) => !item.selected && !item.declined)
        .length < 1
    ) {
      setAudioRequestModal(false);
    }
  };
  let filteredAudioRequests = audioRequests.filter(
    (item) => !item.selected && !item.declined
  );
  return (
    <div className="dashboard-layout">
      <audio ref={audioRef} />

      <Container fluid>
        <Row>
          <DashboardNavbar />
          <LiveWebinarMobileNav parent={parent} />

          <Col className="page-actions__col">
            <div className="live-webinar live-webinar-stream">
              <div className="stream-webinar-content">
                <Modal
                  isOpen={blockStudentModal}
                  className="confirm-poll-modal"
                >
                  <div className="top">
                    <h4>
                      {" "}
                      <i className="fa fa-times"></i>
                    </h4>
                  </div>
                  <p className="confirm-heading" style={{ padding: "0 15%" }}>
                    Are you sure you want to block this student?
                  </p>

                  <div className="button-wrapper">
                    <Button
                      onClick={() => {
                        setBlockStudentModal(false);
                      }}
                      className="cancel"
                    >
                      No
                    </Button>{" "}
                    <Button
                      onClick={() => {
                        // handleBlockStudent(
                        //   "class",
                        //   studentSpeaking
                        // );
                      }}
                    >
                      Yes
                    </Button>
                  </div>
                </Modal>
                <Modal
                  isOpen={stopStudentSpeakingModal}
                  className="confirm-poll-modal"
                >
                  <div className="top">
                    <h4>
                      {" "}
                      <i className="fa fa-times"></i>
                    </h4>
                  </div>
                  <p className="confirm-heading" style={{ padding: "0 15%" }}>
                    Are you sure you want to stop this student from speaking ?
                  </p>

                  <div className="button-wrapper">
                    <Button
                      onClick={() => {
                        setStopStudentSpeakingModal(false);
                      }}
                      className="cancel"
                    >
                      No
                    </Button>{" "}
                    <Button
                      onClick={() => {
                        handleStopStudentSpeaking();
                      }}
                    >
                      Yes
                    </Button>
                  </div>
                </Modal>
                <Modal
                  isOpen={audioRequestModal}
                  className="audio-request-modal"
                >
                  <i
                    className="fa fa-times close-icon"
                    onClick={() => {
                      setAudioRequestModal(false);
                    }}
                  ></i>

                  {filteredAudioRequests.length === 1 ? (
                    <>
                      {" "}
                      {filteredAudioRequests.map((item, index) => {
                        console.log(item);
                        return (
                          <div className="single-speaking-request" key={index}>
                            <p>{item.userName} is requesting to speak</p>
                            <div className="speaking-request-permissions">
                              <p
                                className="speaking-accept hover"
                                onClick={() => {
                                  grantStudentAudio(item);
                                }}
                              >
                                Accept
                              </p>
                              <p
                                className="speaking-decline hover"
                                onClick={() => {
                                  rejectStudentAudio(item);
                                }}
                              >
                                Decline
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </>
                  ) : (
                    <>
                      <div
                        className="speaking-request"
                        style={{
                          borderBottom:
                            showSpeakingRequest && "1px solid #3d3c3c",
                          paddingBottom: showSpeakingRequest && "2.5%",
                        }}
                      >
                        <strong>
                          {filteredAudioRequests.length}{" "}
                          {filteredAudioRequests.length > 1
                            ? "People"
                            : "Person"}
                        </strong>
                        &nbsp;
                        <span>
                          {" "}
                          {filteredAudioRequests.length > 1 ? "are" : "is"}
                        </span>
                        &nbsp;
                        <span> requesting to speak</span>
                        <i
                          className={`      hover ${
                            showSpeakingRequest
                              ? "fa fa-angle-up"
                              : "fa fa-angle-down"
                          }`}
                          onClick={() =>
                            setShowSpeakingRequest(!showSpeakingRequest)
                          }
                        ></i>
                      </div>
                      {showSpeakingRequest && (
                        <div className="multiple-request-permission-wrapper">
                          {filteredAudioRequests.map((item, index) => {
                            return (
                              <div
                                className="multiple-speaking-request"
                                key={index}
                              >
                                <p className="speaker-user">{item.userName} </p>
                                <div className="speaking-request-permissions">
                                  <p
                                    className="speaking-accept hover"
                                    onClick={() => {
                                      grantStudentAudio(item);
                                    }}
                                  >
                                    Accept
                                  </p>
                                  <p
                                    className="speaking-decline hover"
                                    onClick={() => {
                                      rejectStudentAudio(item);
                                    }}
                                  >
                                    Decline
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </>
                  )}
                </Modal>
                <Modal isOpen={exitModal}>
                  <ModalHeader>
                    <p style={{ textAlign: "center", margin: 0 }}>
                      Are you certain about ending this classroom? Once you
                      leave, you won't be able to come back.
                    </p>
                  </ModalHeader>

                  <ModalFooter>
                    <div className="button-wrapper">
                      <Button
                        type="button"
                        onClick={() => {
                          setExitModal(false);
                        }}
                        className="cancel"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() => {
                          handleExitStream();
                          // handleExitStreamModal();
                        }}
                      >
                        End
                      </Button>
                    </div>
                  </ModalFooter>
                </Modal>
                <Modal isOpen={deleteModal}>
                  <ModalHeader>
                    Are you sure you want to delete this resource
                  </ModalHeader>

                  <ModalFooter>
                    <div className="button-wrapper">
                      <Button
                        type="button"
                        onClick={() => {
                          setDeleteModal(false);
                        }}
                        className="cancel"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() => {
                          handleDeleteResource();
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </ModalFooter>
                </Modal>
                <Modal isOpen={resourceModal}>
                  <Card className="instant-webinar-options">
                    <div className="top">
                      {resourceType === "quiz" && (
                        <p className="page-title__text">Your Quizzes</p>
                      )}
                      {resourceType === "poll" && (
                        <p className="page-title__text">Your Polls</p>
                      )}

                      <h4
                        onClick={() => {
                          setResourceModal(false);
                        }}
                      >
                        <i className="fa fa-times"></i>
                      </h4>
                    </div>
                    <div className="resource-content">
                      {resources?.map((item, index) => {
                        const { type, timeStamp, quizHolder, title, _id } =
                          item;
                        return (
                          <div className="single-resource-card" key={index}>
                            <div className="resource-top">
                              <p
                                className="page-title__text"
                                onClick={() => {
                                  handlePollSelect(item);
                                }}
                              >
                                {resourceType} 0{index + 1}
                              </p>
                              {type === "quiz" && (
                                <p>{quizHolder?.length} Questions</p>
                              )}
                              {type === "poll" && <p>{title}</p>}
                            </div>
                            <div className="resource-bottom">
                              <p>{formatTimeAndDate(timeStamp)[0]}</p>{" "}
                              <p>{formatTimeAndDate(timeStamp)[1]}</p>
                              <div>
                                {type === "poll" && (
                                  <i
                                    className="fa fa-pencil"
                                    onClick={() => {
                                      handlePollEdit(_id);
                                    }}
                                  ></i>
                                )}
                                {type === "quiz" && (
                                  <i
                                    className="fa fa-pencil"
                                    onClick={() => {
                                      handleQuizEdit(_id);
                                    }}
                                  ></i>
                                )}
                                <i
                                  className="fa fa-trash"
                                  onClick={() => {
                                    handleDeleteModal(_id);
                                  }}
                                  style={{ marginLeft: ".5rem" }}
                                ></i>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div
                      style={{
                        paddingTop: "1rem",
                      }}
                    >
                      {resourceType.toLowerCase() === "quiz" && (
                        <div
                          className="single-resource-card empty"
                          onClick={() => {
                            if (resourceCount?.quizCount >= 3) {
                              setMoreResources({
                                status: "true",
                                type: "quiz",
                              });
                            } else {
                              setResourceModal(false);

                              setQuizStatus(true);
                            }
                          }}
                        >
                          <p>Click here to create new Quiz</p>
                        </div>
                      )}
                      {resourceType.toLowerCase() === "poll" && (
                        <div
                          className="single-resource-card empty"
                          onClick={() => {
                            if (resourceCount?.pollCount >= 3) {
                              setMoreResources({
                                status: "true",
                                type: "poll",
                              });
                            } else {
                              setResourceModal(false);

                              setPollStatus(true);
                            }
                          }}
                        >
                          <p>Click here to create new poll</p>
                        </div>
                      )}
                    </div>
                  </Card>
                </Modal>
                <Modal isOpen={timeOutModal}>
                  <div className="close-time-out">
                    <h4
                      onClick={() => {
                        setTimeOutModal(false);
                        disableFreeTimer(false);
                      }}
                      style={{ alignSelf: "end" }}
                    >
                      <i className="fa fa-times"></i>
                    </h4>
                    <img src={classEnd} alt="timer" qw />
                    <h2 style={{ alignSelf: "center" }}>
                      You have 10 Mins left before your class ends.
                    </h2>

                    <PaymentModal
                      roomId={roomid}
                      type={"time"}
                      close={() => {
                        setTimeOutModal(false);
                      }}
                    />
                  </div>
                </Modal>
                <Modal isOpen={moreResources.status}>
                  <div className="close-time-out">
                    <h4
                      onClick={() => {
                        setMoreResources({
                          status: false,
                          type: moreResources.type,
                        });
                      }}
                      style={{ alignSelf: "end" }}
                    >
                      <i className="fa fa-times"></i>
                    </h4>
                    {moreResources.type === "poll" && (
                      <img src={pollEnd} alt="poll" />
                    )}
                    {moreResources.type === "quiz" && (
                      <img src={quizEnd} alt="quiz" />
                    )}

                    <h2 style={{ alignSelf: "center" }}>
                      You have reached your {moreResources.type} limit
                    </h2>

                    <PaymentModal
                      roomId={roomid}
                      type={moreResources.type}
                      close={() => {
                        setMoreResources({
                          status: false,
                          type: moreResources.type,
                        });
                      }}
                      updateCount={(number) => {
                        if (moreResources.type === "poll") {
                          setResourceCount({
                            pollCount: resourceCount.pollCount - number,
                            quizCount: resourceCount.quizCount,
                            resourceCount: resourceCount.resourceCount,
                          });
                          setTrackResourceDeployment({
                            pollCount:
                              trackResourceDeployment.pollCount - number,
                            quizCount: trackResourceDeployment.quizCount,
                          });
                        }
                        if (moreResources.type === "quiz") {
                          setResourceCount({
                            quizCount: resourceCount.quizCount - number,
                            pollCount: resourceCount.pollCount,
                            resourceCount: resourceCount.resourceCount,
                          });
                          setTrackResourceDeployment({
                            quizCount:
                              trackResourceDeployment.quizCount - number,
                            pollCount: trackResourceDeployment.pollCount,
                          });
                        }
                      }}
                    />
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
                    {editStat ? (
                      <p className="poll-heading">Edit Poll</p>
                    ) : (
                      <p className="poll-heading">Create Poll</p>
                    )}
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
                              setPollResultHolder([]);
                            } else {
                              alert.show("Please fill in all options.");
                            }
                          }}
                        >
                          {editStat ? "Edit" : "Create"}
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

                    {editStat ? (
                      <p className="poll-heading">Edit Pop Quiz</p>
                    ) : (
                      <p className="poll-heading">Create Pop Quiz</p>
                    )}

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
                        {editStat ? "Edit" : "Create"}
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
                  {editStat ? (
                    <p className="confirm-heading">
                      Are you sure you want to edit this poll?
                    </p>
                  ) : (
                    <p className="confirm-heading">
                      Are you sure you want to create this poll?
                    </p>
                  )}
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
                  {!editStat && (
                    <div className="save-resource">
                      <input
                        type="checkbox"
                        onChange={() => {
                          setSaveResource(!saveResource);
                        }}
                        value={saveResource}
                      />
                      <p>Save to classroom resource</p>
                    </div>
                  )}
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
                        setPollResultHolder([]);

                        handlePollSubmit(e);
                      }}
                    >
                      Yes
                    </Button>
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
                <Modal isOpen={viewDuration} className="confirm-poll-modal">
                  <div className="top">
                    <h4
                      onClick={() => {
                        setQuizStatus(true);
                        setViewDuration(false);
                        if (
                          pollOptions.every((option) => option === "") &&
                          pollTitle === ""
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

                  {editStat ? (
                    <p className="confirm-heading">
                      Are you sure you want to edit this quiz?
                    </p>
                  ) : (
                    <p className="confirm-heading">
                      Are you sure you want to create this quiz?
                    </p>
                  )}
                  <p className="confirm-heading">{pollTitle}</p>
                  <div className="save-resource">
                    <input
                      type="checkbox"
                      onChange={() => {
                        setSaveResource(!saveResource);
                      }}
                      value={saveResource}
                    />
                    <p>Save to classroom resource</p>
                  </div>
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
                  className={`page-title ${defaultChat.length >= 1 ? "" : ""}`}
                  style={{ display: "block" }}
                >
                  <div
                    className="time-constraints desktop-control"
                    style={{ visibility: startController ? "" : "hidden" }}
                  >
                    <i
                      className="fas fa-bars toggler-style mobile-control"
                      aria-hidden="true"
                    ></i>

                    {planname && (
                      <>
                        {planname === "free" && (
                          <div className="time-tracker">
                            {/* <p>Get More Time</p> */}
                            <p>Time Remaining</p>
                            {isLoading ? (
                              <span>00:00:00</span>
                            ) : parseInt(localStorage.getItem(`${roomid}`)) ? (
                              <CountdownTimer
                                endTime={parseInt(
                                  localStorage.getItem(`${roomid}`)
                                )}
                                firstReminder={() => {
                                  setTimeOutModal(true);
                                }}
                                classOver={() => {
                                  handlePlanTimeOut();
                                }}
                                freeTimerStatus={freeTimerStatus}
                              />
                            ) : (
                              <span>00:00:00</span>
                            )}
                          </div>
                        )}
                      </>
                    )}

                    <Button
                      className="page-title_cta-btn"
                      onClick={handleExitStreamModal}
                    >
                      End Class &nbsp; <i className="fa fa-times"></i>
                    </Button>
                  </div>
                  <div className="title-bar">
                    <div className="page-title__text">
                      {isLoading ? "..." : title}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span>{isLoading ? "..." : presenterDetails?.name}</span>
                      <div className="attendies-wrapper">
                        {showAttendance && (
                          <span
                            onClick={() => {
                              setShowAttendance(false);
                            }}
                            className="hover"
                          >
                            Chat
                          </span>
                        )}
                        <span
                          style={{
                            width: "30%",
                            textAlign: showAttendance && "right",
                            visibility: startController ? "" : "hidden",
                          }}
                          onClick={() => {
                            setShowAttendance(!showAttendance);
                          }}
                          className="attendies-span hover"
                        >
                          Attendies{" "}
                          <strong>
                            {"("}
                            {attendanceCount}
                            {")"}
                          </strong>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div
                    className="live-webinar-interface"
                    style={{
                      height: startController ? "100%" : "auto",
                    }}
                  >
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
                          {!audioVisuals.video && !screenSharing && (
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
                          <video
                            ref={myVideoRef}
                            muted
                            style={{
                              height: screenSharing && "0px",
                            }}
                          />
                          {reconnectLoading && (
                            <div className="reconnect-screen">
                              <Spinner />
                            </div>
                          )}
                          <video
                            ref={myScreenRef}
                            muted
                            // className="desktop-control"
                          />
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
                            <div className="control-object">
                              <i
                                className="fas fa-microphone"
                                style={
                                  !audioVisuals.audio
                                    ? {
                                        color: "#888",
                                      }
                                    : null // No additional style for the active state
                                }
                                onClick={() => {
                                  toggleAudioVisuals("mic");
                                }}
                              ></i>

                              <select
                                style={
                                  !audioVisuals.audio
                                    ? {
                                        textDecoration: "line-through",
                                      }
                                    : null // No additional style for the active state
                                }
                                value={
                                  selectedAudioDevice
                                    ? selectedAudioDevice.deviceId
                                    : ""
                                }
                                onChange={(e) => {
                                  const selectedDeviceId = e.target.value;
                                  const selectedDevice = audioDevices.find(
                                    (device) =>
                                      device.deviceId === selectedDeviceId
                                  );
                                  toggleAudioDevice(selectedDevice);
                                }}
                              >
                                {audioDevices.map((device) => (
                                  <option
                                    key={device.deviceId}
                                    value={device.deviceId}
                                  >
                                    {removeDefaultPrefix(device.label)}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="control-object">
                              <i
                                onClick={() => {
                                  toggleAudioVisuals("cam");
                                }}
                                className="fas fa-video"
                                style={
                                  !audioVisuals.video
                                    ? {
                                        color: "#888",
                                      }
                                    : null // No additional style for the active state
                                }
                              ></i>
                              <select
                                value={
                                  selectedVideoDevice
                                    ? selectedVideoDevice.deviceId
                                    : ""
                                }
                                onChange={(e) => {
                                  const selectedDeviceId = e.target.value;
                                  const selectedDevice = videoDevices.find(
                                    (device) =>
                                      device.deviceId === selectedDeviceId
                                  );
                                  toggleVideoDevice(selectedDevice);
                                }}
                                style={
                                  !audioVisuals.video
                                    ? {
                                        textDecoration: "line-through",
                                      }
                                    : null // No additional style for the active state
                                }
                              >
                                {videoDevices.map((device) => (
                                  <option
                                    key={device.deviceId}
                                    value={device.deviceId}
                                  >
                                    {device.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </>
                      )}
                      {Object.keys(speakingPeers).length === 0
                        ? ""
                        : // activeSpeaker && (
                          //     <div
                          //       className="student-speaking-indicator"
                          //       style={{
                          //         marginBottom: mobileChat && 0,
                          //         // marginRight:mobileChat && 0,

                          //         bottom: mobileChat && 0,
                          //       }}
                          //     >
                          //       jjjj
                          //     </div>
                          //   )
                          activeSpeaker && (
                            <div
                              className="student-speaking-indicator"
                              style={{
                                marginBottom: mobileChat && 0,
                                // marginRight:mobileChat && 0,

                                bottom: mobileChat && 0,
                              }}
                            >
                              {studentSpeaking.status ? (
                                <>
                                  {" "}
                                  <div className="pulse-indicatior">
                                    {" "}
                                    <p className="speaking-icon">
                                      {studentSpeaking.userName
                                        .charAt(0)
                                        .toUpperCase()}
                                    </p>
                                  </div>
                                  <div
                                    className="pulse-indicatior-2"
                                    style={{
                                      animationDelay: "0s",
                                    }}
                                  >
                                    <p className="speaking-icon">&nbsp;</p>
                                  </div>
                                  <div
                                    className="pulse-indicatior-2"
                                    style={{
                                      animationDelay: "1s",
                                    }}
                                  >
                                    <p className="speaking-icon">&nbsp;</p>
                                  </div>
                                  <div
                                    className="pulse-indicatior-2"
                                    style={{
                                      animationDelay: "2s",
                                    }}
                                  >
                                    <p className="speaking-icon">&nbsp;</p>
                                  </div>
                                  <div
                                    className="pulse-indicatior-2"
                                    style={{
                                      animationDelay: "3s",
                                    }}
                                  >
                                    <p className="speaking-icon">&nbsp;</p>
                                  </div>
                                  <div
                                    className="pulse-indicatior-2"
                                    style={{
                                      animationDelay: "4s",
                                    }}
                                  >
                                    <p className="speaking-icon">&nbsp;</p>
                                  </div>
                                </>
                              ) : (
                                <div className="pulse-indicatior">
                                  {" "}
                                  <p className="speaking-icon">
                                    {/* {studentSpeaking.userName.charAt(0)} */}
                                    {studentSpeaking.userName
                                      .charAt(0)
                                      .toUpperCase()}
                                  </p>
                                </div>
                              )}
                              <p>{studentSpeaking.userName} is speaking</p>

                              <i
                                className="fa fa-ellipsis-v vertical-icon hover"
                                onClick={() => {
                                  setMuteDelete(!muteDelete);
                                }}
                              ></i>
                              <i
                                className="fa fa-times close-icon hover"
                                onClick={() => {
                                  // handleStopStudentSpeaking();
                                  setStopStudentSpeakingModal(true);
                                }}
                              ></i>

                              {muteDelete && (
                                <div className="mute-delete">
                                  <p
                                    className="hover"
                                    onClick={() => {
                                      setBlockStudentModal(true);
                                    }}
                                  >
                                    Block
                                  </p>
                                  <p
                                    className="hover"
                                    onClick={() => {
                                      handleMuteStudent(studentSpeaking);
                                    }}
                                  >
                                    Mute
                                  </p>
                                </div>
                              )}

                              {/* <div>
                          <p
                            onClick={() => {
                              handleBlockStudent(
                                "class",
                                studentSpeaking.foundStudent
                              );
                            }}
                          >
                            Block User
                          </p>
                          <p
                            onClick={() => {
                              handleMuteStudent();
                            }}
                          >
                            Mute User
                          </p>
                        </div> */}
                            </div>
                          )}
                    </div>
                    {startController ? (
                      <>
                        {!mobileChat && (
                          <Card
                            className="presenter-controls-wrapper mobile-control"
                            style={{ display: startController ? "" : "none" }}
                          >
                            {" "}
                            <div className="presenter-controls">
                              <div
                                className="control-object more"
                                onClick={copyText}
                              >
                                <i className="fa fa-ellipsis-h"></i>

                                <p>More</p>
                              </div>
                              <div
                                className="control-object "
                                onClick={() => {
                                  toggleAudioVisuals("mic");
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
                                  toggleAudioVisuals("cam");
                                }}
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
                            </div>
                          </Card>
                        )}
                        {showAttendance ? (
                          <div className="chat-box desktop-control">
                            <div className="attendance-wrapper-parent ">
                              <div
                                className="attendance-wrapper"
                                // style={{
                                //   minHeight: `${Math.ceil(myArray.length / 3) * 150 + 50}px`
                                // }}
                              >
                                {attendanceList.map((item, i) => {
                                  return (
                                    <div
                                      className="single-attendee hover"
                                      onClick={() => {}}
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
                                      {i === 4 && (
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
                            </div>
                          </div>
                        ) : (
                          <div className="chat-box desktop-control">
                            <div
                              style={{
                                height: screenSharing ? "150px" : "0px",
                                position: "relative",
                              }}
                            >
                              <video
                                ref={mySecondVideoRef}
                                muted
                                className={`${
                                  !audioVisuals.video && "hide-me"
                                }`}
                                style={{
                                  height: screenSharing ? "150px" : "0px",
                                  background: "#000",
                                  borderRadius: "20px",
                                  padding: screenSharing && "5px",
                                  width: "100%",
                                }}
                              />
                              {!audioVisuals.video && (
                                <div
                                  style={{
                                    height: "150px",
                                    background: "#000",
                                    borderRadius: "20px",
                                    width: "100%",
                                    position: "absolute",
                                    top: 0,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                >
                                  <img
                                    src={presenterDetails.avatar}
                                    alt="user"
                                    style={{
                                      width: "25px",
                                      height: "auto",

                                      borderRadius: "50%",
                                      marginLeft: "5px",
                                    }}
                                  />
                                </div>
                              )}
                            </div>

                            <div className="chat-interface">
                              <div className="chat-interface-text">
                                {defaultChat.map((item, index) => {
                                  return (
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
                                            color: item.color
                                              ? item.color
                                              : "#200b72",
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
                                          className={`in-chat-message ${
                                            item.user !==
                                              presenterDetails?.username &&
                                            "watcher-message"
                                          }`}
                                        >
                                          {item.user ===
                                          presenterDetails?.username ? (
                                            <img
                                              src={presenterDetails.avatar}
                                              alt="user"
                                              style={{
                                                width: "25px",
                                                height: "auto",

                                                borderRadius: "50%",
                                                marginLeft: "5px",
                                              }}
                                            />
                                          ) : (
                                            <>
                                              {item.img ? (
                                                <img
                                                  src={item.img}
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
                                                    background: item.color,
                                                    borderRadius: "50%",

                                                    width: "25px",
                                                    height: "25px",
                                                    textAlign: "center",
                                                  }}
                                                >
                                                  {item.user
                                                    .charAt(0)
                                                    .toUpperCase()}
                                                </span>
                                              )}
                                            </>
                                          )}
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
                                      </div>
                                    </div>
                                  );
                                })}
                                <div ref={chatInterfaceRef} />
                              </div>
                              <div className="chat-interface-quiz">
                                {specialChat.map((item, index) => {
                                  return item.type === "quiz" ? (
                                    <div className="inchat-poll   inchat-quiz">
                                      <div className="top">
                                        <span>
                                          Pop Quiz{" "}
                                          <i className="fas fa-book-open poll"></i>
                                        </span>
                                        <div
                                          style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            width: "12.5%",
                                          }}
                                        >
                                          {minimizedQuiz ? (
                                            <i
                                              className="fa fa-expand"
                                              onClick={() => {
                                                setMinimizedQuiz(false);
                                              }}
                                            ></i>
                                          ) : (
                                            <i
                                              className="fa fa-minus"
                                              onClick={() => {
                                                setMinimizedQuiz(true);
                                              }}
                                            ></i>
                                          )}
                                          <i
                                            className="fa fa-times"
                                            onClick={() => {
                                              removePollQuizFromChat(index);
                                            }}
                                          ></i>
                                        </div>
                                      </div>
                                      {!minimizedQuiz && (
                                        <div className="bottom">
                                          <div className="quiz-progress">
                                            {quizSubmission ||
                                            item.submissionStatus ? (
                                              <p className="resource-question">
                                                Quiz Over
                                              </p>
                                            ) : (
                                              <p className="resource-question">
                                                Quiz in Progress
                                              </p>
                                            )}
                                            <p>...</p>
                                          </div>{" "}
                                          {quizSubmission && (
                                            <div className="quiz-submission">
                                              <p className="resource-question">
                                                ({quizResultHolder.length}
                                                )Submitted
                                              </p>
                                              <p className="resource-question">
                                                View Results
                                              </p>
                                            </div>
                                          )}{" "}
                                          {quizSubmission && (
                                            <div className="quiz-submitted">
                                              <p className="resource-question">
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
                                                          <p className="resource-question">
                                                            {index + 1}.
                                                          </p>
                                                          <p
                                                            className="resource-question"
                                                            style={{
                                                              width: "55%",
                                                              wordWrap:
                                                                "break-word",
                                                            }}
                                                          >
                                                            {item.user}
                                                          </p>
                                                          <p>{`${item.result[0]}/${item.result[1]}`}</p>
                                                        </div>
                                                      );
                                                    }
                                                  )}
                                                </div>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      )}
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
                                            <div
                                              style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                width: "12.5%",
                                              }}
                                            >
                                              {minimizedPoll ? (
                                                <i
                                                  className="fa fa-expand"
                                                  onClick={() => {
                                                    setMinimizedPoll(false);
                                                  }}
                                                ></i>
                                              ) : (
                                                <i
                                                  className="fa fa-minus"
                                                  onClick={() => {
                                                    setMinimizedPoll(true);
                                                  }}
                                                ></i>
                                              )}
                                              <i
                                                className="fa fa-times"
                                                onClick={() => {
                                                  removePollQuizFromChat(index);
                                                }}
                                              ></i>
                                            </div>
                                          </div>
                                          {!minimizedPoll && (
                                            <div className="bottom">
                                              <p className="resource-question">
                                                {item.title}
                                              </p>

                                              <div className="poll-options">
                                                {item.submissionStatus ? (
                                                  <p className="resource-question">
                                                    Poll Over !!!
                                                  </p>
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
                                                  pollResult={pollResultHolder}
                                                />
                                              </div>
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

                              <CustomTextArea
                                text={chatMessage}
                                setText={setChatMessage}
                                keyDown={handleKeyDown}
                                height={height}
                                setHeight={setHeight}
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
                              onClick={() => {}}
                            >
                              <strong> Gift</strong>
                            </p>
                          </div>

                          <p>
                            Attendies{" "}
                            <strong>
                              {"("}
                              {attendanceCount}
                              {")"}
                            </strong>
                          </p>
                        </div>
                        {mobileChat ? (
                          <div className="chat-box mobile-control mobile-chat-box">
                            <div className="chat-interface">
                              <div
                                className="more-message-parent"
                                onClick={() => {
                                  setMobileChat(!mobileChat);
                                  setUnReadCount(0);
                                }}
                              >
                                <div
                                  className="more-message-action"
                                  onClick={() => {
                                    setMobileChat(!mobileChat);
                                    setUnReadCount(0);
                                  }}
                                ></div>
                              </div>
                              <div className="chat-interface-text">
                                {defaultChat.map((item, index) => {
                                  return (
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
                                        }}
                                      >
                                        <p
                                          style={{
                                            fontWeight: 600,

                                            marginBottom: "0",
                                            color: item.color
                                              ? item.color
                                              : "#200b72",
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
                                          className={`in-chat-message ${
                                            item.user !==
                                              presenterDetails?.username &&
                                            "watcher-message"
                                          }`}
                                        >
                                          {item.user ===
                                          presenterDetails?.username ? (
                                            <img
                                              src={presenterDetails.avatar}
                                              alt="user"
                                              style={{
                                                width: "25px",
                                                height: "auto",

                                                borderRadius: "50%",
                                                marginLeft: "5px",
                                              }}
                                            />
                                          ) : (
                                            <>
                                              {item.img ? (
                                                <img
                                                  src={item.img}
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
                                                    background: item.color,
                                                    borderRadius: "50%",

                                                    width: "25px",
                                                    height: "25px",
                                                    textAlign: "center",
                                                  }}
                                                >
                                                  {item.user
                                                    .charAt(0)
                                                    .toUpperCase()}
                                                </span>
                                              )}
                                            </>
                                          )}
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
                                      </div>
                                    </div>
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
                                            <p className="resource-question">
                                              Quiz Over
                                            </p>
                                          ) : (
                                            <p className="resource-question">
                                              Quiz in Progress
                                            </p>
                                          )}

                                          <p>Countdown</p>
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
                                                marginBottom: "5px",
                                              }}
                                              className="resource-question"
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
                                                pollResult={pollResultHolder}
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
                              <CustomTextArea
                                text={chatMessage}
                                setText={setChatMessage}
                                keyDown={handleKeyDown}
                                height={height}
                                setHeight={setHeight}
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
                            // onClick={(e) => {
                            //   setMobileChat(true);
                            //   handleMouseDown(e);
                            // }}
                            // onMouseDown={handleMouseDown}
                          >
                            <div
                              className="message-bubble"
                              // className="draggable-div"
                              // style={{ transform: `translateY(${offsetY}px)` }}
                              onClick={() => {
                                setMobileChat(!mobileChat);
                              }}
                            >
                              <i class="fa fa-envelope" aria-hidden="true"></i>
                              <h4>New Message</h4>
                              <p>{unReadCount}</p>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="chat-box no-start">
                        <p>
                          Your Classroom is ready, press Start to begin your
                          class
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
                        toggleAudioVisuals("mic");
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
                        toggleAudioVisuals("cam");
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
                          handleOpenResourceModalController("poll");
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
                          // setPollStatus(true);

                          handleOpenResourceModalController("quiz");
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
