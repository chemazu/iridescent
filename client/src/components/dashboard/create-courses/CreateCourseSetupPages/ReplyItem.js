import React from "react";
import moment from "moment";
import detectMentionInText from "../../../../utilities/detectMentionInText";
import preProcessTextAsMarkUp from "../../../../utilities/preProcessTextAsMarkUp";
// import randomUserAvatar from "../../../../images/random-avatar.jpg"

const createMarkUp = (markUp) => {
  return { __html: markUp };
};

const ReplyItem = ({ reply, replyInView }) => {
  return (
    <>
      <div className="reply-item mb-4">
        <div className="reply-user-avatar">
          <img
            className="img-fluid"
            src={reply.replyavatar}
            alt="user avatar display"
          />
        </div>
        <div className="reply-item__details">
          <div className="reply-name-control">
            <div className="reply-name-and-timestamp">
              <p>
                {reply.username}{" "}
                <span className="ml-3">{moment(reply.date).fromNow()}</span>
                {replyInView !== null && replyInView === reply._id && (
                  <span className="ml-3 comment-info__tag">Reply in View</span>
                )}
              </p>
            </div>
            <div className="reply-menu">
              <i className="fas fa-ellipsis-v"></i>
            </div>
          </div>
          <div className="reply-text">
            {detectMentionInText(reply.text).length > 0 ? (
              <div
                dangerouslySetInnerHTML={createMarkUp(
                  preProcessTextAsMarkUp(reply.text)
                )}
              ></div>
            ) : (
              <p className="mb-1 mt-1">{reply.text}</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ReplyItem;
