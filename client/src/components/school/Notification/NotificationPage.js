import React, { useState, useEffect } from "react";
import axios from "axios";
import { useStore, useDispatch } from "react-redux";
import { Container } from "reactstrap";
import PageNavbar from "../PageNavbar";
import { useAlert } from "react-alert";
import { studentAuth } from "../../../actions/student";
import InfiniteScroll from "react-infinite-scroll-component";
import { RESET_STUDENT_NOTIFICATION_DATA } from "../../../actions/types";
import NotificationItem from "./NotificationItem";

import setDocumentTitle from "../../../utilities/setDocumentTitle";

import "../../../custom-styles/pages/components/notificationpage.css";
import setAuthToken from "../../../utilities/setAuthToken";

const StudentNotificationPage = () => {
  const [school, setSchool] = useState(null);
  const [theme, setTheme] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const dispatch = useDispatch();

  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsPagenate, setNotificationsPaginate] = useState(2);
  const [totalNotifications, setTotalNotifications] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const alert = useAlert();
  const store = useStore();
  const state = store.getState();
  const schoolname = state.subdomain;

  const getSchoolBySchoolName = async (schoolname) => {
    try {
      const res = await axios.get(`/api/v1/school/${schoolname}`);
      setSchool(res.data);
      return res.data;
    } catch (error) {
      if (error.response.status === 404) {
        setSchool(null);
        setPageLoading(false);
      }
      console.log(error.response.data.errors[0].msg);
      return null;
    }
  };

  const getSchoolThemeBySchoolId = async (schoolId) => {
    try {
      const res = await axios.get(`/api/v1/theme/${schoolId}`);
      setTheme(res.data);
    } catch (error) {
      if (error.response.status === 404) {
        setTheme(null);
        setPageLoading(false);
      }
      console.log(error.response.data.errors[0].msg);
      return null;
    }
  };

  const getSchoolLandingPageContents = async (schoolName) => {
    setPageLoading(true);
    const school = await getSchoolBySchoolName(schoolName);
    if (school) {
      await getSchoolThemeBySchoolId(school._id);
    }
    setPageLoading(false);
  };

  const getSchoolNotificationsOnPageLoad = async () => {
    if (localStorage.getItem("studentToken")) {
      setAuthToken(localStorage.getItem("studentToken"));
    }
    try {
      const res = await axios.get(
        "/api/v1/student/notification?size=10&page=1"
      );
      setNotifications(res.data.studentNotifications);
      setTotalNotifications(res.data.docsCount);
      if (res.data.studentNotifications === res.data.docsCount) {
        setHasMore(false);
      }
      setNotificationsLoading(false);
    } catch (error) {
      setNotificationsLoading(false);
      alert.show(error.message, {
        type: "error",
      });
    }
  };

  const getStudentNotifications = async () => {
    if (localStorage.getItem("studentToken")) {
      setAuthToken(localStorage.getItem("studentToken"));
    }
    try {
      const res = await axios.get(
        `/api/v1/student/notification?size=10&page=${notificationsPagenate}`
      );
      setNotifications([...notifications, ...res.data.studentNotifications]);
      setTotalNotifications(res.data.docsCount);
      setNotificationsLoading(false);
    } catch (error) {
      setNotificationsLoading(false);
      console.log(error);
      alert.show(error.message, {
        type: "error",
      });
    }
  };

  const getStudentNotificationUpdate = async () => {
    if (localStorage.getItem("studentToken")) {
      setAuthToken(localStorage.getItem("studentToken"));
    }
    try {
      const res = await axios.put("/api/v1/student/notificationupdate");
      dispatch({
        type: RESET_STUDENT_NOTIFICATION_DATA,
        payload: res.data,
      });
    } catch (error) {
      alert.show(error.message, {
        type: "error",
      });
    }
  };

  const fetchData = async () => {
    await getStudentNotifications();

    if (notifications.length === totalNotifications) {
      setHasMore(false);
    }

    setNotificationsPaginate(notificationsPagenate + 1);
  };

  useEffect(() => {
    if (schoolname.length > 0) {
      getSchoolLandingPageContents(schoolname);
      dispatch(studentAuth());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schoolname]);

  useEffect(() => {
    if (school) setDocumentTitle(school);
  }, [school]);

  useEffect(() => {
    getSchoolNotificationsOnPageLoad();
    getStudentNotificationUpdate();
    // eslint-disable-next-line
  }, []);

  return (
    <>
      {pageLoading === true ? (
        <div
          style={{
            width: "50%",
            margin: "20px auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <i
            style={{ fontSize: "22px" }}
            className="fas fa-circle-notch fa-spin"
          ></i>
        </div>
      ) : (
        <>
          {!pageLoading && school === null && theme === null ? (
            <p className="text-center lead">School Not Found</p>
          ) : (
            <>
              <PageNavbar theme={theme} pageName={schoolname} />
              <div
                style={{
                  backgroundColor:
                    theme.themestyles.secondarypagebackgroundcolor,
                }}
                className="studentdashboard-page-contents"
              >
                <br />
                <br />
                <Container className="student-notification__container">
                  <div className="subdomain-notification-page__contents">
                    <div className="subdomain-notification__header">
                      <h3
                        style={{
                          color: theme.themestyles.primarytextcolor,
                        }}
                      >
                        Notification
                      </h3>
                      <div
                        style={{
                          color: theme.themestyles.primarytextcolor,
                        }}
                        className="notification-ellipsis__container"
                      >
                        <i className="fas fa-ellipsis-h"></i>
                      </div>
                    </div>
                    {notificationsLoading ? (
                      <p
                        style={{
                          color: theme.themestyles.primarytextcolor,
                        }}
                        className="text-center mt-2 mb-2"
                      >
                        Loading...
                      </p>
                    ) : (
                      <>
                        <div className="student-notification__body">
                          <InfiniteScroll
                            dataLength={notifications.length}
                            next={fetchData}
                            hasMore={hasMore}
                            id="scrollableDiv"
                            loader={
                              <p
                                style={{
                                  color: theme.themestyles.primarytextcolor,
                                }}
                                className="text-center"
                              >
                                Loading...
                              </p>
                            }
                            endMessage={
                              <p
                                style={{
                                  color: theme.themestyles.primarytextcolor,
                                  marginTop: "5rem",
                                }}
                                className="text-center"
                              >
                                Notifications not Found.
                              </p>
                            }
                            scrollableTarget="scrollableDiv"
                          >
                            {notifications.map((notification) => (
                              <NotificationItem
                                theme={theme}
                                key={notification._id}
                                notification={notification}
                              />
                            ))}
                          </InfiniteScroll>
                        </div>
                      </>
                    )}
                  </div>
                </Container>
              </div>
            </>
          )}
        </>
      )}
    </>
  );
};

export default StudentNotificationPage;
