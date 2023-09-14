import React, { useState, useEffect } from "react";
import ReplyItem from "./ReplyItem";

const RepliesContainer = ({ replies, replyInView }) => {
  const [loadedReplies, setLoadedReplies] = useState([]);

  useEffect(() => {
    setLoadedReplies(replies);
    // eslint-disable-next-line
  }, [replies]);

  return (
    <>
      <div className="reply-container">
        {loadedReplies.map((reply) => (
          <ReplyItem key={reply._id} reply={reply} replyInView={replyInView} />
        ))}
      </div>
    </>
  );
};

export default RepliesContainer;
