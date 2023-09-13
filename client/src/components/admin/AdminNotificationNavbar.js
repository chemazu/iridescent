import React from "react";
import { useDispatch, useStore } from "react-redux";
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
} from "reactstrap";
import { logout } from "../../actions/auth";

import logo2 from "../../images/tuturlySvgLogo.svg";

import "../../custom-styles/dashboard/notificationbar.css";

const AdminNotificationNavbar = () => {
  const dispatch = useDispatch();
  const store = useStore();
  const notificationState = store.getState().notification;

  const logUserOut = () => dispatch(logout());

  const handleLogout = (e) => {
    e.preventDefault();
    logUserOut();
  };

  return (
    <>
      <Navbar className="navbar-dark" expand="lg">
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
              <NavItem className="vertical-navbar-item-link">
                <NavLink
                  //   onClick={(e) => updatePage(1)}
                  tag={Link}
                  to="/admin/dashboard"
                >
                  <i className="fas fa-eye mr-3"></i>
                  <span className="navlink-text">Overview</span>
                </NavLink>
              </NavItem>
              <NavItem className="vertical-navbar-item-link">
                <NavLink
                  //   onClick={(e) => updatePage(4)}
                  tag={Link}
                  to="/admin/tutor"
                >
                  <i className="fas fa-mug-hot mr-3"></i>
                  <span className="navlink-text">Tutors List</span>
                </NavLink>
              </NavItem>
              <NavItem className="vertical-navbar-item-link">
                <NavLink
                  //   onClick={(e) => updatePage(5)}
                  tag={Link}
                  to="/admin/report"
                >
                  <i className="fas fa-exclamation-triangle mr-3"></i>
                  <span className="navlink-text">Students Report</span>
                </NavLink>
              </NavItem>
              <NavItem className="vertical-navbar-item-link">
                <NavLink
                  //   onClick={(e) => updatePage(5)}
                  tag={Link}
                  to="/admin/course"
                >
                  <i className="fab fa-wpexplorer mr-3"></i>
                  <span className="navlink-text">Explore Courses</span>
                </NavLink>
              </NavItem>
              <NavItem
                onClick={handleLogout}
                className="vertical-navbar-item-link"
              >
                <NavLink
                  //   onClick={(e) => updatePage(5)}
                  tag={Link}
                  to="/admin/course"
                >
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
            <Link
              style={{
                color: "#525f7f",
                cursor: "pointer",
              }}
              to="/dashboard/index"
              className="ml-3"
            >
              <i
                style={{ fontSize: "19px" }}
                className="fas fa-step-backward"
              ></i>
            </Link>
          </div>
        </Container>
      </Navbar>
    </>
  );
};

export default AdminNotificationNavbar;
