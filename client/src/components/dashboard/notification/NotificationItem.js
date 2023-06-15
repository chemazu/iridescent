import React, { useState } from "react";
import {
  NavItem,
  NavLink,
  Nav,
  PopoverBody,
  UncontrolledPopover,
  Modal,
  Button,
} from "reactstrap";
import moment from "moment";
import NotificationCommentDisplayModal from "./NotificationCommentDisplayModal";

const NotificationItem = ({
  notification,
  handleNotificationUpdate,
  handleRemoveNotification,
  handleDeleteAllNotifications,
}) => {
  const [notificationCommentUnits, setNotificationCommentUnit] =
    useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState(false);

  // const search = useLocation().search;
  // const params = new URLSearchParams(search);
  // const courseUnitId = params.get("cuid");
  // const commentId = params.get("cmid");
  // const courseChapter = params.get("ccpt");
  // const replyId = params.get("rplid");

  const handleDeleteClick = (e) => {
    e.preventDefault();
    setDeleteConfirmation(true);
  };

  const handleMarkAsSeenClick = (e) => {
    e.preventDefault();
    handleNotificationUpdate(notification._id);
  };

  const handleNotificationItemClick = () => {
    if (notification.type.includes("comment")) {
      setNotificationCommentUnit(true);
    } else if (notification.type.includes("reply")) {
      setNotificationCommentUnit(true);
    }
  };

  return (
    <>
      <div className="notification-item">
        <div className="notification-item__info">
          <div className="notification-item__icon">
            {notification.title.substring(0, 1).toLocaleUpperCase()}
          </div>
        </div>
        <div className="notification-item__actions-details">
          <div
            onClick={handleNotificationItemClick}
            className="notification-item__info-details"
          >
            <div className="notification-item__name">
              {notification.title} <span>{notification.type}</span>
            </div>
            <div className="notification-message">{notification.message}</div>
            <div className="notification-item__timestamp">
              {moment(notification.date).fromNow()}
            </div>
          </div>

          <div className="notification-item__controls">
            <div className="notification-menu-control">
              <div
                id={`notification-item-tooltip-${notification._id}`}
                className="icon-container-ellipsis"
              >
                <i className="fas fa-ellipsis-h"></i>
              </div>
              <div className="notification-item-tooltip">
                <UncontrolledPopover
                  trigger="legacy"
                  placement="bottom"
                  target={`notification-item-tooltip-${notification._id}`}
                >
                  <PopoverBody>
                    <Nav vertical>
                      <NavItem onClick={(e) => handleMarkAsSeenClick(e)}>
                        <NavLink className="link-text" href="#">
                          <i className="fas fa-check"></i>{" "}
                          <span className="navlink-text">Mark as read</span>
                        </NavLink>
                      </NavItem>
                      <NavItem onClick={(e) => handleDeleteClick(e)}>
                        <NavLink className="link-text" href="*">
                          <i class="far fa-times-circle"></i>
                          <span className="navlink-text">
                            Delete Notification
                          </span>
                        </NavLink>
                      </NavItem>
                      <NavItem onClick={(e) => handleDeleteAllNotifications(e)}>
                        <NavLink className="link-text" href="*">
                          <i className="fas fa-exclamation"></i>
                          <span className="navlink-text">
                            Clear All Notifications
                          </span>
                        </NavLink>
                      </NavItem>
                    </Nav>
                  </PopoverBody>
                </UncontrolledPopover>
              </div>
            </div>
            <div
              style={{
                visibility:
                  notification.isSeen === false ? "visible" : "hidden",
              }}
              className="notification-indicator"
            ></div>
          </div>
        </div>
      </div>
      {/* modal to comfirm notification delete  */}
      <Modal isOpen={deleteConfirmation} centered>
        <div className="modal-header notification-modal-header">
          <h3>Delete Notification</h3>
        </div>
        <div className="modal-body">
          <p className="text-center">
            Are You Sure You want to delete this Notification ?
          </p>
        </div>
        <div className="modal-footer">
          <Button
            style={{
              paddingLeft: "40px",
              paddingRight: "40px",
            }}
            className="modal-btn-style-outline"
            onClick={() => setDeleteConfirmation(false)}
          >
            Cancel
          </Button>
          <Button
            style={{
              paddingLeft: "40px",
              paddingRight: "40px",
            }}
            className="modal-btn-style"
            onClick={(e) => handleRemoveNotification(notification._id)}
          >
            Delete
          </Button>
        </div>
      </Modal>
      {(notification.type.includes("comment") ||
        notification.type.includes("reply")) &&
        notificationCommentUnits === true && ( // condition ensures that code to query comments only runs when modal is open
          <>
            <NotificationCommentDisplayModal
              notificationCommentUnits={notificationCommentUnits}
              courseUnitId={notification.courseunitid}
              commentId={notification.commentid}
              replyId={notification.replyid}
              courseChapter={notification.coursechapterid}
              setNotificationCommentUnit={setNotificationCommentUnit}
            />
          </>
        )}
    </>
  );
};

export default NotificationItem;
