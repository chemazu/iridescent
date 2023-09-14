import React, { useState } from "react";
import { connect } from "react-redux";
import { Popover, PopoverBody } from "reactstrap";
import moment from "moment";

const TutorDiscussionReplyItem = ({
  reply,
  student,
  replyInViewId,
  handleReplyDeleteClick,
}) => {
  const [popoverOpen, setPopOverOpen] = useState(false);

  const togglePopover = () => setPopOverOpen(!popoverOpen);

  return (
    <>
      <div className="tutor-dashboard-reply-item mb-4">
        <div className="tutor-dashboard-reply-user-avatar">
          <img
            className="img-fluid"
            src={reply.replyavatar}
            alt="user avatar display"
          />
        </div>
        <div className="tutor-dashboard-reply-item__details">
          <div className="tutor-dashboard-reply-name-control">
            <div className="tutor-dashboard-reply-name-and-timestamp">
              <p className="tutor-username">
                {reply.username}{" "}
                <span className="tutor-timestamp ml-3">
                  {moment(reply.date).fromNow()}
                </span>
                {replyInViewId !== null && replyInViewId === reply._id && (
                  <span className="ml-3 tutor-comment-info__tag">
                    Reply In View
                  </span>
                )}
              </p>
            </div>
            {reply.replyby === student._id && (
              <div
                id={`comment-item-tooltip-${reply._id}`}
                className="tutor-dashboard-reply-menu"
              >
                <i className="fas fa-ellipsis-v"></i>
                <Popover
                  trigger="legacy"
                  placement="bottom"
                  isOpen={popoverOpen}
                  hideArrow={true}
                  target={`comment-item-tooltip-${reply._id}`}
                  toggle={togglePopover}
                >
                  <PopoverBody className="tutor-popover-body__styles">
                    <div
                      onClick={() => handleReplyDeleteClick(reply._id)}
                      className="tutor-comment-delete__menu-item"
                    >
                      Delete
                    </div>
                  </PopoverBody>
                </Popover>
              </div>
            )}
          </div>
          <div className="tutor-dashboard-reply-text">
            <p className="mb-1 mt-1">{reply.text}</p>
          </div>
        </div>
      </div>
    </>
  );
};

const mapStateToProps = (state) => ({
  student: state.student.studentDetails,
});

export default connect(mapStateToProps)(TutorDiscussionReplyItem);
