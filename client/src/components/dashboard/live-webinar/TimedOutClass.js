import React from "react";
import DashboardNavbar from "../DashboardNavbar";
import { Col, Container, Row, Button, Card  } from "reactstrap";
import classEnd from "../../../images/class-over.svg";
import "../../../custom-styles/dashboard/timed-out-class.css";
import { useHistory } from "react-router-dom";

export default function TimedOutClass({ schoolInfo }) {
 
    const history = useHistory();
 
  let { firstname, lastname, title, avatar } = schoolInfo;
  return (
    <div className="dashboard-layout">
      <Container fluid>
        <Row>
          <DashboardNavbar />
          <Col className="page-actions__col">
            <div className="live-webinar">
              <div className="live-webinar-content">
                {/* <NotificationNavbar /> */}

                <div className="page-title">
                  <div className="page-title__text">
                    {" "}
                    <div className="title-bar">
                      <div className="page-title__text">{title}</div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <span>
                          {firstname} {lastname}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="page-title_cta">
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

                <Card className="webinar-container timed-out">
                  <div className="time-out-container">
                    
                  <div className="time-out-left">
                    <img src={avatar} alt="class-over" />
                  </div>
                  <div className="time-out-right">
                    <img src={classEnd} alt="class-over" />
                    <p>Your live class has ended</p>
                    <div className="button-wrapper">

                      <Button
                           onClick={() => {
                            history.push("/dashboard/plans/payment");
                          }}
                      >Upgrade your plan to get unlimited time</Button>
                      <Button className="cancel"
                      
                      onClick={() => {
                        history.push("/dashboard/livewebinar");
                      }}
                      >Return to Tuturly class menu</Button>
                    </div>
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
