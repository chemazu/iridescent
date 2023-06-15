import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useStore, connect } from "react-redux";
import axios from "axios";
import { Link } from "react-router-dom";
import { useAlert } from "react-alert";
import { LOAD_STUDENT_NOTIFICATION_DATA } from "../../../actions/types";
import setAuthToken from "../../../utilities/setAuthToken";
import {
  Navbar,
  NavbarBrand,
  Container,
  Row,
  Col,
  Nav,
  NavItem,
  UncontrolledCollapse,
  Button,
  Modal,
} from "reactstrap";
import { studentLogout } from "../../../actions/student";

import "../../../custom-styles/schoollandingpagecomponents/schoolpagenavbar.css";

const SchoolPageNavbar = ({
  theme,
  schoolName,
  isShowingEditorNavbar,
  isPreviewMode,
  updateSchoolThemeBySchoolId,
  authenticated,
}) => {
  const dispatch = useDispatch();
  const store = useStore();
  const appState = store.getState();
  const alert = useAlert();

  const [displayLogoUploadModal, setDisplayLogoUploadModal] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [uplodedLogo, setUplodedLogo] = useState(null);

  const logoUploadInputRef = useRef();

  const { cart } = appState;
  const notificationState = appState.studentNotification;

  const handleLogoFilePicker = () => logoUploadInputRef.current.click();

  const handleFilePickerChangeHandler = (e) => {
    if (e.target.files.length === 0) {
      return setLogoFile(null);
    }

    const fileSize = e?.target?.files[0]?.size / 1024 / 1024; // file size in mb
    if (fileSize > 10) {
      return alert.show(
        "File Size exceeds maximum limit, choose another file",
        {
          type: "error",
        }
      );
    }
    setLogoFile(e.target.files[0]);

    const reader = new FileReader();
    reader.onload = function (e) {
      setUplodedLogo(e.target.result);
    };

    reader.readAsDataURL(e.target.files[0]);
  };

  const handleImageClickReset = () => {
    setLogoFile(null);
    setUplodedLogo(null);
  };

  const handleStudentLogout = () => {
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

  const handleLogoSaveClickHandler = () => {
    updateSchoolThemeBySchoolId(logoFile);
    setDisplayLogoUploadModal(false);
    handleImageClickReset();
  };

  useEffect(() => {
    loadStudentNotificationUpdateInfo();
    //  eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div
        className="school-dafault-navbar"
        style={{
          marginTop: isShowingEditorNavbar ? "55px" : 0,
        }}
      >
        {isShowingEditorNavbar === true && isPreviewMode === true && (
          <div className="navbar-edit-overlay">
            <div className="navbar-edit-overlay-controls">
              <Button
                onClick={() => setDisplayLogoUploadModal(true)}
                className="update-logo__btn"
              >
                Update Logo
              </Button>
            </div>
          </div>
        )}
        <Navbar
          style={{
            backgroundColor: theme?.themestyles.navbarbackgroundcolor,
          }}
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
              <i
                style={{
                  color: theme?.themestyles.navbartextcolor,
                }}
                className="fas fa-bars toggler-style"
              ></i>
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
                <NavItem className="d-lg-block">
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
                    <NavItem className="d-lg-block">
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
                    <NavItem className="d-lg-block">
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
                    <NavItem className="d-lg-block">
                      <Button
                        onClick={handleStudentLogout}
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
                          Logout
                        </span>
                      </Button>
                    </NavItem>
                  </>
                ) : (
                  <>
                    <NavItem className="d-lg-block">
                      <Button
                        tag={Link}
                        to={`/enroll`}
                        className="school-navbar-btn"
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
                          Enroll
                        </span>
                      </Button>
                    </NavItem>
                    <NavItem className="d-lg-block">
                      <Button
                        tag={Link}
                        to={`/login`}
                        className="school-navbar-btn"
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
                  <NavItem className="d-lg-block">
                    <Button
                      tag={Link}
                      to={`/cart`}
                      className="school-navbar-btn"
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
      </div>
      <Modal isOpen={displayLogoUploadModal} size="md" centered>
        <div className="modal-header header-design">
          <h3>Logo Update</h3>
          <div
            onClick={() => setDisplayLogoUploadModal(false)}
            className="close-container"
          >
            <i className="fas fa-times"></i>
          </div>
        </div>
        <div className="modal-body">
          <div className="logo-upload-body">
            {logoFile === null ? (
              <>
                <div
                  className="upload-instructions"
                  onClick={handleLogoFilePicker}
                >
                  <i className="fas fa-upload"></i>
                  <p>Click Here to Pick file from your phone or computer</p>
                  <input
                    type="file"
                    accept="image/*"
                    ref={logoUploadInputRef}
                    onChange={(e) => handleFilePickerChangeHandler(e)}
                    style={{
                      display: "none",
                    }}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="uploaded-logo-preview__container">
                  <img src={uplodedLogo} alt="..." />
                  <p>{logoFile.name}</p>
                  <Button
                    onClick={handleImageClickReset}
                    block
                    className="modal-btn-style-outline mt-2"
                  >
                    Reset
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
        <div className="modal-footer">
          <Button
            onClick={handleLogoSaveClickHandler}
            disabled={logoFile === null}
            block
            className="modal-btn-style"
          >
            Save
          </Button>
        </div>
      </Modal>
    </>
  );
};

const mapStateToProps = (state) => ({
  authenticated: state.student.authenticated,
});

export default connect(mapStateToProps)(SchoolPageNavbar);
