import React, { useState, useEffect } from "react";
import { connect, useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { Row, Col, Container, Button } from "reactstrap";
import axios from "axios";
import { useAlert } from "react-alert";
import {
  UPDATE_DASHBOARD_PAGE_COUNTER,
  SHOW_PAYMENT_MODAL,
} from "../../../actions/types";
import { startLoading, stopLoading } from "../../../actions/appLoading";
import setAuthToken from "../../../utilities/setAuthToken";
import DashboardNavbar from "../DashboardNavbar";
import CoursesContainer from "./CoursesContainer";

import "../../../custom-styles/dashboard/dashboardlayout.css";
import "../../../custom-styles/dashboard/courses.css";
import NotificationNavbar from "../NotificationNavbar";

const Courses = ({ school, updatePageSelector }) => {
  const [courses, setCourse] = useState([]);
  const alert = useAlert();
  const [loading, setLoading] = useState(true);
  const history = useHistory();
  const dispatch = useDispatch();

  const getSchoolCourses = async () => {
    try {
      if (localStorage.getItem("token")) {
        setAuthToken(localStorage.getItem("token"));
      }
      const res = await axios.get(`/api/v1/course/school/${school._id}`);
      setCourse(res.data);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setCourse([]);
      setLoading(false);
      const errors = error.response.data.errors;
      if (errors) {
        errors.forEach((element) => {
          alert.show(element.msg, {
            type: "error",
          });
        });
      }
    }
  };

  const pushToCreateCourseLink = async () => {
    await validateUserCourseCountBeforePush();
  };

  const validateUserCourseCountBeforePush = async () => {
    try {
      dispatch(startLoading());
      if (localStorage.getItem("token")) {
        setAuthToken(localStorage.getItem("token"));
      }
      await axios.get("/api/v1/course/user/createcourse");
      dispatch(stopLoading());
      history.push("/dashboard/createcourse");
    } catch (error) {
      dispatch(stopLoading());
      const errors = error.response.data.errors;
      if (errors) {
        errors.forEach((element) => {
          alert.show(element.msg, {
            type: "error",
          });
        });
      }
      if (error.response.status === 402) {
        dispatch({
          type: SHOW_PAYMENT_MODAL,
        });
      }
      alert.show(error.message, {
        type: "error",
      });
    }
  };

  useEffect(() => {
    if (school) {
      getSchoolCourses();
    }
    // eslint-disable-next-line
  }, [school]);

  useEffect(() => {
    updatePageSelector(4);
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
                <div className="courses-page">
                  <div className="courses-page__contents">
                    <div className="page-title">
                      <div className="page-title__text">My Courses</div>
                      <div className="page-title_cta">
                        <Button
                          className="page-title_cta-btn"
                          onClick={pushToCreateCourseLink}
                        >
                          <i className="fas fa-plus mr-2"></i> Create New Course
                        </Button>
                      </div>
                    </div>
                    {loading === false ? (
                      <CoursesContainer courses={courses} />
                    ) : (
                      <p className="text-center lead">Loading</p>
                    )}
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

const mapStateToProps = (state) => ({
  school: state.school.schoolDetails,
});

const mapDispatchToProps = (dispatch) => ({
  updatePageSelector: (counter) =>
    dispatch({ type: UPDATE_DASHBOARD_PAGE_COUNTER, payload: counter }),
});

export default connect(mapStateToProps, mapDispatchToProps)(Courses);
