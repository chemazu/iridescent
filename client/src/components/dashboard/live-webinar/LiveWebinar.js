import React, { useEffect, useState, useRef } from "react";
import { connect } from "react-redux";
import axios from "axios";
import { Col, Container, Row, Button, Card, Spinner, Modal } from "reactstrap";
import "../../../custom-styles/dashboard/live-webinar.css";
import bellicon from "../../../images/flat-yellow-bell.png";
import pollSvg from "../../../images/poll-svg.svg";
import quizSvg from "../../../images/quiz-svg.svg";
import plusSvg from "../../../images/plus-svg.svg";

import { useAlert } from "react-alert";
import DashboardNavbar from "../DashboardNavbar";

import NotificationNavbar from "../NotificationNavbar";
import { Link } from "react-router-dom";

function LiveWebinar({ school, getSchool }) {
  const [userStreams, setUserStreams] = useState(null);
  const [filterState, setFilterState] = useState("");
  const [sortState, setSortState] = useState("");

  const [loading, setLoading] = useState(true);
  const [instantWebinar, setInstantWebinar] = useState(false);
  const [menuIndex, setMenuIndex] = useState(null);
  const dropdownRef = useRef(null);

  const [viewMore, setViewMore] = useState(false);

  const alert = useAlert();

  const handlePublishLive = async (id) => {
    let res = await axios.put(`/api/v1/livewebinar/publish/${id}`);
    if (res) {
      getWebinars();
      alert.show("Classroom updated");
    } else {
      alert.show("error in publishing");
      setLoading(false);
    }
  };
  const getWebinars = async () => {
    setLoading(true);

    // let res = await axios.get(`/api/v1/livewebinar/streams/${filterState}`);
    const res = await axios.get(
      `/api/v1/livewebinar/streams?filter=${filterState}`
    );

    if (res) {
      console.log(res);
      setUserStreams(res.data.streams);
      setLoading(false);
    } else {
      console.log("error");
      setLoading(false);
    }
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
  function copyText(textToCopy) {
    console.log(textToCopy);
    if (textToCopy.fee === 0) {
      navigator.clipboard
        .writeText(
          `${getSchoolUrl(school.name)}/livewebinar/watch/${
            textToCopy.streamKey
          }`
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
          `${getSchoolUrl(school.name)}/live/preview/${textToCopy._id}`
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

  const handleWebinarRemoval = async (id) => {
    try {
      await axios.delete(`/api/v1/livewebinar/remove/${id}`, {
        headers: {
          Authorization: "Bearer YOUR_AUTH_TOKEN", // Replace with your actual authentication token
        },
      });

      // Optional: Log the response data or handle it as needed
      getWebinars();
      alert.show("Classroom Deleted");

      // Webinar removed successfully, perform any additional logic here
    } catch (error) {
      console.error(error);
      // Handle the error, display a notification, or perform any necessary error handling
    }
  };
  const today = new Date();

  const streams = userStreams?.filter((stream) => {
    const streamDate = new Date(stream.startTime);
    return streamDate.toDateString() === today.toDateString();
  });
  const handleSort = () => {
    const sortFunction = (a, b) => {
      switch (sortState) {
        case "title":
          if (a.title !== b.title) {
            return a.title.localeCompare(b.title); // Sort by the "title" property in ascending order
          }
          break;

        case "startTime":
          return new Date(a.startTime) - new Date(b.startTime); // Sort by the "startTime" property in ascending order

        default:
          break;
      }
    };

    return sortFunction;
  };
  userStreams?.sort(handleSort());

  function handleTimeDisplay(time) {
    const timestamp = new Date(time);
    const dateStr = timestamp.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
    });
    const timeStr = timestamp.toLocaleString("en-US", {
      hour: "numeric",
      minute: "numeric",
    });

    const parts = dateStr.split(" ");
    const month = parts[0].toUpperCase();
    const day = parts[1];

    const convertedStr = `${timeStr} ${month} ${day}`;
    return convertedStr;
  }
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        menuIndex != null
      ) {
        setMenuIndex(null);
      }
      if (dropdownRef.current?.contains(event.target) & (menuIndex != null)) {
        setMenuIndex(null);
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [menuIndex]);

  useEffect(() => {
    // getSchool();

    getWebinars();
  }, [filterState]);

  return (
    <div className="dashboard-layout">
      <Container fluid>
        <Row>
          <DashboardNavbar />
          <Modal isOpen={instantWebinar}></Modal>
          <Col className="page-actions__col">
            <div className="live-webinar">
              <div className="live-webinar-content">
                {/* <NotificationNavbar /> */}

                <div className="page-title">
                  <div className="page-title__text">Tuturly Classroom</div>
                  <div className="page-title_cta">
                    <Link to="/dashboard/livewebinar/setup">
                      <Button className="page-title_cta-btn">
                        <i className="fas fa-plus mr-2"></i> Start a new class
                      </Button>
                    </Link>
                    {/* <Button
                      className="page-title_cta-btn"
                      onClick={() => {
                        setInstantWebinar(true);
                      }}
                    >
                      <i className="fas fa-plus mr-2"></i> Instant Webinar
                    </Button> */}
                  </div>
                </div>

                <Card className="webinar-container">
                  {streams?.map((item, index) => {
                    return (
                      <div className="webinar-time-prompt" key={index}>
                        <img src={bellicon} alt="bell icon" />
                        <p>
                          You have a class scheduled today{" "}
                          {handleTimeDisplay(item.startTime).split(" ")[2]}{" "}
                          {handleTimeDisplay(item.startTime).split(" ")[3]} at{" "}
                          {handleTimeDisplay(item.startTime).split(" ")[0]}.
                          {handleTimeDisplay(item.startTime).split(" ")[1]}.
                        </p>
                        <Link to={`livewebinar/stream/${item.streamKey}`}>
                          <Button
                            style={{
                              backgroundColor: "transparent",
                              border: "1px solid red",
                              color: "red",
                              borderRadius: "22px",
                            }}
                          >
                            Open
                          </Button>
                        </Link>
                      </div>
                    );
                  })}

                  <p className="page-title__text">Classroom Resources </p>
                  {/* <div className="single-resource-wrapper">
                      <div className="single-resource">
                        <div className="single-resource-img">
                          <img src={quizSvg} alt="" />
                        </div>
                        <p>Quizzes</p>

                      </div>
                    </div>
                    <div className="single-resource-wrapper">
                      <div className="single-resource">
                        <div className="single-resource-img">
                          <img src={pollSvg} alt="" />
                        </div>
                      </div>
                      <p>Polls</p>

                    </div>
                    <div className="single-resource-wrapper">
                      <div className="single-resource">
                        <div className="single-resource-img">
                          <img src={plusSvg} alt="" />
                        </div>
                        <p>Add new resource</p>
                      </div>
                    </div> */}
                  <div className="classroom-resources">
                    <Link
                      to="/dashboard/livewebinar/resource/quiz"
                      className="single-resource"
                    >
                      <div className="single-resource">
                        <div className="single-resource-img">
                          <img src={quizSvg} alt="" />
                        </div>
                        <p>Quizzes</p>
                      </div>
                    </Link>
                    <Link
                      to="/dashboard/livewebinar/resource/poll"
                      className="single-resource"
                    >
                      <div className="single-resource">
                        <div className="single-resource-img">
                          <img src={pollSvg} alt="" />
                        </div>
                        <p>Polls</p>
                      </div>
                    </Link>
                    <Link
                      to="/dashboard/livewebinar/resource/add"
                      className="single-resource"
                    >
                      <div className="single-resource">
                        <div className="single-resource-img">
                          <img src={plusSvg} alt="" />
                        </div>
                        <p>Add new resource</p>
                      </div>
                    </Link>
                  </div>
                  <div className="card-title">
                    <p className="page-title__text">Upcoming Classes </p>

                    {userStreams?.length > 3 && (
                      <span
                        onClick={() => {
                          setViewMore(!viewMore);
                        }}
                        className="view-more-hover"
                      >
                        View {viewMore ? "Less" : "More"}
                      </span>
                    )}
                  </div>
                  <div className="card-content">
                    <div className="table-sort">
                      <div className="filter-parent">
                        <p>Filter by</p>
                        <div className="select-wrapper">
                          <select
                            onChange={(e) => {
                              setFilterState(e.target.value);
                            }}
                          >
                            {/* {filterState === "" && (
                            <option value="" hidden={!filterState}>
                              Filter
                            </option>
                          )} */}
                            <option value="" hidden>
                              {" "}
                              {filterState === "" ? "Filter" : ""}
                            </option>
                            <option value="">Upcoming</option>
                            <option value="isPublished">Published</option>
                            <option value="unPublished">Unpublished</option>
                            <option value="isRecurring">Recurring</option>
                            <option value="NotRecurring">One Off</option>
                            <option value="completed">Completed</option>
                            <option value="all">All</option>

                            {/* <option value=""> {filterState === '' ? "Filter" : 'Clear Filter'}</option> */}

                            {filterState !== "" && (
                              <option value="">Clear Filter</option>
                            )}
                          </select>
                        </div>
                      </div>
                      <div
                        className="filter-parent"
                        style={{ alignItems: "flex-end" }}
                      >
                        <p>Sort by</p>
                        <div className="select-wrapper">
                          <select
                            onChange={(e) => {
                              setSortState(e.target.value);
                            }}
                          >
                            <option>Sort</option>
                            <option value="title">Title</option>
                            <option value="startTime">Start Time</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    <div className="table-heading">
                      <p className="first">Time</p> <p>Title</p>
                      <p>Status</p>
                      <p>Action</p>
                    </div>

                    {loading ? (
                      // <p>Loading animation...</p>
                      <div className="table-body-empty">
                        <Spinner />
                      </div>
                    ) : userStreams?.length < 1 ? (
                      <div className="table-body-empty">
                        <p>You have no classroom.</p>
                      </div>
                    ) : (
                      // userStreams.map((item, index) => {
                      // handleStreamFilter(filterState).map((item, index) => {
                      userStreams?.map((item, index) => {
                        console.log(item, today);
                        return (
                          <>
                            <div
                              key={index}
                              className="table-body"
                              style={{
                                display:
                                  index > 2 && !viewMore ? "none" : "grid",
                              }}
                            >
                              <p className="first">
                                {handleTimeDisplay(item.startTime)}
                              </p>
                              <p>{item.title}</p>

                              {item.classEndTime === 0 ? (
                                <div className="status">
                                  {item.isPublished ? (
                                    <p>Published</p>
                                  ) : (
                                    <p>Not Published</p>
                                  )}
                                </div>
                              ) : (
                                <div className="status">
                                  {item.endStatus ||
                                  today > item.classEndTime ? (
                                    <p>Completed</p>
                                  ) : item.isLive ? (
                                    <p className="live-button"> Live</p>
                                  ) : item.isPublished ? (
                                    <p>Published</p>
                                  ) : (
                                    <p>Not Published</p>
                                  )}
                                </div>
                              )}
                              <div className="actions">
                                {menuIndex === index ? (
                                  <div
                                    className="action-drop-down"
                                    ref={dropdownRef}
                                  >
                                    <div
                                      className="action-item"
                                      onClick={() => {
                                        copyText(item);
                                      }}
                                    >
                                      <i className="fa fa-share"></i>
                                      <p>Share Link</p>
                                    </div>

                                    <div
                                      className="action-item"
                                      onClick={() => {
                                        handlePublishLive(item._id);
                                      }}
                                    >
                                      <i
                                        className={`fa ${
                                          item.isPublished
                                            ? "fa-eye-slash"
                                            : "fa-eye"
                                        }`}
                                      ></i>
                                      <p>
                                        {item.isPublished
                                          ? "Unpublish Classroom"
                                          : "Publish Classroom"}
                                      </p>
                                    </div>

                                    <Link to={`livewebinar/edit/${item._id}`}>
                                      <div className="action-item">
                                        <i className="fa fa-edit"></i>
                                        <p>Edit Class</p>
                                      </div>
                                    </Link>

                                    {item.classEndTime === 0 ? (
                                      <Link
                                        to={`livewebinar/stream/${item.streamKey}`}
                                      >
                                        <div className="action-item">
                                          <i className="fa fa-play"></i>
                                          <p>Start Class</p>
                                        </div>
                                      </Link>
                                    ) : (
                                      <>
                                        {!(today > item.classEndTime) && (
                                          <Link
                                            to={`livewebinar/stream/${item.streamKey}`}
                                          >
                                            <div className="action-item">
                                              <i className="fa fa-play"></i>
                                              <p>Start Class</p>
                                            </div>
                                          </Link>
                                        )}
                                      </>
                                    )}

                                    <div
                                      className="action-item delete-item"
                                      onClick={() => {
                                        handleWebinarRemoval(item._id);
                                      }}
                                    >
                                      <i className="fa fa-trash"></i>
                                      <p>Delete Classroom</p>
                                    </div>
                                  </div>
                                ) : (
                                  <p
                                    onClick={() => {
                                      setMenuIndex(index);
                                    }}
                                  >
                                    ...
                                  </p>
                                )}
                              </div>
                            </div>
                            <hr
                              style={{
                                display:
                                  index > 2 && !viewMore ? "none" : "flex",

                                width: viewMore
                                  ? index === userStreams.length - 1 && "100%"
                                  : (index === 2 ||
                                      index === userStreams.length - 1) &&
                                    "100%",
                              }}
                            />
                          </>
                        );
                      })
                    )}
                    <div className="webinar-button-wrapper">
                      <Link to="/dashboard/livewebinar/setup">
                        <Button className="page-title_cta-btn">
                          <i className="fas fa-plus mr-2"></i> Start a new class
                        </Button>
                      </Link>
                      {/* <Button
                        className="page-title_cta-btn"
                        onClick={() => {
                          setInstantWebinar(true);
                        }}
                      >
                        <i className="fas fa-plus mr-2"></i> Instant Webinar
                      </Button> */}
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

const mapStateToProps = (state) => ({
  school: state.school.schoolDetails,
  loggedInUsername: state?.auth?.user?.username,
});

export default connect(mapStateToProps)(LiveWebinar);
