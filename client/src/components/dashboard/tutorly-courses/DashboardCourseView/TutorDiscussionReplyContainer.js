import React, { useState, useEffect } from "react";
import TutorDiscussionReplyItem from "./TutorDiscussionReplyItem";

const TutorDiscussionReplyContainer = ({
  replyInViewId,
  replies,
  handleReplyDeleteClick,
}) => {
  const [loadedReplies, setLoadedReplies] = useState([]);

  useEffect(() => {
    setLoadedReplies(replies);
    // eslint-disable-next-line
  }, [replies]);

  return (
    <>
      <div className="tutor-discussion-reply-container">
        {loadedReplies.map((reply) => (
          <TutorDiscussionReplyItem
            key={reply._id}
            reply={reply}
            handleReplyDeleteClick={handleReplyDeleteClick}
            replyInViewId={replyInViewId}
          />
        ))}
      </div>
    </>
  );
};

export default TutorDiscussionReplyContainer;
