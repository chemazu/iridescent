import React, { useState } from "react";
import { connect } from "react-redux";
import { Popover, PopoverBody } from "reactstrap";
import moment from "moment";

import "../../custom-styles/pages/components/discussionreplyitem.css";

const DiscussionReplyItem = ({
  reply,
  theme,
  student,
  replyInViewId,
  handleReplyDeleteClick,
}) => {
  const [popoverOpen, setPopOverOpen] = useState(false);

  const togglePopover = () => setPopOverOpen(!popoverOpen);

  return (
    <>
      <div className="student-dashboard-reply-item mb-4">
        <div className="student-dashboard-reply-user-avatar">
          <img
            className="img-fluid"
            src={reply.replyavatar}
            alt="user avatar display"
          />
        </div>
        <div className="student-dashboard-reply-item__details">
          <div className="student-dashboard-reply-name-control">
            <div
              style={{
                color: theme.themestyles.primarytextcolor,
              }}
              className="student-dashboard-reply-name-and-timestamp"
            >
              <p>
                {reply.username}{" "}
                <span
                  style={{
                    color: theme.themestyles.primarytextcolor,
                  }}
                  className="ml-3"
                >
                  {moment(reply.date).fromNow()}
                </span>
                {replyInViewId !== null && replyInViewId === reply._id && (
                  <span
                    style={{
                      backgroundColor: theme.themestyles.primarytextcolor,
                      color: theme.themestyles.primarybackgroundcolor,
                    }}
                    className="ml-3 student-comment-info__tag"
                  >
                    Reply In View
                  </span>
                )}
              </p>
            </div>
            {reply.replyby === student._id && (
              <div
                style={{
                  color: theme.themestyles.primarytextcolor,
                }}
                id={`comment-item-tooltip-${reply._id}`}
                className="student-dashboard-reply-menu"
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
                  <PopoverBody
                    style={{
                      backgroundColor: theme.themestyles.buttonbackgroundcolor,
                      color: theme.themestyles.buttontextcolor,
                    }}
                  >
                    <div
                      onClick={() => handleReplyDeleteClick(reply._id)}
                      className="comment-delete__menu-item"
                    >
                      Delete
                    </div>
                  </PopoverBody>
                </Popover>
              </div>
            )}
          </div>
          <div
            style={{
              color: theme.themestyles.primarytextcolor,
            }}
            className="student-dashboard-reply-text"
          >
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

export default connect(mapStateToProps)(DiscussionReplyItem);
