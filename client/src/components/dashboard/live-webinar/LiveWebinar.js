import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import axios from "axios";
import { Col, Container, Row, Button, Card, Spinner } from "reactstrap";
import "../../../custom-styles/dashboard/live-webinar.css";
import bellicon from "../../../images/flat-yellow-bell.png";

import DashboardNavbar from "../DashboardNavbar";
import NotificationNavbar from "../NotificationNavbar";
import { Link } from "react-router-dom";

function LiveWebinar() {
  //   UPDATE_DASHBOARD_PAGE_COUNTER(34);
  const [userStreams, setUserStreams] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMore, setViewMore] = useState(false);

  const getWebinars = async () => {
    setLoading(true);

    let res = await axios.get("/api/v1/livewebinar/streams");
    console.log(res);
    setUserStreams(res.data.streams);
    setLoading(false);
  };
  const today = new Date();
  const streams = userStreams?.filter((stream) => {
    const streamDate = new Date(stream.startTime);
    return streamDate.toDateString() === today.toDateString();
  });
  const filteredStreams = userStreams?.filter((stream) => {
    const streamDate = new Date(stream.startTime);
    return streamDate.toDateString() === today.toDateString();
  });

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
    getWebinars();
  }, []);

  return (
    <div className="dashboard-layout">
      <Container fluid>
        <Row>
          <DashboardNavbar />
          <Col className="page-actions__col">
            <div className="live-webinar">
              {/* <NotificationNavbar /> */}
              <div className="live-webinar-content">
                <div className="page-title">
                  <div className="page-title__text">Live Webinar</div>
                  <div className="page-title_cta">
                    <Link to="/dashboard/livewebinar/create">
                      <Button className="page-title_cta-btn">
                        <i className="fas fa-plus mr-2"></i> Schedule Webinar
                      </Button>
                    </Link>
                  </div>
                </div>

                <Card className="webinar-container">
                  {streams?.map((item, index) => {
                    return (
                      <div className="webinar-time-prompt" key={index}>
                        <img src={bellicon} alt="bell icon" />
                        <p>
                          You have a Webinar Scheduled Today{" "}
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
                  <div className="card-title">
                    <p className="page-title__text">Upcoming Webinars </p>
                    {/* {userStreams?.length >= 3 && ( */}
                    {filteredStreams?.length > 3 && (

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
                    <div className="table-heading">
                      <p className="first">Time</p> <p>Title</p>
                    </div>
                    {loading ? (
                      // <p>Loading animation...</p>
                      <div className="table-body-empty">
                        <Spinner />
                      </div>
                    ) : userStreams?.length < 1 ? (
                      <div className="table-body-empty">
                        <p>You have no upcoming webinars.</p>
                      </div>
                    ) : (
                      // userStreams.map((item, index) => {
                      filteredStreams.map((item, index) => {
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
                      <Link to="/dashboard/livewebinar/create">
                        <Button className="page-title_cta-btn">
                          <i className="fas fa-plus mr-2"></i> Schedule Webinar
                        </Button>
                      </Link>
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
