import React, { useState, useEffect } from "react";
import { Button, Modal } from "reactstrap";
import axios from "axios";
import { useAlert } from "react-alert";
import setAuthToken from "../../../utilities/setAuthToken";
import CommentsItem from "../create-courses/CreateCourseSetupPages/CommentsItem";

import "../../../custom-styles/dashboard/videounitpreview.css";

const NotificationCommentDisplayModal = ({
  notificationCommentUnits,
  setNotificationCommentUnit,
  courseUnitId,
  commentId,
  replyId,
  courseChapter,
}) => {
  const [courseUnitDetails, setCourseUnitDetails] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentDetails, setCommentDetails] = useState(null);
  const [commentInView, setCommentInView] = useState(null);
  const [commentsPaginate, setCommentsPaginate] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingComments, setLoadingComments] = useState(false);

  const alert = useAlert();

  const getCourseUnitByCourseUnitId = async (courseUnitId) => {
    if (localStorage.getItem("token")) {
      setAuthToken(localStorage.getItem("token"));
    }
    try {
      const res = await axios.get(`/api/v1/courseunit/${courseUnitId}`);
      setCourseUnitDetails(res.data);
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

  const getCommentsFromCourseUnitId = async (courseUnitId) => {
    if (localStorage.getItem("token")) {
      setAuthToken(localStorage.getItem("token"));
    }
    try {
      const res = await axios.get(
        `/api/v1/comment/${courseUnitId}/?page=${commentsPaginate}&size=5`
      );
      setCommentDetails(res.data);
      setComments(res.data.docs);
      setCommentsPaginate(res.data.nextPage);
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

  const seeMoreComments = async (courseUnitId) => {
    if (localStorage.getItem("token")) {
      setAuthToken(localStorage.getItem("token"));
    }
    try {
      setLoadingComments(true);
      const res = await axios.get(
        `/api/v1/comment/${courseUnitId}/?page=${commentsPaginate}&size=5`
      );
      setCommentDetails(res.data);
      setComments(comments.concat(res.data.docs));
      setCommentsPaginate(res.data.nextPage);
      setLoadingComments(false);
    } catch (error) {
      setLoadingComments(true);
      const errors = error?.response?.data?.errors;
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

  const seeLessComments = async (courseUnitId) => {
    if (localStorage.getItem("token")) {
      setAuthToken(localStorage.getItem("token"));
    }
    try {
      setLoadingComments(true);
      const res = await axios.get(
        `/api/v1/comment/${courseUnitId}/?page=1&size=5`
      );
      setCommentDetails(res.data);
      setComments(res.data.docs);
      setCommentsPaginate(res.data.nextPage);
      setLoadingComments(false);
    } catch (error) {
      setLoadingComments(true);
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

  const getCommentInViewFromCommentId = async (commentId) => {
    try {
      if (localStorage.getItem("token")) {
        setAuthToken(localStorage.getItem("token"));
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
      <Modal isOpen={notificationCommentUnits} size="lg" centered>
        {loading ? (
          <>
            <div className="modal-loader-container">
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
            </div>
          </>
        ) : (
          <>
            <div className="modal-header notification-comment-display-modal__header">
              <h3>Comments On "{courseUnitDetails.name}"</h3>
              <div
                onClick={() => setNotificationCommentUnit(false)}
                className="close-comment__modal"
              >
                <i className="fas fa-times"></i>
              </div>
            </div>
            <div
              style={{
                height: "70vh",
                overflowY: "auto",
              }}
              id="scrollableDiv"
              className="modal-body"
            >
              <div className="comments-container">
                <CommentsItem
                  comment={commentInView}
                  courseunitId={courseUnitId}
                  courseChapterId={courseChapter}
                  commntInView={commentId}
                  replyInView={replyId}
                />
                <hr />
                {comments
                  .filter((item) => item._id !== commentId)
                  .map((comment) => (
                    <CommentsItem
                      comment={comment}
                      courseunitId={courseUnitId}
                      courseChapterId={courseChapter}
                      commntInView={commentId}
                      replyInView={replyId}
                    />
                  ))}
              </div>
              {loadingComments === true && (
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
              )}
            </div>
            <div className="modal-footer">
              {commentDetails !== null && (
                <>
                  {commentDetails.hasNextPage === true ? (
                    <Button
                      onClick={(e) => seeMoreComments(courseUnitId)}
                      block
                      className="modal-btn-style"
                    >
                      See More
                    </Button>
                  ) : (
                    <Button
                      onClick={(e) => seeLessComments(courseUnitId)}
                      block
                      className="modal-btn-style"
                    >
                      See Less
                    </Button>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </Modal>
    </>
  );
};

export default NotificationCommentDisplayModal;
