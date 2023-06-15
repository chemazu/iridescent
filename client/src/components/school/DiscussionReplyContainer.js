import React, { useState, useEffect } from "react";
import DiscussionReplyItem from "./DiscussionReplyItem";

import "../../custom-styles/pages/components/discussionreplycontainer.css";

const DiscussionReplyContainer = ({
  replyInViewId,
  replies,
  theme,
  handleReplyDeleteClick,
}) => {
  const [loadedReplies, setLoadedReplies] = useState([]);

  useEffect(() => {
    setLoadedReplies(replies);
    // eslint-disable-next-line
  }, [replies]);

  return (
    <>
      <div className="student-dashboard-reply-container">
        {loadedReplies.map((reply) => (
          <DiscussionReplyItem
            key={reply._id}
            reply={reply}
            theme={theme}
            handleReplyDeleteClick={handleReplyDeleteClick}
            replyInViewId={replyInViewId}
          />
        ))}
      </div>
    </>
  );
};

export default DiscussionReplyContainer;
