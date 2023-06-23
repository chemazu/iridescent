import React, { useEffect, useRef, useState } from "react";
import Peer from "peerjs";
import axios from "axios";
import socket from "../../../utilities/client-socket-connect";
import { Col, Container, Row, Button, Card, Modal } from "reactstrap";
import "../../../custom-styles/dashboard/live-webinar.css";
import smiley from "../../../images/emojisvg.svg";
import { useAlert } from "react-alert";
import DashboardNavbar from "../DashboardNavbar";
import { useParams } from "react-router-dom";
import Poll from "./Poll";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import CountdownTimer from "./CountDownTimer";
import setAuthToken from "../../../utilities/setAuthToken";

export default function Stream() {
  const { roomid } = useParams();
  const myVideoRef = useRef();
  const chatInterfaceRef = useRef(null);
  const alert = useAlert();
  const [title, setTitle] = useState("");
  const [quizStatus, setQuizStatus] = useState(false);
  const [timeOutHolder, setTimeOutHolder] = useState(false);

  const [quizHolder, setQuizHolder] = useState([]);
  const [quizResultHolder, setQuizResultHolder] = useState({});
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

  const [pollOptions, setPollOptions] = useState(["", "", "", ""]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attendies, setAttendies] = useState(0);
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
  const [pollResultHolder, setPollResultHolder] = useState({});
  const [answers, setAnswers] = useState([]);
  const [waiting, setWaiting] = useState(47);

  const [durationValue, setDurationValue] = useState(""); // State to track the input value
  const [durationUnit, setDurationUnit] = useState("secs"); // State to track the selected unit
  const [viewDuration, setViewDuration] = useState(false);
  const [pollDuration, setPollDuration] = useState(false);
  const [totalQuestion, setTotalQuestion] = useState(0);
  const [screenSharing, setScreenSharing] = useState(false);
  const [peerHolder, setPeerHolder] = useState(null);
  const [screenStream, setScreenStream] = useState(null);

  //

  const handleDurationValueChange = (event) => {
    setDurationValue(event.target.value);
  };

  const handleDurationUnitChange = (event) => {
    setDurationUnit(event.target.value);
  };
  const handlePlanTimeOut = () => {
    handleExitStream();
    setTimeOutHolder(true);
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
      .getUserMedia({audio:true,video:true})
      .then((stream) => {
        addVideoStream(myVideoRef.current, stream);

        const connections = peerHolder._connections;
        connections.forEach((value, key) => {
          const call = peerHolder.call(key, stream);
          call.on("stream", (userVideoStream) => {});
        });
      })
      .catch((error) => console.error(error));
  };

  const handleExitStream = () => {
    console.log("handleExitStream");
    socket.emit("endstream", roomid);

    // myVideoRef.current.srcObject = stream;
    let tracks = myVideoRef.current.srcObject.getTracks();
    tracks.forEach((track) => track.stop());
    myVideoRef.current.srcObject = null;
    peerHolder.destroy();
  };

  const validateWebinar = async () => {
    if (localStorage.getItem("tutorToken")) {
      console.log(localStorage.getItem("tutorToken"));
      setAuthToken(localStorage.getItem("tutorToken"));
    }
    setIsLoading(true);
    try {
      let res = await axios.get(`/api/v1/livewebinar/stream/${roomid}`);
      if (res) {
        setPresenterDetails({
          name: `${res.data.firstname} ${res.data.lastname} `,
          username: res.data.username,
        });
        setPlanname(res.data.planname);
        if (res.data.planname === "free") {
          socket.emit("freeTimer", roomid);
        }

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
    setSpecialChat([
      ...specialChat,
      {
        user: 1,
        type: "poll",
        title: pollTitle,
        options: pollOptions,
        durationInSec,
      },
    ]);
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
      questionControl: newIndex,
      roomid,
    };
    socket.emit("startTimer", timerData);
    setPollTitle("");
    setPollOptions(["", "", "", ""]);
  };
  const handleQuizCreate = () => {
    if (pollOptions.every((option) => option !== "") && pollTitle !== "") {
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

      const newIndex = defaultChat.length;

      let newAnswerHolder = { ...answerHolder, [newIndex]: answers };

      setAnswerHolder(newAnswerHolder);
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
        questionControl: newIndex,
        roomid,
      };
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
      const newIndex = defaultChat.length;

      let newAnswerHolder = { ...answerHolder, [newIndex]: answers };

      setAnswerHolder(newAnswerHolder);
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
  const sendMessage = () => {
    if (chatMessage !== null) {
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
    const updatedChat = defaultChat.filter((item, i) => i !== index);
    setDefaultChat(updatedChat);
    const updatedStatusHolder = { ...quizResultHolder };

    delete updatedStatusHolder.index;

    setQuizResultHolder(updatedStatusHolder);

    socket.emit("special close", roomid, index);

    // confirm the index again in
  };

  const onConnect = () => {
    navigator.mediaDevices
      .getUserMedia({audio:true,video:true})
      .then((stream) => {
        addVideoStream(myVideoRef.current, stream);
      })
      .catch((error) => console.error(error));
  };

  const handleQuizTimeOut = () => {
    console.log("completed,timed,out");
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

  const handleStudentPollSubmit = (newResult, questionControl) => {
    let newResultArray = [];
    if (pollResultHolder.hasOwnProperty(questionControl)) {
      newResultArray = [...pollResultHolder[questionControl], ...newResult];
    } else {
      newResultArray = [...newResult];
    }

    let newResultHolder = {
      ...pollResultHolder,
      [questionControl]: newResultArray,
    };

    setPollResultHolder(newResultHolder);
    socket.emit("updatedPollResult", roomid, newResultArray, questionControl);
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
    socket.on("timer elapsed for room", (roomTimer) => {
      console.log("timer elapsed for room");
      setTimeLeft(roomTimer);
    });

    return () => {
      socket.off("timer elapsed for room");
    };
  }, [roomid, timeLeft]);
  useEffect(() => {
    socket.on("roomTimerTick", (roomTimer) => {
      setTimeLeft(roomTimer);
    });

    return () => {
      socket.off("roomTimerTick");
    };
  }, [roomid, timeLeft]);

  useEffect(() => {
    socket.on("special submit", (type, result, user, questionControl) => {
      if (type === "poll") {
        handleStudentPollSubmit(result, questionControl);
      }

      if (type === "quiz") {
        if (answerHolder[questionControl]) {
          let a = analyseStudentResult(answerHolder[questionControl], result);
          let newResult = [];

          const existingResult = quizResultHolder[questionControl]?.find(
            (result) => result.user === user
          );

          if (existingResult) {
            console.log("User has already submitted");
          } else {
            if (quizResultHolder[questionControl]) {
              newResult = [
                ...quizResultHolder[questionControl],
                {
                  user: user,
                  result: a,
                },
              ];
            } else {
              newResult = [
                {
                  user: user,
                  result: a,
                },
              ];
            }

            let newQuizHolder = {
              ...quizResultHolder,
              [questionControl]: newResult,
            };

            setQuizResultHolder(newQuizHolder);
            let newSubmission = { ...quizSubmission, [questionControl]: true };
            setQuizSubmission(newSubmission);
          }
        } else {
          // Handle the case when answerHolder[questionControl] is not defined
        }
      }
    });
    return () => {
      socket.off("special submit");
    };
  }, [pollResultHolder, answerHolder, roomid]);

  useEffect(() => {
    socket.on("timerStarted", (questionControl, duration) => {
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
    };
  }, [roomid, timerHolder]);

  useEffect(() => {
    socket.on("timerTick", (questionControl, remainingTime) => {
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
      socket.off("timerTick");
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

  // useEffect(() => {
  //   const initializePeer = async () => {
  //     const peerInstance = new Peer();
  //     setPeerHolder(peerInstance);

  //     peerInstance.on("open", (peerId) => {
  //       socket.emit("broadcaster", roomid, peerId);
  //     });
  //     peerInstance.on("call", (call) => {
  //       // check if livestream
  //       if (screenSharing && screenStream) {
  //         call.answer(screenStream);
  //       } else {
  //         navigator.mediaDevices.getUserMedia({audio:true,video:true}).then((stream) => {
  //           call.answer(stream);
  //         });
  //       }
  //     });
  //   };

  //   initializePeer();

  //   return () => {
  //     peerHolder?.destroy();
  //   };
  // }, [roomid, screenStream]);

  // trigger intialize Peeer
  const handleInitializePeer = async () => {
    const peerInstance = new Peer();
    setPeerHolder(peerInstance);

    peerInstance.on("open", (peerId) => {
      socket.emit("broadcaster", roomid, peerId);
    });
    peerInstance.on("call", (call) => {
      // check if livestream
      if (screenSharing && screenStream) {
        call.answer(screenStream);
      } else {
        navigator.mediaDevices.getUserMedia({audio:true,video:true}).then((stream) => {
          call.answer(stream);
        });
      }
    });
  };

  const toggleScreenSharing = () => {
    if (screenSharing) {
      setScreenSharing(false);
      handleScreenSharingEnded();
    } else {
      setScreenSharing(true);

      navigator.mediaDevices
        .getDisplayMedia({ video: true, audio: true })
        .then((stream) => {
          setScreenStream(stream);
          const screenSharingTrack = stream.getVideoTracks()[0];
          screenSharingTrack.addEventListener(
            "ended",
            handleScreenSharingEnded
          );
          if (myVideoRef.current) {
            myVideoRef.current.srcObject = stream;
          }

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
                <Modal isOpen={timerHolder}>
                  <div>
                    <h2>Webinar TimedOut</h2>
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
                        X
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
                            setPollStatus(false);
                            setPollDuration(true);
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
                      <h4 onClick={handleCancelQuizCreation}>X</h4>
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
                        className="cancel-button"
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
                <Modal isOpen={viewDuration} className="confirm-poll-modal">
                  <div className="top">
                    <h4
                      onClick={() => {
                        setQuizStatus(true);
                        setViewDuration(false);
                      }}
                    >
                      X
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
                      }}
                    >
                      X
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
                      {planname ? (
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
                        <p>00:00:00</p>
                      )}
                    </div>

                    <Button
                      className="page-title_cta-btn"
                      onClick={handleExitStream}
                    >
                      End Webinar &nbsp; <i className="fa fa-times"></i>
                    </Button>
                  </div>
                  <div className="page-title__text">
                    {isLoading ? "..." : title}
                    {/* <br />
                    <span>Chukwuemeka Chemazu</span> */}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      paddingBottom: "1rem",
                    }}
                  >
                    <span>{isLoading ? "..." : presenterDetails?.name}</span>
                    <span style={{ width: "30%" }}>
                      Attendees{" "}
                      <strong>
                        {"("}
                        {attendies}
                        {")"}
                      </strong>
                    </span>
                  </div>

                  <div className="live-webinar-interface">
                    <div className="video-background">
                      <video
                        ref={myVideoRef}
                        muted
                        // style={{ width: "300px", height: "200px" }}
                      />
                      <button
                        onClick={() => {
                          onConnect();
                          handleInitializePeer();
                        }}
                      >
                        Start Stream
                      </button>
                    </div>
                    <div className="chat-box">
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
                                        item.user === presenterDetails?.username
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
                                      removePollQuizFromChat(index);
                                    }}
                                  ></i>
                                </div>
                                <div className="bottom">
                                  <div className="quiz-progress">
                                    {quizSubmission[index] ? (
                                      <p>Quiz Over</p>
                                    ) : (
                                      <p>Quiz in Progress</p>
                                    )}

                                    <CountdownTimer
                                      // duration={convertToSeconds(
                                      //   item.duration?.durationValue,
                                      //   item.duration?.durationUnit
                                      // )}
                                      duration={Number(
                                        timerHolder[index]?.remainingTime
                                      )}
                                      onCompletion={handleQuizTimeOut}
                                      style={{
                                        color: "rgb(82, 95, 127)",
                                        fontSize: "1rem",
                                        fontWeight: "300",
                                        lineHeight: "1.7",
                                      }}
                                    />
                                  </div>{" "}
                                  {quizSubmission[index] && (
                                    <div className="quiz-submission">
                                      <p>
                                        ({quizResultHolder[index]?.length}
                                        )Submitted
                                      </p>
                                      <p>View Results</p>
                                    </div>
                                  )}{" "}
                                  {quizSubmission[index] && (
                                    <div className="quiz-submitted">
                                      <p>
                                        ({quizResultHolder[index]?.length}
                                        )Submitted
                                      </p>
                                      <div className="quiz-result-wrapper">
                                        <div className="quiz-result">
                                          {quizResultHolder[index]?.map(
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
                                                      wordWrap: "break-word",
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
                                        <i className="fas fa-poll poll"></i>
                                      </span>
                                      <i
                                        className="fa fa-times"
                                        onClick={() => {
                                          removePollQuizFromChat(index);
                                        }}
                                      ></i>
                                    </div>
                                    <div className="bottom">
                                      <p>{item.title}</p>

                                      <div className="poll-options">
                                        <Poll
                                          pollOptions={item.options}
                                          pollResult={
                                            pollResultHolder[index + 1]
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
                          audio: !audioVisuals.audio,
                          video: audioVisuals.video,
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
                        setAudioVisuals({
                          video: !audioVisuals.video,
                          audio: audioVisuals.audio,
                        });
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
