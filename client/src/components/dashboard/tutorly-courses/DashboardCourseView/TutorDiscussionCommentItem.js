import React, { useState, useEffect } from "react";
import { useStore } from "react-redux";
import moment from "moment";
import axios from "axios";
import { useAlert } from "react-alert";
import { FormGroup, Input, Button, Popover, PopoverBody } from "reactstrap";
import setAuthToken from "../../../../utilities/setAuthToken";
import TutorDiscussionReplyContainer from "./TutorDiscussionReplyContainer";

const TutorDiscussionCommentItem = ({
  comment,
  courseUnitId,
  courseChapterId,
  student,
  handleCommentDeleteClick,
  commentInViewId,
  replyInViewId,
  refHandler,
}) => {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [loading, setLoading] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replies, setReplies] = useState([]);
  const [popoverOpen, setPopOverOpen] = useState(false);
  const appStore = useStore();
  const appState = appStore.getState();
  const subDomainName = appState.subdomain;

  const alert = useAlert();

  const displayTextInput = () => setShowReplyInput(true);
  const removeTextInput = () => setShowReplyInput(false);
  const updateReplyText = (e) => setReplyText(e.target.value);
  const toggleShowReply = () => setShowReplies(!showReplies);

  const togglePopover = () => setPopOverOpen(!popoverOpen);

  const postReply = async () => {
    if (replyText.length === 0) {
      return alert.show("reply text cannot be empty", {
        type: "error",
      });
    }
    if (localStorage.getItem("studentToken")) {
      setAuthToken(localStorage.getItem("studentToken"));
    }
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const body = JSON.stringify({
      text: replyText,
      schoolname: subDomainName,
    });

    try {
      setLoading(true);
      const res = await axios.post(
        `/api/v1/reply/${comment._id}/${courseUnitId}/${courseChapterId}`,
        body,
        config
      );
      setReplies([res.data, ...replies]);
      if (showReplies === false) {
        setShowReplies(true);
      }
      setReplyText("");
      setShowReplyInput(false);
      setLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  const handleReplyDeleteClick = async (replyId) => {
    if (localStorage.getItem("studentToken")) {
      setAuthToken(localStorage.getItem("studentToken"));
    }
    try {
      setLoading(true);
      const res = await axios.delete(`/api/v1/reply/${replyId}`);
      const filteredOutReply = replies.filter(
        (reply) => reply._id !== res.data._id
      );
      setReplies(filteredOutReply);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (commentInViewId === comment._id) {
      if (replyInViewId) {
        setShowReplies(true);
      }
    }
    // eslint-disable-next-line
  }, [replyInViewId]);

  useEffect(() => {
    setReplies(comment.reply);
    // eslint-disable-next-line
  }, []);

  return (
    <>
      <div ref={refHandler} className="tutor-discussion-comment__item mb-3">
        <div className="tutor-item__avatar">
          <img
            className="img-fluid"
            src={comment.commentavatar}
            alt="student avatar display"
          />
        </div>
        <div className="tutor-discussion-details">
          <div className="tutor-discussion-name-and-timestamps">
            <p className="username-text">{comment.username} </p>
            <span className="ml-3 timestamp-text">
              {moment(comment.date).fromNow()}
            </span>
            {commentInViewId !== null && commentInViewId === comment._id && (
              <span className="ml-3 comment-in-view__text">
                Comment in View
              </span>
            )}
          </div>
          <div className="tutor-discussion-text">
            <p>{comment.text}</p>
          </div>
          <div className="tutor-discussion-controls">
            <div className="tutor-discussion-reply__controls">
              <div
                onClick={displayTextInput}
                className="tutor-reply-btn-and-counter"
              >
                {replies?.length > 0 && replies?.length}
                <i className="fas fa-reply ml-1"></i>
              </div>
              {replies?.length > 0 && (
                <>
                  {showReplies ? (
                    <div
                      className="tutor-view-reply ml-4"
                      onClick={toggleShowReply}
                    >
                      <i className="fas fa-circle"></i> Hide replies
                    </div>
                  ) : (
                    <div>
                      <div
                        className="tutor-view-reply ml-4"
                        onClick={toggleShowReply}
                      >
                        <i className="fas fa-circle"></i> View replies
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
            {comment.commentby === student._id && (
              <>
                <div
                  className="tutor-discussion-comment-menu"
                  id={`comment-item-tooltip-${comment._id}`}
                  onClick={togglePopover}
                >
                  <i className="fas fa-ellipsis-v"></i>
                  <Popover
                    trigger="legacy"
                    placement="bottom"
                    isOpen={popoverOpen}
                    hideArrow={true}
                    target={`comment-item-tooltip-${comment._id}`}
                    toggle={togglePopover}
                  >
                    <PopoverBody className="tutor-popover-body__styles">
                      <div
                        onClick={() => handleCommentDeleteClick(comment._id)}
                        className="tutor-comment-delete__menu-item"
                      >
                        Delete
                      </div>
                    </PopoverBody>
                  </Popover>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      {loading && (
        <div
          style={{
            width: "50%",
            margin: "20px auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <i className="fas fa-circle-notch fa-spin"></i>
        </div>
      )}
      {showReplyInput && (
        <div className="tutor-reply-form">
          <FormGroup>
            <Input
              id="reply-textarea-id"
              placeholder="Add a reply to this comment"
              onChange={(e) => updateReplyText(e)}
              value={replyText}
            />
          </FormGroup>
          <FormGroup>
            <Button
              className="modal-btn-style-outline"
              style={{
                boxShadow: "none",
              }}
              onClick={removeTextInput}
            >
              Cancel
            </Button>
            <Button className="modal-btn-style" onClick={postReply}>
              Send Reply
            </Button>
          </FormGroup>
        </div>
      )}
      {showReplies && (
        <TutorDiscussionReplyContainer
          replyInViewId={replyInViewId}
          replies={replies}
          handleReplyDeleteClick={handleReplyDeleteClick}
        />
      )}
    </>
  );
};

export default TutorDiscussionCommentItem;
