import React, { useEffect, useState } from "react";
import { useDispatch, useStore, connect } from "react-redux";
import broadcast from "../../images/broadcast.svg"
import {
  LOAD_NOTIFICATION_DATA,
  UPDATE_DASHBOARD_PAGE_COUNTER,
  UPDATE_DASHBOARD_PAGE_COUNTER_TO_DEFAULT,
} from "../../actions/types";
import { Link } from "react-router-dom";
import {
  UncontrolledCollapse,
  Navbar,
  Nav,
  Container,
  Row,
  Col,
  NavItem,
  NavLink,
  Collapse,
} from "reactstrap";
import Cookies from "js-cookie";
import axios from "axios";
import classnames from "classnames";
import setAuthToken from "../../utilities/setAuthToken";
import { logout } from "../../actions/auth";

import logo2 from "../../images/tuturlySvgLogo.svg";

import "../../custom-styles/dashboard/notificationbar.css";

const NotificationNavbar = ({ user, notificationState }) => {
  const dispatch = useDispatch();
  const store = useStore();
  const currentPage = store.getState().currentPage;
  const school = store.getState().school;

  const [isCollapseOpen, setIsCollapseOpen] = useState(false);
  const toggleNavbarCollapse = () => setIsCollapseOpen(!isCollapseOpen);

  const loadNotificationsUpdateInfo = async () => {
    try {
      if (localStorage.getItem("token")) {
        setAuthToken(localStorage.getItem("token"));
      }
      const res = await axios.get("/api/v1/notificationupdate");
      dispatch({
        type: LOAD_NOTIFICATION_DATA,
        payload: res.data,
      });
    } catch (error) {
      console.log(error);
    }
  };

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

  const updatePageCounterToDefault = () =>
    dispatch({ type: UPDATE_DASHBOARD_PAGE_COUNTER_TO_DEFAULT });

  const logUserOut = () => dispatch(logout());

  const handleLogout = (e) => {
    e.preventDefault();
    deleteTokenCookie();
    logUserOut();
    updatePageCounterToDefault();
  };

  const handleOpenEditPage = (e) => {
    e.preventDefault();
    updatePage(2);
    // save use cookie here.
    setTokenAsCookie(localStorage.getItem("token"));
    // open link in new tab
    window.open(getSchoolUrl(school.schoolDetails.name), "_blank");
  };

  const updatePage = (counter) => {
    dispatch({
      type: UPDATE_DASHBOARD_PAGE_COUNTER,
      payload: counter,
    });
  };

  useEffect(() => {
    loadNotificationsUpdateInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Navbar className="navbar-dark navbar-display-mobile" expand="lg">
        <Container
          style={{
            width: "90%",
          }}
          fluid
        >
          <button className="navbar-toggler" id="navbar-primary">
            <i
              style={{
                color: "#525f7f",
              }}
              className="fas fa-bars"
            ></i>
          </button>
          <UncontrolledCollapse navbar toggler="#navbar-primary">
            <div className="navbar-collapse-header">
              <Row>
                <Col className="collapse-brand" xs="6">
                  <Link to="/dashboard/index">
                    <img src={logo2} alt="..." />
                  </Link>
                </Col>
                <Col className="collapse-close" xs="6">
                  <div
                    id="navbar-primary"
                    style={{
                      cursor: "pointer",
                    }}
                  >
                    <i
                      style={{
                        color: "#525f7f",
                        fontSize: "16px",
                        fontWeight: 600,
                      }}
                      className="fas fa-times"
                    ></i>
                  </div>
                </Col>
              </Row>
            </div>
            <Nav className="align-items-lg-center ml-lg-auto" navbar>
              <NavItem
                className={classnames("vertical-navbar-item-link", {
                  "notification-link-item__selected": currentPage.counter === 1,
                })}
              >
                <NavLink
                  onClick={(e) => updatePage(1)}
                  tag={Link}
                  to="/dashboard/index"
                >
                  <i className="fas fa-home mr-3"></i>
                  <span className="navlink-text">Dashboard</span>
                </NavLink>
              </NavItem>

              <NavItem
                className={classnames("vertical-navbar-item-link", {
                  "notification-link-item__selected": currentPage.counter === 2,
                })}
              >
                <NavLink
                  style={{
                    marginLeft: "10px",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                  className="collapse-opener-link-item"
                  onClick={toggleNavbarCollapse}
                >
                  <span>
                    <i className="fas fa-edit mr-3"></i>
                    <span className="navlink-text">Customize space</span>
                  </span>
                  <span>
                    {isCollapseOpen ? (
                      <i
                        style={{
                          fontSize: "20px",
                        }}
                        className="fas fa-caret-up mr-2"
                      ></i>
                    ) : (
                      <i
                        style={{
                          fontSize: "20px",
                        }}
                        className="fas fa-caret-down mr-2"
                      ></i>
                    )}
                  </span>
                </NavLink>
                <Collapse isOpen={isCollapseOpen}>
                  <NavItem className="vertical-navbar-item-link collapse-links">
                    <NavLink
                      style={{
                        marginLeft: "20px",
                      }}
                      onClick={(e) => updatePage(2)}
                      tag={Link}
                      to="/dashboard/customize"
                    >
                      <i className="fas fa-hand-pointer mr-3"></i>
                      <span className="navlink-text">Choose Site Theme</span>
                    </NavLink>
                  </NavItem>
                  <NavItem className="vertical-navbar-item-link collapse-links">
                    <NavLink
                      style={{
                        marginLeft: "20px",
                      }}
                      onClick={(e) => updatePage(2)}
                      tag={Link}
                      to="/dashboard/customize/theme/setup/themeinfo"
                    >
                      <i className="fas fa-wrench mr-3"></i>
                      <span className="navlink-text">Update Site Settings</span>
                    </NavLink>
                  </NavItem>
                  <NavItem
                    style={{
                      cursor: "pointer",
                      marginLeft: "10px",
                    }}
                    className="vertical-navbar-item-link collapse-links"
                  >
                    <NavLink onClick={(e) => handleOpenEditPage(e)}>
                      <i className="fas fa-tools mr-3"></i>
                      <span className="navlink-text">
                        Edit Site Landing Page
                      </span>
                    </NavLink>
                  </NavItem>
                </Collapse>
              </NavItem>

              <NavItem
                className={classnames("vertical-navbar-item-link", {
                  "notification-link-item__selected": currentPage.counter === 4,
                })}
              >
                <NavLink
                  onClick={(e) => updatePage(4)}
                  tag={Link}
                  to="/dashboard/courses"
                >
                  <i className="fas fa-book mr-3"></i>
                  <span className="navlink-text">My Courses</span>
                </NavLink>
              </NavItem>

              <NavItem
                className={classnames("vertical-navbar-item-link", {
                  "notification-link-item__selected":
                    currentPage.counter === 102,
                })}
              >
                <NavLink
                  onClick={(e) => updatePage(102)}
                  tag={Link}
                  to="/dashboard/createproduct"
                >
                  <i className="fas fa-tags mr-3"></i>
                  <span className="navlink-text">Create Product</span>
                </NavLink>
              </NavItem>
              <NavItem
                className={classnames("vertical-navbar-item-link", {
                  "notification-link-item__selected":
                    currentPage.counter === 102,
                })}
              >
                  <NavLink
                        tag={Link}
                        to="/dashboard/livewebinar"
                        onClick={(e) => updatePage(34)}
                      >
                        <img
                          src={broadcast}
                          style={{
                            marginRight: "17px",
                            width: "20px",
                            marginLeft: "-4px",
                          }}
                          alt="live webinar"
                          className="fas fa-book-reader"
                        />
                        <span className="navlink-text">
                          Tuturly Classroom
                        </span>
                      </NavLink>
              </NavItem>
              

              <NavItem
                className={classnames("vertical-navbar-item-link", {
                  "notification-link-item__selected":
                    currentPage.counter === 103,
                })}
              >
                <NavLink
                  onClick={(e) => updatePage(103)}
                  tag={Link}
                  to="/dashboard/products"
                >
                  <i className="fas fa-list mr-3"></i>
                  <span className="navlink-text">My Products</span>
                </NavLink>
              </NavItem>

              <NavItem
                className={classnames("vertical-navbar-item-link", {
                  "notification-link-item__selected": currentPage.counter === 5,
                })}
              >
                <NavLink
                  onClick={(e) => updatePage(5)}
                  tag={Link}
                  to="/dashboard/payment"
                >
                  <i className="fas fa-dollar-sign mr-3"></i>
                  <span className="navlink-text">Payments</span>
                </NavLink>
              </NavItem>
              <NavItem
                className={classnames("vertical-navbar-item-link", {
                  "notification-link-item__selected": currentPage.counter === 7,
                })}
              >
                <NavLink
                  onClick={(e) => updatePage(7)}
                  tag={Link}
                  to="/dashboard/notification"
                >
                  <i className="fas fa-bell mr-3"></i>
                  <span className="navlink-text">Notifications</span>
                </NavLink>
              </NavItem>

              <NavItem
                className={classnames("vertical-navbar-item-link", {
                  "notification-link-item__selected":
                    currentPage.counter === 20,
                })}
              >
                <NavLink
                  onClick={(e) => updatePage(20)}
                  tag={Link}
                  to="/dashboard/plans/payment"
                >
                  <i className="fas fa-calculator mr-3"></i>{" "}
                  <span className="navlink-text">Plans & Subscription</span>
                </NavLink>
              </NavItem>

              <NavItem
                className={classnames("vertical-navbar-item-link", {
                  "notification-link-item__selected": currentPage.counter === 9,
                })}
              >
                <NavLink tag={Link} to="/dashboard/billing-information">
                  <i className="fas fa-money-bill-alt mr-3"></i>
                  <span className="navlink-text">Billing & Information</span>
                </NavLink>
              </NavItem>

              <NavItem
                className={classnames("vertical-navbar-item-link", {
                  "notification-link-item__selected":
                    currentPage.counter === 55,
                })}
              >
                <NavLink tag={Link} to="/dashboard/tutorials">
                  <i className="fas fa-book-reader mr-3"></i>
                  <span className="navlink-text">Tutorials</span>
                </NavLink>
              </NavItem>

              <NavItem
                className={classnames("vertical-navbar-item-link", {
                  "notification-link-item__selected":
                    currentPage.counter === 23,
                })}
              >
                <NavLink tag={Link} to="/dashboard/settings">
                  <i className="fas fa-cog mr-3"></i>
                  <span className="navlink-text">Settings</span>
                </NavLink>
              </NavItem>

              <NavItem
                style={{
                  borderTop: "1px solid #525f7f",
                }}
                className={classnames("vertical-navbar-item-link mt-2", {
                  "notification-link-item__selected": currentPage.counter === 9,
                })}
              >
                <NavLink onClick={handleLogout}>
                  <i className="fas fa-sign-out-alt mr-3"></i>
                  <span className="navlink-text">Logout</span>
                </NavLink>
              </NavItem>
            </Nav>
          </UncontrolledCollapse>
          <div>
            <Link
              style={{
                color: "#525f7f",
                cursor: "pointer",
              }}
              to="/dashboard/notification"
            >
              <i style={{ fontSize: "19px" }} className="fas fa-bell"></i>
              {notificationState !== null &&
                notificationState?.inView === true && (
                  <>
                    <span
                      style={{
                        height: "25px",
                        width: "25px",
                        borderRadius: "50%",
                        textAlign: "center",
                        backgroundColor: "tomato",
                        fontWeight: "500",
                        fontSize: "16px",
                        color: "#fff",
                        display: "inline-block",
                        paddingTop: "2px",
                      }}
                      className="notification-counter ml-1"
                    >
                      {notificationState?.count}
                    </span>
                  </>
                )}
            </Link>
            {user?.user_type.includes("admin") && (
              <>
                <Link
                  style={{
                    color: "#525f7f",
                    cursor: "pointer",
                  }}
                  to="/admin/dashboard"
                  className="ml-3"
                >
                  <i
                    style={{ fontSize: "19px" }}
                    className="fas fa-user-shield"
                  ></i>
                </Link>
              </>
            )}
          </div>
        </Container>
      </Navbar>
    </>
  );
};

const mapStateToProps = (state) => ({
  user: state.auth.user,
  notificationState: state.notification,
});

export default connect(mapStateToProps)(NotificationNavbar);
