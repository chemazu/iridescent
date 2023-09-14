import React, { useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import Cookies from "js-cookie";
import {
  Container,
  Button,
  Modal,
  ModalHeader,
  ModalFooter,
  ModalBody,
} from "reactstrap";
import { stopLoading, startLoading } from "../../../actions/appLoading";
import {
  CHOOSE_THEME,
  THEME_SETUP_ERROR,
  UPDATE_SCHOOL_THEME_INFO,
} from "../../../actions/types";
import setAuthToken from "../../../utilities/setAuthToken";

import "../../../custom-styles/dashboard/themepreview/admineditorsnavbar.css";

const AdminEditorsNavbar = ({ idOfThemePreviewInView, schoolDetails }) => {
  const [showConfirmThemeChangeModal, setConfirmThemeChangeModal] =
    useState(false);
  const dispatch = useDispatch();
  const [themeUpdateSuccessModal, setThemeUpdateSuccessModal] = useState(false);

  const displayThemeChangeConfirmModal = () => {
    setConfirmThemeChangeModal(true);
  };

  const closeThemeChnageConfirmModal = () => {
    setConfirmThemeChangeModal(false);
  };

  const onUpdateThemeClickHandler = () => {
    chooseTheme(schoolDetails._id, idOfThemePreviewInView);
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

  const sectionBuildingBtnClickEventHandler = () => {
    setTokenAsCookie(localStorage.getItem("token"));
    window.location.href = getSchoolUrl(schoolDetails.name);
  };

  const handleBackToCustomizePageHandler = () => {
    const host = window.location.host;
    if (host.includes("localhost")) {
      window.location.href = "http://localhost:3000/dashboard/customize";
    } else {
      window.location.href = "https://www.tuturly.com/dashboard/customize";
    }
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
      closeThemeChnageConfirmModal();
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

  return (
    <>
      <div className="admin-editors__navbar-theme-preview fixed-top">
        <Container
          fluid
          style={{
            width: "90%",
          }}
        >
          <div className="panel-control-contents-theme__preview">
            <Button
              onClick={handleBackToCustomizePageHandler}
              className="back-to-theme__select-button-theme-preview"
              // tag={Link}
              // to="/dashboard/customize"
            >
              <i className="fas fa-arrow-left mr-3"></i>
              Back To Theme Select
            </Button>

            <Button
              disabled={schoolDetails.themepreviewid === idOfThemePreviewInView}
              onClick={displayThemeChangeConfirmModal}
              className="choose-theme__btn"
            >
              {schoolDetails.themepreviewid === idOfThemePreviewInView
                ? "Active Theme"
                : "Choose This Theme"}
            </Button>
          </div>
        </Container>
      </div>

      <Modal isOpen={showConfirmThemeChangeModal} centered>
        <ModalHeader className="text-dark">Confirm Change</ModalHeader>
        <ModalBody className="text-dark">
          Are You Sure you want to Select This Theme?
        </ModalBody>
        <ModalFooter>
          <Button
            onClick={onUpdateThemeClickHandler}
            className="modal-btn-style"
            style={{ width: "50%" }}
          >
            Update Theme
          </Button>{" "}
          <Button
            onClick={closeThemeChnageConfirmModal}
            className="modal-btn-style-outline"
            style={{ width: "50%" }}
            color="secondary"
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
          Update Success
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
            className="modal-btn-style mb-3"
          >
            Proceed To Section Building
          </Button>{" "}
          <Button
            block
            color="secondary"
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

export default AdminEditorsNavbar;
