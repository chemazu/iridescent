import React, { useEffect, useState } from "react";
import { connect, useDispatch } from "react-redux";
import { withRouter } from "react-router-dom";
import NotificationNavbar from "../NotificationNavbar";
import Cookies from "js-cookie";
import axios from "axios";
import {
  Row,
  Col,
  Container,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "reactstrap";
import DashboardNavbar from "../DashboardNavbar";
import ThemePreviewContainer from "./ThemePreviewContainer";
import { UPDATE_DASHBOARD_PAGE_COUNTER } from "../../../actions/types";
import { stopLoading, startLoading } from "../../../actions/appLoading";
import {
  CHOOSE_THEME,
  THEME_SETUP_ERROR,
  UPDATE_SCHOOL_THEME_INFO,
} from "../../../actions/types";
import setAuthToken from "../../../utilities/setAuthToken";

import "../../../custom-styles/dashboard/dashboardlayout.css";
import "../../../custom-styles/dashboard/customize.css";

const Customize = ({ school, history, updatePageSelector }) => {
  const [
    showChangeThemeConfrimationModal,
    setShowChangeThemeConfrimationModal,
  ] = useState(false);
  const [themePreview, setThemePreview] = useState([]);
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const [themeUpdateSuccessModal, setThemeUpdateSuccessModal] = useState(false);

  const closeThemeChangeModal = () =>
    setShowChangeThemeConfrimationModal(false);
  const openThemeChangeModal = (themeId) => {
    setShowChangeThemeConfrimationModal(true);
    setSelectedTheme(themeId);
  };

  const getSchoolUrl = (schoolname) => {
    const host = window.location.host;
    console.log(host, "host info");
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

  const onUpdateThemeClickHandler = () => {
    chooseTheme(school._id, selectedTheme, history);
  };

  const sectionBuildingBtnClickEventHandler = () => {
    setTokenAsCookie(localStorage.getItem("token"));
    window.location.href = getSchoolUrl(school.name);
  };

  const getThemePreviewList = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/v1/themepreview/");
      setThemePreview(res.data);
    } catch (error) {
      setThemePreview([]);
    }
    setLoading(false);
  };

  const toggleThemeUpdateSuccesModal = () =>
    setThemeUpdateSuccessModal(!themeUpdateSuccessModal);

  const chooseTheme = async (schoolId, themepreviewId) => {
    if (localStorage.token) {
      setAuthToken(localStorage.token);
    }
    try {
      dispatch(startLoading());
      const res = await axios.post(
        `/api/v1/theme/${schoolId}/${themepreviewId}`
      );
      dispatch({
        type: CHOOSE_THEME,
        payload: res.data.theme,
      });
      dispatch({
        type: UPDATE_SCHOOL_THEME_INFO,
        payload: res.data.school,
      });
      dispatch(stopLoading());
      setShowChangeThemeConfrimationModal(false);
      setThemeUpdateSuccessModal(true);
    } catch (error) {
      const errors = error.response.data.errors;
      if (errors) {
        errors.forEach((error) => {
          alert(error.msg);
        });
      }
      dispatch(stopLoading());
      dispatch({
        type: THEME_SETUP_ERROR,
      });
    }
  };

  useEffect(() => {
    getThemePreviewList();
  }, []);

  useEffect(() => {
    updatePageSelector(2);
    // eslint-disable-next-line
  }, []);

  return (
    <>
      <div className="dashboard-layout">
        <Container fluid>
          <Row>
            <DashboardNavbar />
            <Col className="page-actions__col">
              <div className="page-actions">
                <NotificationNavbar />
                <div className="customize-page">
                  <div className="customize-page__contents">
                    <h3 className="customize-page-title">Customize space</h3>
                    <p className="page-subtitle">Select a Landing Page Theme</p>
                    {loading ? (
                      <p className="text-center lead">Loading...</p>
                    ) : (
                      <>
                        <ThemePreviewContainer
                          themePreview={themePreview}
                          openThemeChangeModal={openThemeChangeModal}
                        />
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
      {/* confirmation modal for theme  */}
      <Modal
        isOpen={showChangeThemeConfrimationModal}
        centered
        toggle={closeThemeChangeModal}
      >
        <ModalHeader className="text-dark" toggle={closeThemeChangeModal}>
          <h3
            style={{
              color: "#000",
              fontSize: "18px",
              fontWeight: "500",
            }}
          >
            Confirm Change
          </h3>
        </ModalHeader>
        <ModalBody className="text-dark">
          Are You Sure you want to Change your Theme?
        </ModalBody>
        <ModalFooter>
          <Button
            style={{
              paddingLeft: "20px",
              paddingRight: "20px",
            }}
            onClick={(e) => onUpdateThemeClickHandler()}
            className="modal-btn-style"
          >
            Update Theme
          </Button>{" "}
          <Button
            style={{
              paddingLeft: "40px",
              paddingRight: "40px",
            }}
            className="modal-btn-style-outline"
            onClick={closeThemeChangeModal}
          >
            Cancel
          </Button>
        </ModalFooter>
      </Modal>

      {/* theme updated successfully modal  */}
      <Modal
        isOpen={themeUpdateSuccessModal}
        centered
        toggle={toggleThemeUpdateSuccesModal}
      >
        <ModalHeader
          className="text-dark"
          toggle={toggleThemeUpdateSuccesModal}
        >
          <h3
            style={{
              color: "#000",
              fontSize: "18px",
              fontWeight: "500",
            }}
          >
            Update Success
          </h3>
        </ModalHeader>
        <ModalBody className="text-dark">Theme Updated Successfully.</ModalBody>
        <ModalFooter
          style={{
            display: "block",
          }}
        >
          <Button
            block
            onClick={sectionBuildingBtnClickEventHandler}
            className="modal-btn-style"
          >
            Proceed To Section Building
          </Button>
          <Button
            block
            onClick={toggleThemeUpdateSuccesModal}
            className="modal-btn-style-outline"
          >
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

const mapStateToProps = (state) => ({
  school: state.school.schoolDetails,
});

const mapDispatchToProps = (dispatch) => ({
  updatePageSelector: (counter) =>
    dispatch({ type: UPDATE_DASHBOARD_PAGE_COUNTER, payload: counter }),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(Customize));
