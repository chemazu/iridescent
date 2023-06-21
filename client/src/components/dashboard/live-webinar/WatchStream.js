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
  const [presenterName, setPresenterName] = useState("");
  const [submitted, setSubmitted] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [chatMessage, setChatMessage] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [answers, setAnswers] = useState([]);
  const [timerHolder, setTimerHolder] = useState({});
  const [pollAnswerHolder, setPollAnswerHolder] = useState({});
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
  const [waiting, setWaiting] = useState(false);
  const [disconnect, setDisconnect] = useState(false);
  const [screenSharing, setScreenSharing] = useState(false);
  const [webinarRoomTimer, setWebinarRoomTimer] = useState(null);

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
  function beep() {
    var snd = new Audio(
      "data:audio/wav;base64,//uQRAAAAWMSLwUIYAAsYkXgoQwAEaYLWfkWgAI0wWs/ItAAAGDgYtAgAyN+QWaAAihwMWm4G8QQRDiMcCBcH3Cc+CDv/7xA4Tvh9Rz/y8QADBwMWgQAZG/ILNAARQ4GLTcDeIIIhxGOBAuD7hOfBB3/94gcJ3w+o5/5eIAIAAAVwWgQAVQ2ORaIQwEMAJiDg95G4nQL7mQVWI6GwRcfsZAcsKkJvxgxEjzFUgfHoSQ9Qq7KNwqHwuB13MA4a1q/DmBrHgPcmjiGoh//EwC5nGPEmS4RcfkVKOhJf+WOgoxJclFz3kgn//dBA+ya1GhurNn8zb//9NNutNuhz31f////9vt///z+IdAEAAAK4LQIAKobHItEIYCGAExBwe8jcToF9zIKrEdDYIuP2MgOWFSE34wYiR5iqQPj0JIeoVdlG4VD4XA67mAcNa1fhzA1jwHuTRxDUQ//iYBczjHiTJcIuPyKlHQkv/LHQUYkuSi57yQT//uggfZNajQ3Vmz+Zt//+mm3Wm3Q576v////+32///5/EOgAAADVghQAAAAA//uQZAUAB1WI0PZugAAAAAoQwAAAEk3nRd2qAAAAACiDgAAAAAAABCqEEQRLCgwpBGMlJkIz8jKhGvj4k6jzRnqasNKIeoh5gI7BJaC1A1AoNBjJgbyApVS4IDlZgDU5WUAxEKDNmmALHzZp0Fkz1FMTmGFl1FMEyodIavcCAUHDWrKAIA4aa2oCgILEBupZgHvAhEBcZ6joQBxS76AgccrFlczBvKLC0QI2cBoCFvfTDAo7eoOQInqDPBtvrDEZBNYN5xwNwxQRfw8ZQ5wQVLvO8OYU+mHvFLlDh05Mdg7BT6YrRPpCBznMB2r//xKJjyyOh+cImr2/4doscwD6neZjuZR4AgAABYAAAABy1xcdQtxYBYYZdifkUDgzzXaXn98Z0oi9ILU5mBjFANmRwlVJ3/6jYDAmxaiDG3/6xjQQCCKkRb/6kg/wW+kSJ5//rLobkLSiKmqP/0ikJuDaSaSf/6JiLYLEYnW/+kXg1WRVJL/9EmQ1YZIsv/6Qzwy5qk7/+tEU0nkls3/zIUMPKNX/6yZLf+kFgAfgGyLFAUwY//uQZAUABcd5UiNPVXAAAApAAAAAE0VZQKw9ISAAACgAAAAAVQIygIElVrFkBS+Jhi+EAuu+lKAkYUEIsmEAEoMeDmCETMvfSHTGkF5RWH7kz/ESHWPAq/kcCRhqBtMdokPdM7vil7RG98A2sc7zO6ZvTdM7pmOUAZTnJW+NXxqmd41dqJ6mLTXxrPpnV8avaIf5SvL7pndPvPpndJR9Kuu8fePvuiuhorgWjp7Mf/PRjxcFCPDkW31srioCExivv9lcwKEaHsf/7ow2Fl1T/9RkXgEhYElAoCLFtMArxwivDJJ+bR1HTKJdlEoTELCIqgEwVGSQ+hIm0NbK8WXcTEI0UPoa2NbG4y2K00JEWbZavJXkYaqo9CRHS55FcZTjKEk3NKoCYUnSQ0rWxrZbFKbKIhOKPZe1cJKzZSaQrIyULHDZmV5K4xySsDRKWOruanGtjLJXFEmwaIbDLX0hIPBUQPVFVkQkDoUNfSoDgQGKPekoxeGzA4DUvnn4bxzcZrtJyipKfPNy5w+9lnXwgqsiyHNeSVpemw4bWb9psYeq//uQZBoABQt4yMVxYAIAAAkQoAAAHvYpL5m6AAgAACXDAAAAD59jblTirQe9upFsmZbpMudy7Lz1X1DYsxOOSWpfPqNX2WqktK0DMvuGwlbNj44TleLPQ+Gsfb+GOWOKJoIrWb3cIMeeON6lz2umTqMXV8Mj30yWPpjoSa9ujK8SyeJP5y5mOW1D6hvLepeveEAEDo0mgCRClOEgANv3B9a6fikgUSu/DmAMATrGx7nng5p5iimPNZsfQLYB2sDLIkzRKZOHGAaUyDcpFBSLG9MCQALgAIgQs2YunOszLSAyQYPVC2YdGGeHD2dTdJk1pAHGAWDjnkcLKFymS3RQZTInzySoBwMG0QueC3gMsCEYxUqlrcxK6k1LQQcsmyYeQPdC2YfuGPASCBkcVMQQqpVJshui1tkXQJQV0OXGAZMXSOEEBRirXbVRQW7ugq7IM7rPWSZyDlM3IuNEkxzCOJ0ny2ThNkyRai1b6ev//3dzNGzNb//4uAvHT5sURcZCFcuKLhOFs8mLAAEAt4UWAAIABAAAAAB4qbHo0tIjVkUU//uQZAwABfSFz3ZqQAAAAAngwAAAE1HjMp2qAAAAACZDgAAAD5UkTE1UgZEUExqYynN1qZvqIOREEFmBcJQkwdxiFtw0qEOkGYfRDifBui9MQg4QAHAqWtAWHoCxu1Yf4VfWLPIM2mHDFsbQEVGwyqQoQcwnfHeIkNt9YnkiaS1oizycqJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU="
    );
    snd.play();
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
  //

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
  };
  const handlePollOptionClick = (index, questionControl) => {
    let newAnswerHolder = {
      ...pollAnswerHolder,
      [questionControl]: String.fromCharCode(65 + index),
    };
    setPollAnswerHolder(newAnswerHolder);
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

  useEffect(() => {
    socket.on("message", (message) => {
      console.log(message);

      setDefaultChat([...defaultChat, { ...message, submitted: false }]);
    });
    return () => {
      socket.off("message");
    };
  }, [defaultChat, roomid]);

  useEffect(() => {
    socket.on("no stream", () => {
      console.log("no stream");
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
    };
  }, [roomid, pollResults]);

  useEffect(() => {
    socket.on("broadcaster", () => {
      setDisconnect(false);
      setWaiting(false);
      const NewPeer = new Peer();
      NewPeer.on("open", (user) => {
        console.log("peer created");
        socket.emit("watcher", roomid, user);
      });
      NewPeer.on("call", (call) => {
        // stop reconnecting loading
        setReconnectLoading(true);

        console.log("call incoming");
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
          console.log(call);
          call.answer(newDummyStream);
          call.on("stream", (remoteStream) => {
            console.log("Received screen sharing stream");

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
  }, [roomid, screenSharing]);

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
    };
  }, [roomid]);

  useEffect(() => {
    socket.on("currentStatus", (roomSize, roomTimer, pollQuizHolder) => {
      setAttendees(roomSize);
      console.log(roomSize, roomTimer);
      if (pollQuizHolder) {
        setDefaultChat([...defaultChat, ...pollQuizHolder]);
      }

      if (roomTimer) {
        setWebinarRoomTimer(roomTimer);
      }
    });
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
    socket.on("timerTick", (questionControl, remainingTime) => {
      console.log("first");
      console.log(timerHolder);
      if (timerHolder[questionControl]) {
        if (remainingTime === 0) {
          handlePollSubmit(questionControl);
        }
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
    socket.on("user-disconnected", (userId, roomSize) => {
      setAttendees(roomSize);
    });
    return () => {
      socket.off("user-disconnected");
    };
  });

  useEffect(() => {
    socket.on("broadcaster-disconnected", () => {
      setDisconnect(true);
    });
    return () => {
      socket.off("broadcaster-disconnected");
    };
  }, [roomid]);
  useEffect(() => {
    socket.on("special close", (index) => {
      const updatedChat = defaultChat.filter((item, i) => i !== index);
      setDefaultChat(updatedChat);
      const updatedStatusHolder = { ...submitStatusHolder };
      delete updatedStatusHolder.index;
      setSubmitStatusHolder(updatedStatusHolder);
    });
    return () => {
      socket.off("special close");
    };
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
    };

    initializePeer();

    return () => {
      currentPeer?.destroy();
    };
  }, [roomid]);

  const startStream = () => {
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
  };
  const initiateCall = (peerId) => {
    if (currentPeer) {
      const blankStream = createBlankVideoStream();
      const call = currentPeer.call(peerId, blankStream);

      call.on("stream", (remoteStream) => {
        console.log("first");
        setWaiting(false);
        addVideoStream(remoteStream);

        // Handle the incoming stream
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
              <p>Waiting</p>
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
                          <CountdownTimer
                            duration={webinarRoomTimer}
                            onCompletion={() => {
                              console.log("first");
                            }}
                          />
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
                        <Button onClick={startStream}></Button>
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
                                // muted
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
                          <div className="control-object">
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
                    </div>

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
                                            timerHolder[
                                              singleChat.questionControl
                                            ]?.remainingTime
                                          )
                                        : 0
                                    }
                                    onCompletion={() => {
                                      handleUniqueSubmission(
                                        answers,
                                        "quiz",
                                        singleChat.questionControl
                                      );
                                    }}
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
                                              {item.options.map(
                                                (option, index) => {
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
                                                }
                                              )}
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
                                      <span>
                                        Poll{" "}
                                        <i className="fas fa-poll poll"></i>
                                      </span>
                                    </div>
                                    <div className="bottom">
                                      {pollResults[
                                        singleChat.questionControl
                                      ] ? (
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
                                      <p>Question : </p>
                                      <p>{singleChat.title}</p>
                                      <div className="poll-options">
                                        {/* add POLL RES HERES */}
                                        {pollResults[
                                          singleChat.questionControl
                                        ] &&
                                        submitted[
                                          singleChat.questionControl
                                        ] ? (
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
                                                          singleChat
                                                            .questionControl
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
