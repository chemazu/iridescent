import React, { useEffect, useState, useRef } from "react";
import { connect, useDispatch } from "react-redux";
import { Link, withRouter } from "react-router-dom";
import axios from "axios";
import {
  Col,
  Nav,
  NavItem,
  NavLink,
  PopoverBody,
  UncontrolledPopover,
  Collapse,
} from "reactstrap";
import { useAlert } from "react-alert";
import classnames from "classnames";
import Cookies from "js-cookie";
import {
  UPDATE_DASHBOARD_PAGE_COUNTER,
  UPDATE_DASHBOARD_PAGE_COUNTER_TO_DEFAULT,
  LOAD_USER,
} from "../../actions/types";
import { loadUser, logout } from "../../actions/auth";
import { startLoading, stopLoading } from "../../actions/appLoading";
import { getDefaultSchool } from "../../actions/school";
import DashboardLoadingSkeleton from "./DashboardLoadingSkeleton";
import setAuthToken from "../../utilities/setAuthToken";

import Logo from "../../images/tuturlySvgLogo.svg";

import "../../custom-styles/dashboard/dashboardlayout.css";

const DashboardNavbar = ({
  logUserOut,
  school,
  getSchool,
  getLoggedInUser,
  user,
  currentPage,
  updatePageCounter,
  updatePageCounterToDefault,
}) => {
  const [isCollapseOpen, setIsCollapseOpen] = useState(false);
  const toggleNavbarCollapse = () => setIsCollapseOpen(!isCollapseOpen);
  const alert = useAlert();
  const dispatch = useDispatch();

  const handleLogout = (e) => {
    e.preventDefault();
    deleteTokenCookie();
    logUserOut();
    updatePageCounterToDefault();
  };

  const updatePage = (index) => {
    updatePageCounter(index);
  };

  const avatarUploadRef = useRef();

  const getSchoolUrl = (schoolname) => {
    const host = window.location.host;
    if (host.includes("localhost")) {
      return `http://${schoolname}.${host}`;
    }
    const baseDomain = host.split(".")[1];
    return baseDomain.includes("localhost")
      ? `http://${schoolname}.${baseDomain}`
      : `https://${schoolname}.${baseDomain}.com`;
  };

  const setTokenAsCookie = (tokenData) => {
    const host = window.location.host;
    const baseDomain = host.includes("localhost")
      ? ".localhost:3000"
      : `.${host.split(".")[1]}.com`;
    Cookies.set("adminCookie", tokenData, {
      expires: 4,
      secure: false,
      domain: baseDomain,
    });
  };

  const deleteTokenCookie = () => {
    const host = window.location.host;
    const baseDomain = host.includes("localhost")
      ? ".localhost:3000"
      : `.${host.split(".")[1]}.com`;
    Cookies.remove("adminCookie", {
      expires: 4,
      secure: false,
      domain: baseDomain,
    });
  };

  const handleOpenEditPage = (e) => {
    e.preventDefault();
    updatePage(2);
    // save use cookie here.
    setTokenAsCookie(localStorage.getItem("token"));
    // open link in new tab
    window.open(getSchoolUrl(school.schoolDetails.name), "_blank");
  };

  const avatarUploadBtnHandler = () => avatarUploadRef.current.click();

  const handleAvatarUpdateHandler = async (e) => {
    if (e.target.files.length === 0) {
      return alert.show("image file not selected!", {
        type: "error",
      });
    }

    const fileSize = e?.target?.files[0]?.size / 1024 / 1024; // file size in mb
    if (fileSize > 30) {
      return alert.show(
        "File Size exceeds maximum limit, choose another file",
        {
          type: "error",
        }
      );
    }

    if (!e.target.files[0].type.includes("image")) {
      return alert.show("file type must be an image", {
        type: "error",
      });
    }

    const formData = new FormData();
    formData.append("avatar", e.target.files[0]);

    dispatch(startLoading());
    try {
      if (localStorage.getItem("token")) {
        setAuthToken(localStorage.getItem("token"));
      }
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      };
      const body = formData;
      const res = await axios.put(`/api/v1/user/avatar/upload`, body, config);
      dispatch({
        type: LOAD_USER,
        payload: res.data,
      }); // some action here
      alert.show("user avatar updated successfully", {
        type: "success",
      });
      dispatch(stopLoading());
    } catch (error) {
      dispatch(stopLoading());
      const errors = error.response.data.errors;
      if (errors) {
        errors.forEach((element) => {
          alert.show(element.msg, {
            type: "error",
          });
        });
      }
    }
  };

  useEffect(() => {
    getSchool();
    getLoggedInUser();
  }, [getSchool, getLoggedInUser]);

  return (
    <>
      <>
        {school.loading !== true &&
        school.schoolDetails !== null &&
        user !== null ? (
          <>
            <Col className="vertical-navbar__col" sm="2" md="2" xs="2" xl="2">
              <div className="vertical-navbar">
                <div className="tutorly-logo">
                  <img
                    alt="tuturly logo"
                    src={Logo}
                    //   className="img-fluid"
                  />
                </div>
                <div className="logged-in-user__info">
                  <div
                    onClick={avatarUploadBtnHandler}
                    className="avatar-upload__btn"
                  >
                    update avatar
                  </div>
                  <div className="logged-in-user__image">
                    <img
                      src={user.avatar}
                      alt="user avatar"
                      className="img-fluid"
                    />
                  </div>
                  <input
                    onChange={handleAvatarUpdateHandler}
                    ref={avatarUploadRef}
                    style={{
                      display: "none",
                    }}
                    type="file"
                  />
                </div>
                <p className="logged-in-user__school-name d-none-sm">
                  {school.schoolDetails.name}
                </p>
                {/* <p className="logged-in-user__email d-none-sm">{user.email}</p> */}
                <div className="action-links mt-4">
                  <Nav vertical>
                    <NavItem
                      className={classnames("navbar-item-link", {
                        selected: currentPage.counter === 1,
                      })}
                    >
                      <NavLink
                        onClick={(e) => updatePage(1)}
                        tag={Link}
                        to="/dashboard/index"
                      >
                        <i className="fas fa-home"></i>{" "}
                        <span className="navlink-text d-none-sm">
                          Dashboard
                        </span>
                      </NavLink>
                    </NavItem>
                    <NavItem
                      className={classnames("navbar-item-link", {
                        selected: currentPage.counter === 2,
                      })}
                    >
                      <NavLink
                        className="collapse-opener-link-item"
                        onClick={toggleNavbarCollapse}
                      >
                        <span>
                          <i className="fas fa-edit"></i>{" "}
                          <span className="navlink-text d-none-sm">
                            Customize space
                          </span>
                        </span>
                        <span className="d-none-sm">
                          {isCollapseOpen ? (
                            <i className="fas fa-caret-up"></i>
                          ) : (
                            <i className="fas fa-caret-down"></i>
                          )}
                        </span>
                      </NavLink>
                      <Collapse isOpen={isCollapseOpen}>
                        <NavItem className="navbar-item-link collapse-links">
                          <NavLink
                            onClick={(e) => updatePage(2)}
                            tag={Link}
                            to="/dashboard/customize"
                          >
                            <i className="fas fa-hand-pointer"></i>{" "}
                            <span className="navlink-text d-none-sm">
                              Choose Site Theme
                            </span>
                          </NavLink>
                        </NavItem>
                        <NavItem className="navbar-item-link collapse-links">
                          <NavLink
                            onClick={(e) => updatePage(2)}
                            tag={Link}
                            to="/dashboard/customize/theme/setup/themeinfo"
                          >
                            <i className="fas fa-wrench"></i>{" "}
                            <span className="navlink-text d-none-sm">
                              Update Site Settings
                            </span>
                          </NavLink>
                        </NavItem>
                        <NavItem
                          style={{
                            cursor: "pointer",
                          }}
                          className="navbar-item-link collapse-links"
                        >
                          <NavLink
                            onClick={(e) => handleOpenEditPage(e)}
                            // href={`/${school.schoolDetails.name}`} target="_blank" rel="noreferrer"
                          >
                            <i className="fas fa-tools"></i>{" "}
                            <span className="navlink-text d-none-sm">
                              Edit Site Landing Page
                            </span>
                          </NavLink>
                        </NavItem>
                      </Collapse>
                    </NavItem>
                    {/* <NavItem
                                className={classnames("navbar-item-link", {
                                        selected: currentPage.counter === 3
                                    })}>
                                        <NavLink  onClick={e => updatePage(3)} tag={Link} to="/dashboard/createcourse">
                                        <i className="fas fa-plus"></i> <span className="navlink-text d-none-sm">Create New Course</span>
                                        </NavLink>
                                </NavItem> */}
                    <NavItem
                      className={classnames("navbar-item-link", {
                        selected: currentPage.counter === 4,
                      })}
                    >
                      <NavLink
                        onClick={(e) => updatePage(4)}
                        tag={Link}
                        to="/dashboard/courses"
                      >
                        <i className="fas fa-book"></i>{" "}
                        <span className="navlink-text d-none-sm">
                          My Courses
                        </span>
                      </NavLink>
                    </NavItem>
                    <NavItem
                      className={classnames("navbar-item-link", {
                        selected: currentPage.counter === 102,
                      })}
                    >
                      <NavLink
                        onClick={(e) => updatePage(102)}
                        tag={Link}
                        to="/dashboard/createproduct"
                      >
                        <i className="fas fa-tags"></i>{" "}
                        <span className="navlink-text d-none-sm">
                          Create Product
                        </span>
                      </NavLink>
                    </NavItem>
                    <NavItem
                      className={classnames("navbar-item-link", {
                        selected: currentPage.counter === 103,
                      })}
                    >
                      <NavLink
                        onClick={(e) => updatePage(103)}
                        tag={Link}
                        to="/dashboard/products"
                      >
                        <i className="fas fa-list"></i>{" "}
                        <span className="navlink-text d-none-sm">
                          My Products
                        </span>
                      </NavLink>
                    </NavItem>
                    <NavItem
                      className={classnames("navbar-item-link", {
                        selected: currentPage.counter === 5,
                      })}
                    >
                      <NavLink
                        onClick={(e) => updatePage(5)}
                        tag={Link}
                        to="/dashboard/payment"
                      >
                        <i className="fas fa-dollar-sign"></i>
                        <span className="navlink-text d-none-sm">Payments</span>
                      </NavLink>
                    </NavItem>
                    {/* <NavItem className={classnames("navbar-item-link", {
                                        selected: currentPage.counter === 6
                                    })}>
                                        <NavLink onClick={e => updatePage(6)} tag={Link} to="/dashboard/messages">
                                        <i className="far fa-comment-alt"></i> <span className="navlink-text d-none-sm">Messages</span>
                                        </NavLink>
                                    </NavItem> */}
                    <NavItem
                      className={classnames("navbar-item-link", {
                        selected: currentPage.counter === 7,
                      })}
                    >
                      <NavLink
                        onClick={(e) => updatePage(7)}
                        tag={Link}
                        to="/dashboard/notification"
                      >
                        <i className="fas fa-bell"></i>{" "}
                        <span className="navlink-text d-none-sm">
                          Notifications
                        </span>
                      </NavLink>
                    </NavItem>

                    <NavItem
                      className={classnames("navbar-item-link", {
                        selected: currentPage.counter === 20,
                      })}
                    >
                      <NavLink
                        onClick={(e) => updatePage(20)}
                        tag={Link}
                        to="/dashboard/plans/payment"
                      >
                        <i className="fas fa-calculator"></i>{" "}
                        <span className="navlink-text d-none-sm">
                          Plans & Subscription
                        </span>
                      </NavLink>
                    </NavItem>

                    <NavItem
                      className={classnames("navbar-item-link", {
                        selected: currentPage.counter === 9,
                      })}
                    >
                      <NavLink tag={Link} to="/dashboard/billing-information">
                        <i className="fas fa-money-bill-alt"></i>{" "}
                        <span className="navlink-text d-none-sm">
                          Billing & Information
                        </span>
                      </NavLink>
                    </NavItem>
                    <NavItem
                      className={classnames("navbar-item-link", {
                        selected: currentPage.counter === 55,
                      })}
                    >
                      <NavLink tag={Link} to="/dashboard/tutorials">
                        <i className="fas fa-book-reader"></i>{" "}
                        <span className="navlink-text d-none-sm">
                          Tutorials
                        </span>
                      </NavLink>
                    </NavItem>
                  </Nav>
                </div>
                <div className="user-settings">
                  <div className="setting-option">
                    <Link to="/dashboard/settings">
                      <i className="fas fa-cog mr-3 settings-icon"></i> Settings
                    </Link>
                  </div>
                  <div id="tooltipbutton" className="more-options">
                    <i className="fas fa-ellipsis-v"></i>
                  </div>
                  <UncontrolledPopover placement="top" target="tooltipbutton">
                    <PopoverBody>
                      <Nav vertical>
                        <NavItem>
                          <NavLink className="link-text" href="#">
                            <i className="fas fa-info-circle"></i>{" "}
                            <span className="navlink-text">Help</span>
                          </NavLink>
                        </NavItem>
                        <NavItem>
                          <NavLink
                            className="link-text"
                            href="*"
                            onClick={(e) => handleLogout(e)}
                          >
                            <i className="fas fa-sign-out-alt"></i>{" "}
                            <span className="navlink-text">Logout</span>
                          </NavLink>
                        </NavItem>
                      </Nav>
                    </PopoverBody>
                  </UncontrolledPopover>
                </div>
              </div>
            </Col>
          </>
        ) : (
          <>
            <DashboardLoadingSkeleton />
          </>
        )}
      </>
    </>
  );
};

const mapStateToProps = (state) => ({
  school: state.school,
  user: state.auth.user,
  currentPage: state.currentPage,
});

const mapDispatchToProps = (dispatch) => ({
  logUserOut: () => dispatch(logout()),
  getSchool: () => dispatch(getDefaultSchool()),
  getLoggedInUser: () => dispatch(loadUser()),
  updatePageCounter: (counter) =>
    dispatch({ type: UPDATE_DASHBOARD_PAGE_COUNTER, payload: counter }),
  updatePageCounterToDefault: () =>
    dispatch({ type: UPDATE_DASHBOARD_PAGE_COUNTER_TO_DEFAULT }),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(DashboardNavbar));
