import React, { useState, useEffect } from "react";
import { useStore } from "react-redux";
import { FormGroup, Input, Button } from "reactstrap";
import axios from "axios";
import setAuthToken from "../../../../utilities/setAuthToken";
import moment from "moment";
import { useAlert } from "react-alert";
import ReplyContainer from "./ReplyContainer";
import randomUserAvatar from "../../../../images/random-avatar.jpg";
import detectMentionInText from "../../../../utilities/detectMentionInText";
import preProcessTextAsMarkUp from "../../../../utilities/preProcessTextAsMarkUp";

const createMarkUp = (markUp) => {
  return { __html: markUp };
};

const CommentsItem = ({
  comment,
  courseunitId,
  courseChapterId,
  commntInView,
  replyInView,
}) => {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [loading, setLoading] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replies, setReplies] = useState([]);
  const appStore = useStore();
  const state = appStore.getState();
  const alert = useAlert();

  const displayTextInput = () => setShowReplyInput(true);
  const removeTextInput = () => setShowReplyInput(false);
  const updateReplyText = (e) => setReplyText(e.target.value);
  const toggleShowReply = () => setShowReplies(!showReplies);

  const postReply = async () => {
    if (replyText.length === 0) {
      return alert.show("reply text cannot be empty", {
        type: "error",
      });
    }
    if (localStorage.getItem("token")) {
      setAuthToken(localStorage.getItem("token"));
    }
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const body = JSON.stringify({
      text: replyText,
      schoolname: state.school.schoolDetails.name,
    });
    try {
      setLoading(true);
      const res = await axios.post(
        `/api/v1/reply/${comment._id}/${courseunitId}/${courseChapterId}`,
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

  useEffect(() => {
    if (commntInView === comment._id) {
      if (replyInView) {
        setShowReplies(true);
      }
    }
    // eslint-disable-next-line
  }, [replyInView]);

  useEffect(() => {
    setReplies(comment.reply);
    // eslint-disable-next-line
  }, []);

  return (
    <>
      <div className="comments-item mb-4">
        <div className="comment-user-avatar">
          <img
            className="img-fluid"
            src={randomUserAvatar}
            alt="user avatar display"
          />
        </div>
        <div className="comment-item__details">
          <div className="comment-name-and-timestamp">
            <p>
              {comment.username}{" "}
              <span className="ml-3">{moment(comment.date).fromNow()}</span>
              {commntInView !== null && commntInView === comment._id && (
                <span className="ml-3 comment-info__tag">Comment in View</span>
              )}
            </p>
          </div>
          <div className="comment-text">
            {detectMentionInText(comment.text).length > 0 ? (
              <div
                dangerouslySetInnerHTML={createMarkUp(
                  preProcessTextAsMarkUp(comment.text)
                )}
              />
            ) : (
              <p>{comment.text}</p>
            )}
          </div>
          <div className="comment-controls">
            <div className="reply-controls">
              <div
                onClick={displayTextInput}
                className="reply-button-and-counter"
              >
                {replies?.length > 0 && replies?.length}
                <i className="fas fa-reply ml-1"></i>
              </div>
              {replies?.length > 0 && (
                <>
                  {showReplies ? (
                    <div onClick={toggleShowReply} className="view-reply ml-4">
                      <i className="fas fa-circle"></i> Hide replies
                    </div>
                  ) : (
                    <div onClick={toggleShowReply} className="view-reply ml-4">
                      <i className="fas fa-circle"></i> View replies
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="comments-menu">
              <i className="fas fa-ellipsis-v"></i>
            </div>
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
                border: "none",
              }}
              onClick={removeTextInput}
            >
              Cancel
            </Button>
            <Button
              style={{
                boxShadow: "none",
                border: "none",
                color: "#fff",
                backgroundColor: "#FF3100",
              }}
              onClick={postReply}
            >
              Send Reply
            </Button>
          </FormGroup>
        </div>
      )}
      {showReplies && (
        <ReplyContainer replies={replies} replyInView={replyInView} />
      )}
    </>
  );
};

export default CommentsItem;
