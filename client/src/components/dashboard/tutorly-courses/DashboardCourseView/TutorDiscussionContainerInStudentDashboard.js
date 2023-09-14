import React, { useState, useEffect, useRef, useCallback } from "react";
import { connect, useStore } from "react-redux";
import axios from "axios";
import { Button, Form, FormGroup } from "reactstrap";
import { useAlert } from "react-alert";
import TutorDiscussionCommentItem from "./TutorDiscussionCommentItem";
import setAuthToken from "../../../../utilities/setAuthToken";

const TutorDiscussionContainerInStudentDashboard = ({
  courseUnitId,
  updateCourseUnitCommentsCounter,
  idOfCourseChapter,
  student,
}) => {
  const [comments, setComments] = useState([]);
  // eslint-disable-next-line
  const [commentsPaginationDetails, setCommentsPaginationDetails] =
    useState(null);
  const [loadingComments, setLoadingComments] = useState(true);
  const [commentsPagination, setCommentsPagination] = useState(1);
  // eslint-disable-next-line
  const [loadingMoreTextDisplay, setLoadingMoreTextDisplay] = useState(false);
  // eslint-disable-next-line
  const [hasMore, setHasMore] = useState(false);
  const [newCommentText, setNewCommentText] = useState("");
  const [loadingCommentSubmit, setLoadingCommentSubmit] = useState(false);
  const alert = useAlert();
  const appStore = useStore();
  const appState = appStore.getState();
  const subDomainName = appState.subdomain;

  const loadComments = async () => {
    if (localStorage.getItem("studentToken")) {
      setAuthToken(localStorage.getItem("studentToken"));
    }
    try {
      const res = await axios.get(
        `/api/v1/comment/${courseUnitId}/?page=${commentsPagination}&size=5`
      );
      setCommentsPaginationDetails(res.data);
      // setComments(res.data.docs);
      setComments((prevComments) => {
        return [...new Set([...prevComments, ...res.data.docs])];
      });
      // set has more
      // setCommentsPagination(res.data.nextPage);
      setHasMore(res.data.length > 0);
      setLoadingComments(false);
    } catch (error) {
      console.log(error);
    }
  };

  const saveComment = async () => {
    if (newCommentText.length === 0) {
      return alert.show("comment text cannot be empty", {
        type: "error",
      });
    }
    if (localStorage.getItem("studentToken")) {
      setAuthToken(localStorage.getItem("studentToken"));
    }
    try {
      setLoadingCommentSubmit(true);
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };
      const body = JSON.stringify({
        text: newCommentText,
        commentuserid: student._id,
        schoolname: subDomainName,
      });

      const res = await axios.post(
        `/api/v1/comment/${courseUnitId}/${idOfCourseChapter}`,
        body,
        config
      );
      setComments([...comments, res.data]);
      setNewCommentText("");
      setLoadingCommentSubmit(false);
    } catch (error) {
      console.log(error);
      setLoadingCommentSubmit(false);
    }
  };

  const handleCommentDeleteClick = async (commentId) => {
    if (localStorage.getItem("studentToken")) {
      setAuthToken(localStorage.getItem("studentToken"));
    }
    try {
      setLoadingCommentSubmit(true);
      const res = await axios.delete(`/api/v1/comment/${commentId}`);
      const filteredOutComment = comments.filter(
        (comment) => comment._id !== res.data._id
      );
      setComments(filteredOutComment);
      setLoadingCommentSubmit(false);
    } catch (error) {
      console.log(error);
      setLoadingCommentSubmit(false);
    }
  };

  const submitComment = (e) => {
    e.preventDefault();
    saveComment();
  };
  const observer = useRef();
  const lastBookElementRef = useCallback(
    (node) => {
      // if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          setCommentsPagination((commentsPagination) => {
            return commentsPagination + 1;
          });
          // console.log("update page",commentsPagination)
        }
      });
      console.log("first", commentsPagination);
      if (node) observer.current.observe(node);
    },
    // eslint-disable-next-line
    [loadingComments]
  );
  const uniquebyID = (array) => {
    return [...new Map(array.map((item) => [item["_id"], item])).values()];
  };
  useEffect(() => {
    loadComments();
    // eslint-disable-next-line
  }, [courseUnitId, commentsPagination]);

  useEffect(() => {
    updateCourseUnitCommentsCounter(comments.length);
    // eslint-disable-next-line
  }, [comments]);

  return (
    <>
      <div className="tutor-add-new-discussion__form">
        <Form onSubmit={(e) => submitComment(e)}>
          <FormGroup>
            <textarea
              id="comment-textarea-id"
              className="form-control mb-3"
              rows="3"
              placeholder="Add Comment..."
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
            ></textarea>
          </FormGroup>
          <FormGroup>
            <Button
              disabled={loadingCommentSubmit}
              className="modal-btn-style"
              type="submit"
            >
              Submit Comment
            </Button>
          </FormGroup>
        </Form>
      </div>
      <div className="tutor-discussion-container">
        {loadingComments ? (
          <div
            style={{
              width: "50%",
              margin: "20px auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#000000",
            }}
          >
            <i
              style={{ fontSize: "22px" }}
              className="fas fa-circle-notch fa-spin"
            ></i>
          </div>
        ) : (
          <>
            {comments.length === 0 ? (
              <p
                style={{
                  color: "#000000",
                  fontSize: "14px",
                }}
                className="text-center lead mt-2 mb-3"
              >
                No Comments Found
              </p>
            ) : (
              <>
                {uniquebyID(comments).map((comment, index) => {
                  if (comment.length === index + 1) {
                    return (
                      <TutorDiscussionCommentItem
                        key={comment._id}
                        comment={comment}
                        courseUnitId={courseUnitId}
                        courseChapterId={idOfCourseChapter}
                        student={student}
                        handleCommentDeleteClick={handleCommentDeleteClick}
                        refHandler={lastBookElementRef}
                      />
                    );
                  } else {
                    return (
                      <TutorDiscussionCommentItem
                        key={comment._id}
                        comment={comment}
                        courseUnitId={courseUnitId}
                        courseChapterId={idOfCourseChapter}
                        student={student}
                        handleCommentDeleteClick={handleCommentDeleteClick}
                      />
                    );
                  }
                })}
              </>
            )}
          </>
        )}
      </div>
    </>
  );
};

const mapStateToProps = (state) => ({
  student: state.student.studentDetails,
});

export default connect(mapStateToProps)(
  TutorDiscussionContainerInStudentDashboard
);
