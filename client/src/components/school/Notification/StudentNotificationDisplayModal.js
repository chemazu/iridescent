import React, { useState, useEffect } from "react";
import { Modal } from "reactstrap";
import { useStore } from "react-redux";
import axios from "axios";
import { useAlert } from "react-alert";
import setAuthToken from "../../../utilities/setAuthToken";
import DiscussionCommentItem from "../DiscussionCommentItem";

const StudentNotificationDisplayModal = ({
  displayNotificationComments,
  courseUnitId,
  commentId,
  replyId,
  courseChapter,
  setNotificationDisplay,
  theme,
}) => {
  const [courseUnitDetails, setCourseUnitDetails] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentInView, setCommentInView] = useState(null);
  const [loading, setLoading] = useState(true);
  const alert = useAlert();
  const store = useStore();

  const appState = store.getState();
  const student = appState.student.studentDetails;

  const getCourseUnitByCourseUnitId = async (courseUnitId) => {
    if (localStorage.getItem("studentToken")) {
      setAuthToken(localStorage.getItem("studentToken"));
    }
    try {
      const res = await axios.get(
        `/api/v1/studentcourse/courseunit/load/${courseUnitId}`
      );
      setCourseUnitDetails(res.data);
    } catch (error) {
      const errors = error.response.data.errors;
      if (errors) {
        errors.forEach((err) => {
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

  const getCommentsFromCourseUnitId = async (courseUnitId) => {
    if (localStorage.getItem("studentToken")) {
      setAuthToken(localStorage.getItem("studentToken"));
    }
    try {
      const res = await axios.get(
        `/api/v1/comment/${courseUnitId}/?page=1&size=10`
      );
      setComments([...comments, ...res.data.docs]);
    } catch (error) {
      const errors = error.response.data.errors;
      if (errors) {
        errors.forEach((err) => {
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

  const getCommentInViewFromCommentId = async (commentId) => {
    try {
      if (localStorage.getItem("studentToken")) {
        setAuthToken(localStorage.getItem("studentToken"));
      }
      const res = await axios.get(`/api/v1/comment/single/${commentId}`);
      setCommentInView(res.data);
    } catch (error) {
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

  const loadModalContents = async () => {
    await getCourseUnitByCourseUnitId(courseUnitId);
    await getCommentsFromCourseUnitId(courseUnitId);
    await getCommentInViewFromCommentId(commentId);
    setLoading(false);
  };

  useEffect(() => {
    loadModalContents();
    // eslint-disable-next-line
  }, []);

  return (
    <>
      <Modal
        className="student-notification-comment-display__modal"
        isOpen={displayNotificationComments}
        size="lg"
        centered
      >
        {loading ? (
          <>
            <div className="modal-loader-container">
              <div
                style={{
                  width: "80%",
                  margin: "10px auto",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "40px 10px",
                  backgroundColor: theme.themestyles.primarybackgroundcolor,
                }}
              >
                <i
                  style={{
                    fontSize: "22px",
                    color: theme.themestyles.primarytextcolor,
                  }}
                  className="fas fa-circle-notch fa-spin"
                ></i>
              </div>
            </div>
          </>
        ) : (
          <>
            <div
              style={{
                backgroundColor: theme.themestyles.primarybackgroundcolor,
              }}
              className="student-modal-comments-container"
            >
              <div
                style={{
                  borderBottomColor: theme.themestyles.primarytextcolor,
                }}
                className="modal-header student-modal-comments__info-header"
              >
                <h3
                  style={{
                    color: theme.themestyles.primarytextcolor,
                  }}
                >
                  Comments On "{courseUnitDetails.name}"
                </h3>
                <div
                  onClick={() => setNotificationDisplay(false)}
                  className="student-notification__modal-close-btn"
                >
                  <i
                    style={{
                      color: theme.themestyles.primarytextcolor,
                    }}
                    className="fas fa-times"
                  ></i>
                </div>
              </div>
              <div
                style={{
                  backgroundColor: theme.themestyles.primarybackgroundcolor,
                }}
                className="student-notification-modal__body modal-body"
              >
                <DiscussionCommentItem
                  comment={commentInView}
                  courseUnitId={courseUnitId}
                  commentInViewId={commentId}
                  student={student}
                  courseChapterId={courseChapter}
                  replyInViewId={replyId}
                  theme={theme}
                />
                <hr
                  style={{
                    backgroundColor: theme.themestyles.primarytextcolor,
                  }}
                />
                {comments
                  .filter((item) => item._id !== commentId)
                  .map((comment) => {
                    return (
                      <DiscussionCommentItem
                        key={comment._id}
                        comment={comment}
                        courseUnitId={courseUnitId}
                        commentInViewId={commentId}
                        student={student}
                        courseChapterId={courseChapter}
                        replyInViewId={replyId}
                        theme={theme}
                      />
                    );
                  })}
              </div>
            </div>
          </>
        )}
      </Modal>
    </>
  );
};

export default StudentNotificationDisplayModal;
