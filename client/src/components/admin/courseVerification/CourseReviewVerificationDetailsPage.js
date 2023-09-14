import React, { useState, useEffect, useMemo } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { useHistory } from "react-router-dom";
import { Col, Container, Row, Button, Modal, Label } from "reactstrap";
import CurrencyFormat from "react-currency-format";
import axios from "axios";
import { useAlert } from "react-alert";
import setAuthToken from "../../../utilities/setAuthToken";
import { startLoading, stopLoading } from "../../../actions/appLoading";

import AdminDashboardNavbar from "../AdminDashboardNavbar";
import AdminNotificationNavbar from "../AdminNotificationNavbar";
import CourseVerificationRequestModuleItem from "./CourseVerificationRequestModuleItem";
import VideoJS from "../../VideoJSPlayer/VideoJS";

import "../../../custom-styles/admin/coursereviewverificationdetailspage.css";

const CourseReviewVerificationDetailsPage = ({ match: { params } }) => {
  const [verificationRequestDetails, setVerificationRequestDetails] =
    useState(null);
  const [loading, setLoading] = useState(true);
  const alert = useAlert();
  const [activeCourse, setActiveCourse] = useState(null);
  const [courseModules, setCourseModules] = useState([]);
  const [displayConfrimationModal, setDisplayConfirmationModal] =
    useState(false);
  const [displayRejectCourseModal, setDisplayRejectCourseModal] =
    useState(false);
  const [reason, setReason] = useState("");
  const dispatch = useDispatch();
  const history = useHistory();

  const getVerificationDetails = async () => {
    if (localStorage.getItem("token")) {
      setAuthToken(localStorage.getItem("token"));
    }
    try {
      const res = await axios.get(
        `/api/v1/courseverification/${params.requestId}`
      );
      const modulesRes = await axios.get(
        `/api/v1/coursechapter/${res.data.course_id._id}`
      );
      setCourseModules(modulesRes.data);
      setVerificationRequestDetails(res.data);

      if (modulesRes.data.length > 0) {
        if (modulesRes.data[0].courseunit.length > 0) {
          setActiveCourse(modulesRes.data[0].courseunit[0]);
        } else {
          setActiveCourse(null);
        }
      }

      setLoading(false);
    } catch (error) {
      setVerificationRequestDetails(null);
      setLoading(false);
      const errors = error.response.data.errors;
      if (errors) {
        return errors.forEach((element) => {
          alert.show(element.msg, {
            type: "error",
          });
        });
      }
      alert.show(error.message, { type: "error" });
    }
  };

  const setActiveCourseHandler = (unitDetails) => setActiveCourse(unitDetails);

  const handleApproveCourseConfirm = async () => {
    setDisplayConfirmationModal(false);
    try {
      if (localStorage.getItem("token")) {
        setAuthToken(localStorage.getItem("token"));
      }
      dispatch(startLoading());
      await axios.put(`/api/v1/courseverification/${params.requestId}`);
      alert.show("course confirmation completed successfully", {
        type: "success",
      });
      dispatch(stopLoading());
    } catch (error) {
      dispatch(stopLoading());
      const errors = error.response.data.errors;
      if (errors) {
        return errors.forEach((element) => {
          alert.show(element.msg, {
            type: "error",
          });
        });
      }
      alert.show(error.message, { type: "error" });
    }
  };

  const handleRejectionClickHandler = async () => {
    if (reason.length === 0) {
      return alert.show("Rejection must have a reason", { type: "error" });
    }
    setDisplayRejectCourseModal(false);
    try {
      if (localStorage.getItem("token")) {
        setAuthToken(localStorage.getItem("token"));
      }
      dispatch(startLoading());
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };
      const body = JSON.stringify({ reason });
      await axios.put(
        `/api/v1/courseverification/reject/${params.requestId}`,
        body,
        config
      );
      alert.show("course rejecttion completed successfully", {
        type: "success",
      });
      setReason("");
      history.push("/admin/course");
      dispatch(stopLoading());
    } catch (error) {
      dispatch(stopLoading());
      setReason("");
      const errors = error.response.data.errors;
      if (errors) {
        return errors.forEach((element) => {
          alert.show(element.msg, {
            type: "error",
          });
        });
      }
      alert.show(error.message, { type: "error" });
    }
  };

  // video JS controls and options
  const videoJsOptions = useMemo(() => {
    const options = {
      autoplay: false,
      controls: true,
      responsive: true,
      fill: true,
      playbackRates: [0.5, 1, 1.5, 2],
      controlBar: {
        remainingTimeDisplay: {
          displayNegative: false,
        },
      },
      plugins: {
        seekButtons: {
          forward: 10,
          back: 10,
        },
      },
      videotitle: activeCourse?.name,
      sources:
        activeCourse?.isCloudflareVideoSource !== true
          ? [
              {
                src: activeCourse?.videourl,
                type: "video/mp4",
              },
              {
                src: activeCourse?.videourl.replace(".mp4", ".webm"),
                type: "video/webm",
              },
              {
                src: activeCourse?.videourl.replace(".mp4", ".ogv"),
                type: "video/ogg",
              },
            ]
          : [
              {
                src: activeCourse?.cloudflare_hsl_videourl,
                type: "application/x-mpegURL",
              },
              {
                src: activeCourse?.cloudflare_dash_videourl,
                type: "application/dash+xml",
              },
            ],
    };
    return options;
  }, [activeCourse]);

  useEffect(() => {
    getVerificationDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className="admin-dashboard-layout">
        <Container fluid>
          <Row>
            <AdminDashboardNavbar />
            <Col className="admin-page-actions__col">
              <div className="admin-page-actions">
                <AdminNotificationNavbar />
                <Container
                  fluid
                  className="course-verification-details__container"
                >
                  <Button
                    className="course-verification__btn ml-2"
                    tag={Link}
                    to="/admin/course"
                  >
                    <i className="fas fa-long-arrow-alt-left mr-2"></i>
                    Back to new Request
                  </Button>
                </Container>
                <Container
                  fluid
                  className="course-verification-details__container"
                >
                  <div className="course-details__container">
                    {loading ? (
                      <div
                        style={{
                          width: "50%",
                          margin: "20px auto",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <i
                          style={{ fontSize: "22px" }}
                          className="fas fa-circle-notch fa-spin"
                        ></i>
                      </div>
                    ) : (
                      <>
                        <div className="verification-request-course-details">
                          <div className="course-details-image__container">
                            <img
                              src={
                                verificationRequestDetails.course_id.thumbnail
                              }
                              alt="..."
                            />
                          </div>
                          <div className="course-details-info__container">
                            <p
                              title={verificationRequestDetails.course_id.title}
                              className="course-details-name"
                            >
                              {verificationRequestDetails.course_id.title}
                            </p>
                            <div className="course-details-more__info">
                              <div>
                                <p className="course-publish-status">
                                  {verificationRequestDetails.course_id
                                    .published
                                    ? "Published"
                                    : "Not Published"}
                                </p>
                                <p className="course-author-status">{`${verificationRequestDetails.course_author.firstname} ${verificationRequestDetails.course_author.lastname}`}</p>
                              </div>
                              <h3 className="course-verification__price">
                                &#8358;
                                <CurrencyFormat
                                  value={
                                    verificationRequestDetails.course_id.price
                                  }
                                  displayType="text"
                                  thousandSeparator={true}
                                  fixedDecimalScale={true}
                                />
                              </h3>
                            </div>
                            <div className="course-request-cta__container">
                              <Button
                                block
                                className="course-request-approve__btn"
                                onClick={() =>
                                  setDisplayConfirmationModal(true)
                                }
                              >
                                Approve Course
                              </Button>
                              <Button
                                block
                                className="course-request-reject__btn"
                                onClick={() =>
                                  setDisplayRejectCourseModal(true)
                                }
                              >
                                Reject Course
                              </Button>
                            </div>
                          </div>
                        </div>
                        <div className="verification-request-course__contents mt-5">
                          {activeCourse.isCloudflareVideoSource !== true ? (
                            <>
                              <VideoJS options={videoJsOptions} />
                            </>
                          ) : (
                            <>
                              {activeCourse.isStreamReady === true ? (
                                <>
                                  <VideoJS options={videoJsOptions} />
                                </>
                              ) : (
                                <>
                                  <div className="video-unit-still-processing__message">
                                    <p className="text-center">
                                      Video is still processing. Refresh page to
                                      update.
                                    </p>
                                  </div>
                                </>
                              )}
                            </>
                          )}
                          {courseModules.length === 0 ? (
                            <p className="text-center mt-3">
                              course modules not found
                            </p>
                          ) : (
                            <>
                              {courseModules.map((moduleItem) => (
                                <CourseVerificationRequestModuleItem
                                  key={moduleItem._id}
                                  moduleItem={moduleItem}
                                  setActiveCourseHandler={
                                    setActiveCourseHandler
                                  }
                                />
                              ))}
                            </>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </Container>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
      <Modal isOpen={displayConfrimationModal} centered size="md">
        <div className="modal-header">
          <h3 className="approve-course-modal__header">Approve Course</h3>
          <div
            className="approve-course-modal__cta"
            onClick={() => setDisplayConfirmationModal(false)}
          >
            <i className="fas fa-times"></i>
          </div>
        </div>
        <div className="modal-body">
          <p className="text-center pt-3 pb-3">
            Are you sure you want to approve this course for verification ?
          </p>
        </div>
        <div className="modal-footer">
          <Button
            className="approve-course-cancel__btn"
            onClick={() => setDisplayConfirmationModal(false)}
            block
          >
            Cancel
          </Button>
          <Button
            onClick={handleApproveCourseConfirm}
            className="approve-course-confirm__btn"
            block
          >
            Confirm
          </Button>
        </div>
      </Modal>
      <Modal isOpen={displayRejectCourseModal} centered size="md">
        <div className="modal-header">
          <h3 className="approve-course-modal__header">Reject Course</h3>
          <div
            className="approve-course-modal__cta"
            onClick={() => setDisplayRejectCourseModal(false)}
          >
            <i className="fas fa-times"></i>
          </div>
        </div>
        <div className="modal-body pt-3 pb-3">
          <p className="reject-course-text">
            Are you sure you want to reject course for verification ?
          </p>
          <Label>Reason(s).</Label>
          <textarea
            rows={5}
            placeholder="Reason for Rejection"
            className="form-control"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          ></textarea>
        </div>
        <div className="modal-footer">
          <Button
            className="approve-course-cancel__btn"
            onClick={() => setDisplayRejectCourseModal(false)}
            block
          >
            Cancel
          </Button>
          <Button
            onClick={handleRejectionClickHandler}
            className="approve-course-confirm__btn"
            block
          >
            Confirm
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default CourseReviewVerificationDetailsPage;
