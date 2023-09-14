import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useAlert } from "react-alert";
import axios from "axios";
import { Row, Col, Container } from "reactstrap";
import DashboardNavbar from "../DashboardNavbar";
import NotificationNavbar from "../NotificationNavbar";
import TutorialItem from "./TutorialItem";
import {
  LOAD_ACTIVE_TUTORIAL,
  DISPLAY_TUTORIALS_MODAL,
} from "../../../actions/types";

import { UPDATE_DASHBOARD_PAGE_COUNTER } from "../../../actions/types";

import "../../../custom-styles/dashboard/dashboardlayout.css";
import "../../../custom-styles/dashboard/tutorial.css";

const Tutorials = () => {
  const dispatch = useDispatch();
  const [tutorials, setTutorials] = useState([]);
  const [loading, setLoading] = useState(true);
  const alert = useAlert();

  const getTutorialsWalkthrough = async () => {
    try {
      const res = await axios.get("/api/v1/tutorial");
      setTutorials(res.data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      const errors = error.response.data.errors;
      if (errors) {
        return errors.forEach((err) => {
          alert.show(err.msg, {
            type: "error",
          });
        });
      }
      alert.show(error.message, {
        type: "error",
      });
    }
  };

  const tutorialItemUpdateClickHandler = (tutorial) => {
    dispatch({
      type: LOAD_ACTIVE_TUTORIAL,
      payload: tutorial,
    });
    dispatch({ type: DISPLAY_TUTORIALS_MODAL });
  };

  useEffect(() => {
    dispatch({
      type: UPDATE_DASHBOARD_PAGE_COUNTER,
      payload: 55,
    });
    getTutorialsWalkthrough();
    // eslint-disable-next-line
  }, []);

  return (
    <>
      <div className="dashboard-layout">
        <Container fluid>
          <Row>
            <DashboardNavbar />
            <Col className="page-actions__col">
              <div className="page-actions">
                <NotificationNavbar />
                <div className="tutorial-content__container">
                  <div className="tutorial-page__title">
                    <h3>Tuturly Dashboard Tutorials</h3>
                  </div>

                  <div className="page-description__container">
                    <p className="tutorial-page__description">
                      Learn to navigate through your tutors dashboard
                    </p>
                  </div>

                  <div className="tutorials-container">
                    <Row>
                      {loading ? (
                        <div
                          style={{
                            width: "50%",
                            margin: "10px auto",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "40px 10px",
                          }}
                        >
                          <i
                            style={{ fontSize: "22px" }}
                            className="fas fa-circle-notch fa-spin"
                          ></i>
                        </div>
                      ) : (
                        <>
                          {tutorials.length === 0 ? (
                            <p className="text-center no-tutorials-found">
                              No tutorials found at this time!
                            </p>
                          ) : (
                            <>
                              {tutorials.map((tutorial) => (
                                <TutorialItem
                                  tutorial={tutorial}
                                  tutorialItemUpdateClickHandler={
                                    tutorialItemUpdateClickHandler
                                  }
                                />
                              ))}
                            </>
                          )}
                        </>
                      )}
                    </Row>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
};

export default Tutorials;
