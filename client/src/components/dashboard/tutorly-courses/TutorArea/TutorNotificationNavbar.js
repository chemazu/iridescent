import React from "react";
import { useDispatch, connect } from "react-redux";
import {
  UncontrolledCollapse,
  Navbar,
  Nav,
  Container,
  Row,
  Col,
  NavItem,
  NavLink,
} from "reactstrap";
import { Link } from "react-router-dom";
import {
  UPDATE_DASHBOARD_PAGE_COUNTER,
  UPDATE_DASHBOARD_PAGE_COUNTER_TO_DEFAULT,
  TUTOR_LOGOUT,
} from "../../../../actions/types";

import classnames from "classnames";

import logo2 from "../../../../images/tuturlySvgLogo.svg";

import "../../../../custom-styles/dashboard/notificationbar.css";

const TutorNotificationNavbar = ({ currentPage }) => {
  const dispatch = useDispatch();
  const updatePage = (index) => {
    dispatch({ type: UPDATE_DASHBOARD_PAGE_COUNTER, payload: index });
  };

  const updatePageCountToDefault = () =>
    dispatch({ type: UPDATE_DASHBOARD_PAGE_COUNTER_TO_DEFAULT });
  const logout = () => {
    dispatch({
      type: TUTOR_LOGOUT,
    });
  };

  const handleLogout = (e) => {
    e.preventDefault();
    updatePageCountToDefault();
    logout();
  };

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
                  <Link to="/tutor/dashboard/home">
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
                  "notification-link-item__selected":
                    currentPage.counter === 1000,
                })}
              >
                <NavLink
                  onClick={(e) => updatePage(1000)}
                  tag={Link}
                  to="/tutor/dashboard/home"
                >
                  <i className="fas fa-home mr-3"></i>
                  <span className="navlink-text">Dashboard</span>
                </NavLink>
              </NavItem>
              <NavItem
                className={classnames("vertical-navbar-item-link", {
                  "notification-link-item__selected":
                    currentPage.counter === 1001,
                })}
              >
                <NavLink
                  onClick={(e) => updatePage(1001)}
                  tag={Link}
                  to="/tutor/dashboard/courses"
                >
                  <i className="fas fa-book mr-3"></i>
                  <span className="navlink-text">My Courses</span>
                </NavLink>
              </NavItem>

              <NavItem
                className={classnames("vertical-navbar-item-link", {
                  "notification-link-item__selected":
                    currentPage.counter === 1002,
                })}
              >
                <NavLink
                  onClick={(e) => updatePage(1002)}
                  tag={Link}
                  to="/tutor/dashboard/products"
                >
                  <i className="fas fa-list mr-3"></i>
                  <span className="navlink-text">My Products</span>
                </NavLink>
              </NavItem>

              <NavItem
                className={classnames("vertical-navbar-item-link", {
                  "notification-link-item__selected":
                    currentPage.counter === 1003,
                })}
              >
                <NavLink
                  onClick={(e) => updatePage(1003)}
                  tag={Link}
                  to="/tutor/dashboard/payment"
                >
                  <i className="fas fa-dollar-sign mr-3"></i>
                  <span className="navlink-text">Payments</span>
                </NavLink>
              </NavItem>

              <NavItem
                className={classnames("vertical-navbar-item-link", {
                  "notification-link-item__selected":
                    currentPage.counter === 1004,
                })}
              >
                <NavLink
                  onClick={(e) => updatePage(1004)}
                  tag={Link}
                  to="/tutor/dashboard/notifications"
                >
                  <i className="fas fa-bell mr-3"></i>
                  <span className="navlink-text">Notifications</span>
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
              to="/tutor/dashboard/notifications"
            >
              <i style={{ fontSize: "19px" }} className="fas fa-bell"></i>
              {/* {notificationState !== null &&
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
            )} */}
            </Link>
          </div>
        </Container>
      </Navbar>
    </>
  );
};

const mapStateToProps = (state) => ({
  tutor: state.tutor.tutorDetails,
  currentPage: state.currentPage,
});

export default connect(mapStateToProps)(TutorNotificationNavbar);
