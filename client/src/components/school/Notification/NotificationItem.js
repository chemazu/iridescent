import React, { useState } from "react";
import moment from "moment";
import StudentNotificationDisplayModal from "./StudentNotificationDisplayModal";

const NotificationItem = ({ theme, notification }) => {
  const [displayNotificationComments, setDisplayNotificationComments] =
    useState(false);

  const handleNotificationItemClick = () => {
    if (
      notification.type.includes("comment") ||
      notification.type.includes("reply")
    ) {
      setDisplayNotificationComments(true);
    }
  };

  return (
    <>
      <div className="student-notification__item">
        <div className="student-notification-item__info">
          <div
            style={{
              backgroundColor: theme.themestyles.navbarbackgroundcolor,
              color: theme.themestyles.navbartextcolor,
            }}
            className="student-notification-item__icon"
          >
            {notification.title.substring(0, 1).toLocaleUpperCase()}
          </div>
        </div>
        <div
          style={{
            borderBottom: `0.000623rem solid ${theme.themestyles.primarytextcolor}`,
          }}
          className="student-notification-item__actions-details"
        >
          <div
            onClick={handleNotificationItemClick}
            className="student-notification-item__info-details"
          >
            <div
              style={{
                color: theme.themestyles.primarytextcolor,
              }}
              className="student-notification-item__name"
            >
              {notification.title} <span>{notification.type}</span>
            </div>
            <div
              style={{
                color: theme.themestyles.primarytextcolor,
              }}
              className="student-notification-message"
            >
              {notification.message}
            </div>
            <div
              style={{
                color: theme.themestyles.primarytextcolor,
              }}
              className="student-notification-item__timestamp"
            >
              {moment(notification.date).fromNow()}
            </div>
          </div>

          <div className="student-notification-item__controls">
            <div className="student-notification-menu-control">
              {/* <div
              // id={`notification-item-tooltip-${notification._id}`}
              className="icon-container-ellipsis"
            >
              <i className="fas fa-ellipsis-h"></i>
            </div> */}
            </div>
          </div>
        </div>
      </div>
      {(notification.type.includes("comment") ||
        notification.type.includes("reply")) &&
        displayNotificationComments === true && (
          <>
            <StudentNotificationDisplayModal
              displayNotificationComments={displayNotificationComments}
              courseUnitId={notification.courseunitid}
              commentId={notification.commentid}
              replyId={notification.replyid}
              courseChapter={notification.coursechapterid}
              setNotificationDisplay={setDisplayNotificationComments}
              theme={theme}
            />
          </>
        )}
    </>
  );
};

export default NotificationItem;
