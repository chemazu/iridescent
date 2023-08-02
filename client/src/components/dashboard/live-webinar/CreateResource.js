import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Col,
  Container,
  Row,
  Button,
  Card,
  Modal,
  ModalHeader,
  ModalFooter,
} from "reactstrap";
import DashboardNavbar from "../DashboardNavbar";
import "../../../custom-styles/dashboard/choose-live-webinar.css";
import pollSvg from "../../../images/poll-svg.svg";
import quizSvg from "../../../images/quiz-svg.svg";
import { useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { startLoading, stopLoading } from "../../../actions/appLoading";
import setAuthToken from "../../../utilities/setAuthToken";
import { useAlert } from "react-alert";
import axios from "axios";
import { Link } from "react-router-dom/cjs/react-router-dom.min";

export default function CreateResource() {
  const { type } = useParams();
  const dispatch = useDispatch();
  const [page, setPage] = useState(1);
  const [resourceType, setResourceType] = useState("");
  const [answers, setAnswers] = useState([]);
  const [viewDuration, setViewDuration] = useState(false);
  const [editStat, setEditStat] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);

  const [resourceId, setResourceId] = useState("");
  const alert = useAlert();
  const [quizStatus, setQuizStatus] = useState(false);
  const [pollOptions, setPollOptions] = useState(["", "", "", ""]);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [totalQuestion, setTotalQuestion] = useState(0);
  const [quizConfirmation, setQuizConfirmation] = useState(false);
  const [pollConfirmation, setPollConfirmation] = useState(false);
  const [durationValue, setDurationValue] = useState(""); // State to track the input value
  const [durationUnit, setDurationUnit] = useState("secs"); //
  const [quizHolder, setQuizHolder] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pollStatus, setPollStatus] = useState(false);
  const [pollTitle, setPollTitle] = useState("");
  const [pollDuration, setPollDuration] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  const observer = useRef();

  const lastBookElementRef = useCallback(
    (node) => {
      // if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((page) => {
            return page + 1;
          });
        }
      });
      if (node) observer.current.observe(node);
    },
    // eslint-disable-next-line
    [loading]
  );
  const handlePollOptionChange = (index, event) => {
    if (questionNumber > totalQuestion) {
      const newOptions = [...pollOptions];
      newOptions[index] = event.target.value;
      setPollOptions(newOptions);
    } else {
      alert.show("Can not Edit");
    }
  };
  const handleQuizSubmit = (event) => {
    event.preventDefault();
    handleQuizCreate();
    setQuizConfirmation(false);
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
  const handleQuizTitleChange = (event) => {
    if (questionNumber > totalQuestion) {
      setPollTitle(event.target.value);
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
  const handlePreviousQuestion = () => {
    if (questionNumber - 1 > 0) {
      setQuestionNumber(questionNumber - 1);
      setPollTitle(quizHolder[questionNumber - 2].question);
      setPollOptions(quizHolder[questionNumber - 2].options);
    } else {
      alert.show("No previous question");
    }
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
  const questionArray = Array.from(
    { length: totalQuestion },
    (_, index) => index
  );
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
  const handleCreatePoll = async () => {
    let durationInSec = convertToSeconds(durationValue, durationUnit);
    let timeStamp = Date.now();

    const body = {
      type: "poll",
      title: pollTitle,
      options: pollOptions,
      durationInSec,
      timeStamp,
    };

    if (localStorage.getItem("token")) {
      setAuthToken(localStorage.getItem("token"));
    }
    dispatch(startLoading());
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
          console.log(res);
          dispatch(stopLoading());
          alert.show("Poll Edited");
          setPollTitle("");
          setPollOptions(["", "", "", ""]);
          setDurationValue("");
          setDurationUnit("secs");
        })
        .catch((error) => {
          console.error(error);
        });
    } else {
      await axios
        .post("/api/v1/classroomresource/poll", JSON.stringify(body), config)
        .then((res) => {
          console.log(res);
          dispatch(stopLoading());
          setPollTitle("");
          setPollOptions(["", "", "", ""]);
          setDurationValue("");
          setDurationUnit("secs");
        })
        .catch((error) => {
          console.error(error);
        });
    }
  };
  const handleQuizCreate = async () => {
    if (pollOptions.every((option) => option !== "") && pollTitle !== "") {
      // handle special chat
      let durationInSec = convertToSeconds(durationValue, durationUnit);

      let newQuizHolder = [
        ...quizHolder,
        { question: pollTitle, options: pollOptions },
      ];
      let timeStamp = Date.now();
      let body = {
        quizHolder: newQuizHolder,
        timeStamp,
        type: "quiz",
        answers,
        durationInSec,
      };

      if (localStorage.getItem("token")) {
        setAuthToken(localStorage.getItem("token"));
      }

      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };
      dispatch(startLoading());

      if (editStat) {
        await axios
          .put(
            `/api/v1/classroomresource/${resourceId}`,
            JSON.stringify(body),
            config
          )
          .then((res) => {
            console.log(res);
            dispatch(stopLoading());
            alert.show("Quiz Edited");
            setAnswers([]);
            setQuizHolder([]);
            setPollTitle("");
            setPollOptions(["", "", "", ""]);
            setDurationValue("");
            setDurationUnit("secs");
            setTotalQuestion(0);
            setQuestionNumber(1);
          })
          .catch((error) => {
            console.error(error);
          });
      } else {
        await axios
          .post("/api/v1/classroomresource/quiz", JSON.stringify(body), config)
          .then((res) => {
            console.log(res);
            dispatch(stopLoading());
            setAnswers([]);
            setQuizHolder([]);
            setPollTitle("");
            setPollOptions(["", "", "", ""]);
            setDurationValue("");
            setDurationUnit("secs");
            setTotalQuestion(0);
            setQuestionNumber(1);
          })
          .catch((error) => {
            console.error(error);
          });
      }
    } else {
      console.log("dsd2");

      setAnswers([]);

      setQuizHolder([]);
      setPollTitle("");
      setPollOptions(["", "", "", ""]);
      setDurationValue("");
      setDurationUnit("secs");
      setTotalQuestion(0);
      setQuestionNumber(1);
    }
  };
  const typeText = type === "quiz" ? "Quiz" : type === "poll" ? "Poll" : "";
  const handlePollSubmit = (event) => {
    event.preventDefault();
    handleCreatePoll();
    setPollConfirmation(false);
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
  const handlePollEdit = async (id) => {
    dispatch(startLoading());
    setEditStat(true);
    setResourceId(id);

    try {
      const response = await axios.get(`/api/v1/classroomresource/${id}`);
      console.log(response.data);
      const { title, options, durationInSec } = response?.data;
      setPollTitle(title);
      setPollOptions(options);
      setDurationValue(durationInSec);
      // handle duration unit
      setPollStatus(true);
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
      console.log(response.data);
      const {
        durationInSec,
        quizHolder: quizHolderData,
        answers: answersData,
      } = response?.data;

      console.log(durationInSec, quizHolderData);
      // handle duration unit
      setDurationValue(durationInSec);
      setQuizHolder(quizHolderData);
      setAnswers(answersData);
      setPollTitle(quizHolderData[quizHolderData.length - 1].question);
      setPollOptions(quizHolderData[quizHolderData.length - 1].options);
      setTotalQuestion(quizHolderData.length);
      setQuestionNumber(quizHolderData.length);

      // setDurationValue(durationInSec);
      // setPollTitle(quizHolder[questionNumber].question);
      // setPollOptions(quizHolder[questionNumber].options);

      setQuizStatus(true);
      dispatch(stopLoading());

      //
    } catch (error) {
      // dispatch(stopLoading());
    }
  };
  const handleDeleteModal = (id) => {
    setDeleteModal(true);
    setResourceId(id);
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
  useEffect(() => {
    const fetchResources = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `/api/v1/classroomresource/creator-resources/${type}?page=${page}`
        );
        console.log(response);
        setResources(response.data.resources);
        setLoading(false);
        // console.log(response.data.resources.totalPages > response.data.resources.currentPage);

        // setHasMore(response.data.resources.length > 0);
        // setHasMore(response.data.resources.totalPages > response.data.resources.currentPage);
      } catch (error) {
        console.error("Error fetching resources:", error);
        setLoading(false);
      }
    };

    fetchResources();
  });
  const filteredResource = resources?.filter((item) => item.type === type);

  return (
    <div className="dashboard-layout">
      <Container fluid>
        <Row>
          <DashboardNavbar />
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
            <p className="confirm-heading">Set the duration of the Poll</p>

            <div className="confirm-heading time-selector">
              <input
                style={{ width: "50%", marginRight: "1.5rem" }}
                type="number"
                value={durationValue}
                onChange={(event) => {
                  setDurationValue(event.target.value);
                }}
              />
              <select
                value={durationUnit}
                onChange={(event) => {
                  setDurationUnit(event.target.value);
                }}
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
                    onChange={(event) => {
                      setPollTitle(event.target.value);
                    }}
                  />
                </div>
                {pollOptions?.map((option, index) => (
                  <div className="poll-option" key={index}>
                    <p>{String.fromCharCode(65 + index)}</p>
                    <input
                      className="poll-input"
                      placeholder={`Option ${String.fromCharCode(65 + index)}`}
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
                    {editStat ? "Edit" : "Create"}
                  </Button>
                </div>
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
                      placeholder={`Option ${String.fromCharCode(65 + index)}`}
                      value={option}
                      onChange={(event) => handleQuizOptionChange(index, event)}
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
            <p className="confirm-heading">Set the duration of the quiz</p>

            <div className="confirm-heading time-selector">
              <input
                style={{ width: "50%", marginRight: "1.5rem" }}
                type="number"
                value={durationValue}
                onChange={(event) => {
                  setDurationValue(event.target.value);
                }}
              />
              <select
                value={durationUnit}
                onChange={(event) => {
                  setDurationUnit(event.target.value);
                }}
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
          <Col className="page-actions__col">
            <div className="live-webinar">
              <div className="live-webinar-content">
                <div className="page-title">
                  <div
                    className="page-title__text"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      color: "#000",
                    }}
                  >
                    {" "}
                    <Link
                      to="/dashboard/livewebinar"
                      style={{
                        color: "#000",
                      }}
                    >
                      <i
                        class="fas fa-less-than"
                        style={{ fontSize: "16px", paddingRight: "5px" }}
                      ></i>
                      Tuturly Classroom
                    </Link>
                  </div>
                  <div className="page-title_cta"></div>
                </div>

                {["quiz", "poll"].includes(type) && (
                  <Card className="instant-webinar-options">
                    {type === "quiz" && (
                      <p className="page-title__text">Your Quizzes</p>
                    )}
                    {type === "poll" && (
                      <p className="page-title__text">Your Polls</p>
                    )}
                    <div className="resource-content">
                      {filteredResource.map((item, index) => {
                        const { type, timeStamp, quizHolder, title, _id } =
                          item;
                        return (
                          <div
                            className="single-resource-card"
                            key={index}
                            ref={lastBookElementRef}
                          >
                            <div className="resource-top">
                              <p className="page-title__text">
                                {typeText} 0{index + 1}
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
                      {type.toLowerCase() === "quiz" && (
                        <div
                          className="single-resource-card empty"
                          onClick={() => {
                            setQuizStatus(true);
                          }}
                        >
                          <p>Click here to create new {typeText}</p>
                        </div>
                      )}
                      {type.toLowerCase() === "poll" && (
                        <div
                          className="single-resource-card empty"
                          onClick={() => {
                            setPollStatus(true);
                          }}
                        >
                          <p>Click here to create new {typeText}</p>
                        </div>
                      )}
                    </div>
                  </Card>
                )}
                {type === "add" && (
                  <Card className="webinar-type-options">
                    <p className="page-title__text">
                      When do you want to start your class?
                    </p>
                    <div
                      className="interactive-buttons"
                      style={{ width: "100%" }}
                    >
                      <div
                        className={resourceType === "quiz" ? "selected" : ""}
                        onClick={() => {
                          setResourceType("quiz");
                        }}
                      >
                        <img src={quizSvg} alt="scheduled-webinar" />
                        <p>Quiz</p>
                      </div>
                      <div
                        className={resourceType === "poll" ? "selected" : ""}
                        onClick={() => {
                          setResourceType("poll");
                        }}
                      >
                        <img src={pollSvg} alt="instant-webinar" />
                        <p>Poll</p>
                      </div>
                    </div>
                    <div className="button-wrapper">
                      {resourceType === "quiz" && (
                        <Button
                          className="page-title_cta-btn"
                          onClick={() => setQuizStatus(true)}
                        >
                          Continue
                        </Button>
                      )}
                      {resourceType === "poll" && (
                        <Button
                          className="page-title_cta-btn"
                          onClick={() => setPollStatus(true)}
                        >
                          Continue
                        </Button>
                      )}
                      {resourceType === "" && (
                        <Button disabled>Continue</Button>
                      )}
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
