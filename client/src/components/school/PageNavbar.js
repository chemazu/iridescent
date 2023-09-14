import React, { useEffect } from "react";
import { useStore, useDispatch } from "react-redux";
import axios from "axios";
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
import { studentLogout } from "../../actions/student";
import { LOAD_STUDENT_NOTIFICATION_DATA } from "../../actions/types";
import setAuthToken from "../../utilities/setAuthToken";

import "../../custom-styles/pages/pagenavbar.css";

const PageNavbar = ({ pageName, theme }) => {
  const dispatch = useDispatch();
  const store = useStore();
  const appState = store.getState();

  const { cart, student } = appState;
  const notificationState = appState.studentNotification;
  const { authenticated } = student;

  const handleLogout = () => {
    dispatch(studentLogout());
  };

  const loadStudentNotificationUpdateInfo = async () => {
    try {
      if (localStorage.getItem("studentToken")) {
        setAuthToken(localStorage.getItem("studentToken"));
        const res = await axios.get("/api/v1/student/notificationupdate");
        dispatch({
          type: LOAD_STUDENT_NOTIFICATION_DATA,
          payload: res.data,
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    loadStudentNotificationUpdateInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Navbar
        style={{
          backgroundColor: theme?.themestyles.navbarbackgroundcolor,
        }}
        className="navbar-dark page-navbar"
        expand="lg"
      >
        <Container fluid style={{ width: "90%" }}>
          <NavbarBrand tag={Link} to={`/`}>
            {theme?.logo?.length > 0 && (
              <>
                <img
                  src={theme?.logo}
                  style={{
                    height: "60px",
                  }}
                  alt="..."
                  className="img-fluid"
                />
              </>
            )}
          </NavbarBrand>
          <button className="navbar-toggler" id="navbar-primary">
            <i className="fas fa-bars"></i>
          </button>
          <UncontrolledCollapse navbar toggler="#navbar-primary">
            <div className="navbar-collapse-header">
              <Row>
                <Col className="collapse-brand" xs="6">
                  <NavbarBrand tag={Link} to={`/`}>
                    {theme?.logo?.length > 0 && (
                      <>
                        <img
                          src={theme?.logo}
                          style={{
                            height: "60px",
                          }}
                          alt="..."
                          className="img-fluid"
                        />
                      </>
                    )}
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
                  className="page-navbar-button"
                  style={{
                    color: theme?.themestyles.navbartextcolor,
                    backgroundColor: theme?.themestyles.navbarbackgroundcolor,
                    fontFamily: theme?.themestyles.fontfamily,
                    boxShadow: "none",
                    border: "none",
                    transform: "none",
                  }}
                >
                  <span className="nav-link-inner--text ml-1">Home</span>
                </Button>
              </NavItem>
              {authenticated === true ? (
                <>
                  <NavItem className="d-lg-block mb-1">
                    <Button
                      tag={Link}
                      to={`/dashboard/courses`}
                      className="page-navbar-button"
                      style={{
                        color: theme?.themestyles.navbartextcolor,
                        backgroundColor:
                          theme?.themestyles.navbarbackgroundcolor,
                        fontFamily: theme?.themestyles.fontfamily,
                        boxShadow: "none",
                        border: "none",
                        transform: "none",
                      }}
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
                      className="page-navbar-button"
                      style={{
                        color: theme?.themestyles.navbartextcolor,
                        backgroundColor:
                          theme?.themestyles.navbarbackgroundcolor,
                        fontFamily: theme?.themestyles.fontfamily,
                        boxShadow: "none",
                        border: "none",
                        transform: "none",
                      }}
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
                                  backgroundColor:
                                    theme?.themestyles.navbartextcolor,
                                  color:
                                    theme?.themestyles.navbarbackgroundcolor,
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
                      className="page-navbar-button"
                      style={{
                        color: theme?.themestyles.navbartextcolor,
                        backgroundColor:
                          theme?.themestyles.navbarbackgroundcolor,
                        fontFamily: theme?.themestyles.fontfamily,
                        boxShadow: "none",
                        border: "none",
                        transform: "none",
                      }}
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
                      to={`/enroll`}
                      className="page-navbar-button"
                      style={{
                        color: theme?.themestyles.navbartextcolor,
                        backgroundColor:
                          theme?.themestyles.navbarbackgroundcolor,
                        fontFamily: theme?.themestyles.fontfamily,
                        boxShadow: "none",
                        border: "none",
                        transform: "none",
                      }}
                    >
                      <span className="nav-link-inner--text ml-1">Enroll</span>
                    </Button>
                  </NavItem>
                  <NavItem className="d-lg-block mb-1">
                    <Button
                      tag={Link}
                      to={`/login`}
                      className="page-navbar-button"
                      style={{
                        color: theme?.themestyles.navbartextcolor,
                        backgroundColor:
                          theme?.themestyles.navbarbackgroundcolor,
                        fontFamily: theme?.themestyles.fontfamily,
                        boxShadow: "none",
                        border: "none",
                        transform: "none",
                      }}
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
                    className="page-navbar-button"
                    style={{
                      color: theme?.themestyles.navbartextcolor,
                      backgroundColor: theme?.themestyles.navbarbackgroundcolor,
                      fontFamily: theme?.themestyles.fontfamily,
                      boxShadow: "none",
                      border: "none",
                      transform: "none",
                    }}
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
                          backgroundColor: theme?.themestyles.navbartextcolor,
                          color: theme?.themestyles.navbarbackgroundcolor,
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

export default PageNavbar;
