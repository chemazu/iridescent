import React, { useState, useEffect } from "react";
import { connect, useDispatch } from "react-redux";
import {
  Row,
  Col,
  Modal,
  Container,
  NavItem,
  Button,
  NavLink,
  Nav,
  PopoverBody,
  Label,
  FormGroup,
  Input,
  UncontrolledPopover,
} from "reactstrap";
import InfiniteScroll from "react-infinite-scroll-component";
import { useAlert } from "react-alert";
import axios from "axios";
import setAuthToken from "../../../utilities/setAuthToken";
import {
  UPDATE_DASHBOARD_PAGE_COUNTER,
  RESET_NOTIFICATION_UPDATE_DATA,
} from "../../../actions/types";
import DashboardNavbar from "../DashboardNavbar";
import NotificationNavbar from "../NotificationNavbar";
import NotificationItem from "./NotificationItem";
import { startLoading, stopLoading } from "../../../actions/appLoading";

import "../../../custom-styles/dashboard/dashboardlayout.css";
import "../../../custom-styles/dashboard/notification.css";

export const Notification = ({ updatePageSelector }) => {
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsPaginate, setNotificationsPaginate] = useState(2);
  const [totalNotifications, setTotalNotifications] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const [deleteAllConfirmation, setDeleteAllConfirmation] = useState(false);

  const [iconTabsSelect, updateIconTabsSelect] = useState({
    iconTabs: 1,
    plainTabs: 1,
    selectedTabText: "all",
  });

  const dispatch = useDispatch();

  const alert = useAlert();

  const getNotificationsOnPageLoad = async () => {
    if (localStorage.getItem("token")) {
      setAuthToken(localStorage.getItem("token"));
    }
    try {
      const res = await axios.get(
        `/api/v1/notification?size=10&page=1&filterString=${iconTabsSelect.selectedTabText.toLowerCase()}`
      );
      setNotifications(res.data.notifications);
      setTotalNotifications(res.data.count);
      setNotificationsLoading(false);
    } catch (error) {
      console.log(error);
      alert.show(error.message, {
        type: "error",
      });
    }
  };

  const getUserNotifications = async () => {
    if (localStorage.getItem("token")) {
      setAuthToken(localStorage.getItem("token"));
    }
    try {
      const res = await axios.get(
        `/api/v1/notification?size=10&page=${notificationsPaginate}&filterString=${iconTabsSelect.selectedTabText.toLowerCase()}`
      );
      setNotifications([...notifications, ...res.data.notifications]);
      setTotalNotifications(res.data.count);
      setNotificationsLoading(false);
    } catch (error) {
      console.log(error);
      alert.show(error.message, {
        type: "error",
      });
    }
  };

  const fetchData = async () => {
    getUserNotifications();

    if (notifications.length === totalNotifications) {
      setHasMore(false);
    }

    setNotificationsPaginate(notificationsPaginate + 1);
  };

  const markAllNotificationsAsSeen = async () => {
    if (localStorage.getItem("token")) {
      setAuthToken(localStorage.getItem("token"));
    }
    dispatch(startLoading());
    try {
      const res = await axios.put("/api/v1/notification");
      const notifications = res.data;
      setNotifications(notifications);
      alert.show("update completed successfully", {
        type: "success",
      });
      dispatch(stopLoading());
      setNotificationsLoading(false);
    } catch (error) {
      console.log(error);
      dispatch(stopLoading());
      alert.show(error.message, {
        type: "error",
      });
    }
  };

  const markOneNotificationAsSeen = async (notificationId) => {
    if (localStorage.getItem("token")) {
      setAuthToken(localStorage.getItem("token"));
    }
    dispatch(startLoading());
    try {
      const res = await axios.put(`/api/v1/notification/${notificationId}`);
      const notificationsWithUpdates = notifications.map((notificationItem) => {
        if (res.data._id === notificationItem._id) {
          return {
            ...notificationItem,
            ...res.data,
          };
        } else {
          return notificationItem;
        }
      });
      setNotifications(notificationsWithUpdates);
      alert.show("update completed successfully", {
        type: "success",
      });
      dispatch(stopLoading());
    } catch (error) {
      console.log(error);
      dispatch(stopLoading());
      alert.show(error.message, {
        type: "error",
      });
    }
  };

  const deleteNotificationById = async (notificationId) => {
    if (localStorage.getItem("token")) {
      setAuthToken(localStorage.getItem("token"));
    }
    dispatch(startLoading());
    try {
      const res = await axios.delete(`/api/v1/notification/${notificationId}`);
      const notificationsAfterDelete = notifications.filter(
        (notificationItem) => {
          return notificationItem._id !== res.data._id;
        }
      );
      setNotifications(notificationsAfterDelete);
      alert.show("delete completed successfully", {
        type: "success",
      });
      dispatch(stopLoading());
    } catch (error) {
      console.log(error);
      dispatch(stopLoading());
      alert.show(error.message, {
        type: "error",
      });
    }
  };

  const deleteAllNotifications = async () => {
    if (localStorage.getItem("token")) {
      setAuthToken(localStorage.getItem("token"));
    }
    dispatch(startLoading());
    try {
      await axios.delete("/api/v1/notification");
      setNotifications([]);
      alert.show("delete completed successfully", {
        type: "success",
      });
      dispatch(stopLoading());
      setDeleteAllConfirmation(false);
      setNotificationsLoading(false);
    } catch (error) {
      console.log(error);
      dispatch(stopLoading());
      alert.show(error.message, {
        type: "error",
      });
    }
  };

  const getNotificationUpdateData = async () => {
    if (localStorage.getItem("token")) {
      setAuthToken(localStorage.getItem("token"));
    }
    try {
      const res = await axios.put("/api/v1/notificationupdate");
      dispatch({
        type: RESET_NOTIFICATION_UPDATE_DATA,
        payload: res.data,
      });
    } catch (error) {
      alert.show(error.message, {
        type: "error",
      });
    }
  };

  const handleMarkAllAsRead = (e) => {
    e.preventDefault();
    markAllNotificationsAsSeen();
  };

  const handleDeleteAllNotifications = (e) => {
    e.preventDefault();
    setDeleteAllConfirmation(true);
  };

  const handleNotificationUpdate = (notificationId) =>
    markOneNotificationAsSeen(notificationId);

  const handleRemoveNotification = (notificationId) =>
    deleteNotificationById(notificationId);

  const toggleNavs = (e, name, value, selectedTabText) => {
    e.preventDefault();
    setNotificationsLoading(true);
    updateIconTabsSelect({
      ...iconTabsSelect,
      [name]: value,
      selectedTabText: selectedTabText,
    });
  };

  const handleNotificationFilterDropdownChange = (e) => {
    if (e.target.value.includes("all")) {
      toggleNavs(e, "iconTabs", 1, "all");
    } else if (e.target.value.includes("comment")) {
      toggleNavs(e, "iconTabs", 2, "comments");
    } else if (e.target.value.includes("reply")) {
      toggleNavs(e, "iconTabs", 3, "reply");
    } else if (e.target.value.includes("enroll")) {
      toggleNavs(e, "iconTabs", 4, "enroll");
    }
  };

  useEffect(() => {
    getNotificationsOnPageLoad();
    // eslint-disable-next-line
  }, [iconTabsSelect]);

  useEffect(() => {
    updatePageSelector(7);
    getNotificationsOnPageLoad();
    getNotificationUpdateData();
    // eslint-disable-next-line
  }, []);

  return (
    <>
      <div className="dashboard-layout">
        <Container fluid>
          <Row>
            <DashboardNavbar />
            <Col id="scrollableDiv" className="page-actions__col">
              <div className="page-actions">
                <NotificationNavbar />
                <div className="notification__contents">
                  <div className="notification-page__contents">
                    <h3 className="header-intro__text">Notifications</h3>
                    <div className="notification-header mt-3 mb-4">
                      <div className="notification-header__filter">
                        <div className="notification-header__nav-tab">
                          <Nav
                            className="nav-fill flex-column flex-md-row"
                            id="tabs-icons-text"
                            pills
                            role="tablist"
                          >
                            <NavItem>
                              <NavLink
                                aria-selected={iconTabsSelect.iconTabs === 1}
                                className={`mb-sm-3 mb-md-0 ${
                                  iconTabsSelect.iconTabs === 1 && "active"
                                }`}
                                onClick={(e) =>
                                  toggleNavs(e, "iconTabs", 1, "all")
                                }
                                role="tab"
                              >
                                All
                              </NavLink>
                            </NavItem>
                            <NavItem>
                              <NavLink
                                aria-selected={iconTabsSelect.iconTabs === 2}
                                className={`mb-sm-3 mb-md-0 ${
                                  iconTabsSelect.iconTabs === 2 && "active"
                                }`}
                                onClick={(e) =>
                                  toggleNavs(e, "iconTabs", 2, "comments")
                                }
                                role="tab"
                              >
                                Comments
                              </NavLink>
                            </NavItem>
                            <NavItem>
                              <NavLink
                                aria-selected={iconTabsSelect.iconTabs === 3}
                                className={`mb-sm-3 mb-md-0 ${
                                  iconTabsSelect.iconTabs === 3 && "active"
                                }`}
                                onClick={(e) =>
                                  toggleNavs(e, "iconTabs", 3, "reply")
                                }
                                role="tab"
                              >
                                Replies
                              </NavLink>
                            </NavItem>
                            <NavItem>
                              <NavLink
                                aria-selected={iconTabsSelect.iconTabs === 4}
                                className={`mb-sm-3 mb-md-0 ${
                                  iconTabsSelect.iconTabs === 4 && "active"
                                }`}
                                onClick={(e) =>
                                  toggleNavs(e, "iconTabs", 4, "enroll")
                                }
                                role="tab"
                              >
                                Enrollments
                              </NavLink>
                            </NavItem>
                          </Nav>
                        </div>
                        <div className="mobile-view-notification__filter">
                          <FormGroup>
                            <Label for="exampleSelect">
                              Filter Notifications.
                            </Label>
                            <Input
                              onChange={handleNotificationFilterDropdownChange}
                              type="select"
                              name="select"
                              id="exampleSelect"
                            >
                              <option value="all">All</option>
                              <option value="comment">Comments</option>
                              <option value="reply">Replies</option>
                              <option value="enroll">Enrollments</option>
                            </Input>
                          </FormGroup>
                        </div>
                      </div>
                      <div
                        id="notification-tooltipbutton"
                        className="header-controls"
                      >
                        <i className="fas fa-ellipsis-h"></i>
                        <div className="notification-menu">
                          <UncontrolledPopover
                            placement="left"
                            trigger="legacy"
                            target="notification-tooltipbutton"
                          >
                            <PopoverBody>
                              <Nav vertical>
                                <NavItem
                                  onClick={(e) => handleMarkAllAsRead(e)}
                                >
                                  <NavLink className="link-text" href="#">
                                    <span className="navlink-text">
                                      Mark All As read
                                    </span>
                                  </NavLink>
                                </NavItem>
                                <NavItem>
                                  <NavLink className="link-text" href="*">
                                    <span className="navlink-text">
                                      Notification Settings
                                    </span>
                                  </NavLink>
                                </NavItem>
                                <NavItem
                                  onClick={(e) =>
                                    handleDeleteAllNotifications(e)
                                  }
                                >
                                  <NavLink className="link-text" href="*">
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
                    </div>
                    {notificationsLoading ? (
                      <p className="text-center">Loading...</p>
                    ) : (
                      <>
                        {notifications.length === 0 ? (
                          <p className="text-center mt-5">
                            Notifications not found
                          </p>
                        ) : (
                          <>
                            <div className="notification-body">
                              <InfiniteScroll
                                dataLength={notifications.length}
                                next={fetchData}
                                hasMore={hasMore}
                                loader={
                                  <p className="text-center">loading...</p>
                                }
                                endMessage={
                                  <p className="text-center">
                                    No More Notifications...
                                  </p>
                                }
                                scrollableTarget="scrollableDiv"
                              >
                                {notifications.map((notification) => (
                                  <NotificationItem
                                    key={notification._id}
                                    notification={notification}
                                    handleNotificationUpdate={
                                      handleNotificationUpdate
                                    }
                                    handleRemoveNotification={
                                      handleRemoveNotification
                                    }
                                    handleDeleteAllNotifications={
                                      handleDeleteAllNotifications
                                    }
                                  />
                                ))}
                              </InfiniteScroll>
                            </div>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
      {/* delete all notification modal prompt */}
      <Modal isOpen={deleteAllConfirmation} centered>
        <div className="modal-header notification-modal-header">
          <h3>Delete All Notification</h3>
        </div>
        <div className="modal-body">
          <p className="text-center">
            Are You Sure You want to delete all Notification ?
          </p>
        </div>
        <div className="modal-footer">
          <Button
            style={{
              paddingLeft: "40px",
              paddingRight: "40px",
            }}
            className="modal-btn-style-outline"
            onClick={() => setDeleteAllConfirmation(false)}
          >
            Cancel
          </Button>
          <Button
            style={{
              paddingLeft: "40px",
              paddingRight: "40px",
            }}
            className="modal-btn-style"
            onClick={deleteAllNotifications}
          >
            Delete All
          </Button>
        </div>
      </Modal>
    </>
  );
};

const mapDispatchToProps = (dispatch) => ({
  updatePageSelector: (counter) =>
    dispatch({ type: UPDATE_DASHBOARD_PAGE_COUNTER, payload: counter }),
});

export default connect(null, mapDispatchToProps)(Notification);
