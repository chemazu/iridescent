import React from "react";
import { useStore, useDispatch } from "react-redux";
import {
  Navbar,
  Container,
  UncontrolledCollapse,
  Row,
  Col,
  Nav,
  NavItem,
  Button,
  NavbarBrand,
} from "reactstrap";
import { Link } from "react-router-dom";
import { studentLogout } from "../../../actions/student";
import logo from "../../../images/tuturlySVGHomeLogo.svg";
import logo2 from "../../../images/tuturlySvgLogo.svg";

import "../../../custom-styles/dashboard/tuturly-courses/secondary-page-navbar.css";

const SecondaryPagesNavbar = () => {
  const dispatch = useDispatch();
  const store = useStore();
  const appState = store.getState();

  const { cart, student } = appState;
  const notificationState = appState.studentNotification;
  const { authenticated } = student;

  const handleLogout = () => {
    dispatch(studentLogout());
  };

  return (
    <>
      <Navbar className="navbar-dark tutor-page-navbar" expand="lg">
        <Container fluid style={{ width: "90%" }}>
          <NavbarBrand tag={Link} to={`/`}>
            <img src={logo} alt="..." className="tutor-logo-img" />
          </NavbarBrand>
          <button className="navbar-toggler" id="navbar-primary">
            <i className="fas fa-bars"></i>
          </button>
          <UncontrolledCollapse navbar toggler="#navbar-primary">
            <div className="navbar-collapse-header">
              <Row>
                <Col className="collapse-brand" xs="6">
                  <NavbarBrand tag={Link} to={`/`}>
                    <img src={logo2} alt="..." className="tutor-logo-img" />
                  </NavbarBrand>
                </Col>
                <Col className="collapse-close" xs="6">
                  <button className="navbar-toggler" id="navbar-primary">
                    <span />
                    <span />
                  </button>
                </Col>
              </Row>
            </div>
            <Nav className="align-items-lg-center ml-lg-auto" navbar>
              <NavItem className="d-lg-block mb-1">
                <Button
                  tag={Link}
                  to={`/`}
                  className="tutor-page-navbar-button"
                >
                  <span className="nav-link-inner--text ml-1">Home</span>
                </Button>
              </NavItem>
              {authenticated === true ? (
                <>
                  <NavItem className="d-lg-block mb-1">
                    <Button
                      tag={Link}
                      to="/dashboard/home"
                      className="tutor-page-navbar-button"
                    >
                      <span className="nav-link-inner--text ml-1">
                        Dashboard
                      </span>
                    </Button>
                  </NavItem>
                  <NavItem className="d-lg-block mb-1">
                    <Button
                      tag={Link}
                      to={"/dashboard/page/notification"}
                      className="tutor-page-navbar-button"
                    >
                      <span className="nav-link-inner--text ml-1">
                        Notification
                        {notificationState !== null &&
                          notificationState?.inView === true && (
                            <>
                              <span
                                style={{
                                  height: "23px",
                                  width: "23px",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  textAlign: "center",
                                  borderRadius: "50%",
                                  marginLeft: "3px",
                                }}
                                className="ml-1"
                              >
                                {notificationState?.count}
                              </span>
                            </>
                          )}
                      </span>
                    </Button>
                  </NavItem>
                  <NavItem className="d-lg-block mb-1">
                    <Button
                      onClick={handleLogout}
                      className="tutor-page-navbar-button"
                    >
                      <span className="nav-link-inner--text ml-1">Logout</span>
                    </Button>
                  </NavItem>
                </>
              ) : (
                <>
                  <NavItem className="d-lg-block mb-1">
                    <Button
                      tag={Link}
                      to={`/signup`}
                      className="tutor-page-navbar-button"
                    >
                      <span className="nav-link-inner--text ml-1">Enroll</span>
                    </Button>
                  </NavItem>
                  <NavItem className="d-lg-block mb-1">
                    <Button
                      tag={Link}
                      to={`/signin`}
                      className="tutor-page-navbar-button"
                    >
                      <span className="nav-link-inner--text ml-1">Login</span>
                    </Button>
                  </NavItem>
                </>
              )}
              {cart.length > 0 && (
                <NavItem className="d-lg-block mb-1">
                  <Button
                    tag={Link}
                    to={`/cart`}
                    className="tutor-page-navbar-button"
                  >
                    <span className="nav-link-inner--text ml-1">
                      Cart{" "}
                      <span
                        style={{
                          height: "23px",
                          width: "23px",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          textAlign: "center",
                          borderRadius: "50%",
                          marginLeft: "3px",
                        }}
                      >
                        {cart.length}
                      </span>
                    </span>
                  </Button>
                </NavItem>
              )}
            </Nav>
          </UncontrolledCollapse>
        </Container>
      </Navbar>
    </>
  );
};

export default SecondaryPagesNavbar;
