import React, { useState, useEffect } from "react";
import { useStore } from "react-redux";
import moment from "moment";
import axios from "axios";
import { useAlert } from "react-alert";
import { FormGroup, Input, Button, Popover, PopoverBody } from "reactstrap";
import DiscussionReplyContainer from "./DiscussionReplyContainer";
import setAuthToken from "../../utilities/setAuthToken";
// import randomUserAvatar from "../../images/random-avatar.jpg"

import "../../custom-styles/pages/components/discussioncommentitem.css";

const DiscussionCommentItem = ({
  comment,
  courseUnitId,
  theme,
  courseChapterId,
  student,
  handleCommentDeleteClick,
  commentInViewId,
  replyInViewId,
  refHandler
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
      <div className="discussion-comment-item mb-3" ref={refHandler}>
        <div className="item-avatar">
          <img
            className="img-fluid"
            src={comment.commentavatar}
            alt="student avatar display"
          />
        </div>
        <div className="discussion-details">
          <div className="discussion-name-and-timestamp">
            <p
              style={{
                color: theme.themestyles.primarytextcolor,
              }}
            >
              {comment.username}{" "}
              <span
                style={{
                  color: theme.themestyles.primarytextcolor,
                }}
                className="ml-3"
              >
                {moment(comment.date).fromNow()}
              </span>
              {commentInViewId !== null && commentInViewId === comment._id && (
                <span
                  style={{
                    backgroundColor: theme.themestyles.primarytextcolor,
                    color: theme.themestyles.primarybackgroundcolor,
                  }}
                  className="ml-3 student-comment-info__tag"
                >
                  Comment In View
                </span>
              )}
            </p>
          </div>
          <div
            style={{
              color: theme.themestyles.primarytextcolor,
            }}
            className="discussion-text"
          >
            <p>{comment.text}</p>
          </div>
          <div className="discussion-controls">
            <div className="discussion-reply-controls">
              <div
                style={{
                  color: theme.themestyles.primarytextcolor,
                }}
                onClick={displayTextInput}
                className="reply-btn-and-counter"
              >
                {replies?.length > 0 && replies?.length}
                <i className="fas fa-reply ml-1"></i>
              </div>
              {replies?.length > 0 && (
                <>
                  {showReplies ? (
                    <div
                      style={{
                        color: theme.themestyles.primarytextcolor,
                      }}
                      onClick={toggleShowReply}
                      className="view-reply ml-4"
                    >
                      <i className="fas fa-circle"></i> Hide replies
                    </div>
                  ) : (
                    <div
                      style={{
                        color: theme.themestyles.primarytextcolor,
                      }}
                      onClick={toggleShowReply}
                      className="view-reply ml-4"
                    >
                      <i className="fas fa-circle"></i> View replies
                    </div>
                  )}
                </>
              )}
            </div>
            {comment.commentby === student._id && (
              <>
                {" "}
                <div
                  style={{
                    color: theme.themestyles.primarytextcolor,
                  }}
                  className="discussion-comment-menu"
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
                    <PopoverBody
                      style={{
                        backgroundColor:
                          theme.themestyles.buttonbackgroundcolor,
                        color: theme.themestyles.buttontextcolor,
                      }}
                    >
                      <div
                        onClick={() => handleCommentDeleteClick(comment._id)}
                        className="comment-delete__menu-item"
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
        <div className="reply-form">
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
              style={{
                boxShadow: "none",
                backgroundColor: "transparent",
                border: `.5px solid ${theme.themestyles.buttonbackgroundcolor}`,
                color: theme.themestyles.buttonbackgroundcolor,
              }}
              onClick={removeTextInput}
            >
              Cancel
            </Button>
            <Button
              style={{
                backgroundColor: theme.themestyles.buttonbackgroundcolor,
                color: theme.themestyles.buttontextcolor,
                border: "none",
              }}
              onClick={postReply}
            >
              Send Reply
            </Button>
          </FormGroup>
        </div>
      )}
      {showReplies && (
        <DiscussionReplyContainer
          replyInViewId={replyInViewId}
          theme={theme}
          replies={replies}
          handleReplyDeleteClick={handleReplyDeleteClick}
        />
      )}
    </>
  );
};

export default DiscussionCommentItem;
