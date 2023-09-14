import React, { useState, useEffect } from "react";
import { useStore, useDispatch, connect } from "react-redux";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Form,
  FormGroup,
  Input,
  Button,
  Modal,
} from "reactstrap";
import DashboardNavbar from "../DashboardNavbar";
import NotificationNavbar from "../NotificationNavbar";
import setAuthToken from "../../../utilities/setAuthToken";
import { startLoading, stopLoading } from "../../../actions/appLoading";
import { logout } from "../../../actions/auth";
import {
  LOAD_USER,
  GET_SCHOOL,
  UPDATE_DASHBOARD_PAGE_COUNTER,
} from "../../../actions/types";
import ChangePasswordModal from "./ChangePasswordModal";

import { useAlert } from "react-alert";

import "../../../custom-styles/dashboard/dashboardlayout.css";
import "../../../custom-styles/dashboard/settings.css";

const Settings = () => {
  const [settingsInfo, setSettingsInfo] = useState({
    username: "",
    firstname: "",
    lastname: "",
    email: "",
    field: "",
    about: "",
  });

  const dispatch = useDispatch();
  const store = useStore();
  const [fieldResults, setFieldResult] = useState([]);
  const alert = useAlert();

  const [deleteAccountPrompt, setDeleteAccountPrompt] = useState(false);
  const [modalSuccessPrompt, setModalSuccessPrompt] = useState(false);

  const updatePageSelector = (counter) => {
    dispatch({
      type: UPDATE_DASHBOARD_PAGE_COUNTER,
      payload: counter,
    });
  };

  const toggleModalSuccessPrompt = () =>
    setModalSuccessPrompt(!modalSuccessPrompt);

  const toggleDeleteAccountPrompt = () =>
    setDeleteAccountPrompt(!deleteAccountPrompt);

  const [isUpdatePasswordModalOpen, setUpdatePasswordModalOpen] =
    useState(false);

  const [updateSettingsConfirmationModal, setUpdateSettingsConfirmationModal] =
    useState(false);

  const appState = store.getState();

  const schoolUrl = `https://${appState?.auth?.user?.username}.tuturly.com`;

  const handleUpdatePageSettingsInfoOnClick = (e) =>
    setSettingsInfo({
      ...settingsInfo,
      [e.target.name]: e.target.value,
    });

  const getFieldsList = async (query = "") => {
    try {
      const res = await axios.get(
        `/api/v1/coursetype/coursetitle?data=${query}`
      );
      setFieldResult(res.data);
    } catch (error) {
      alert.show(error, {
        type: "error",
      });
      console.log(error);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setUpdateSettingsConfirmationModal(true);
  };

  const handleUpdateSettingsSubmit = () => {
    const { username, firstname, lastname, field, about } = settingsInfo;

    const specialCharacterRegex = /[!"#$%&'()*+,-./:;<=>?@[\]^_` {|}~]/g; // handles puntuations and spaces inbetween regex...
    if (
      username.toLowerCase() === "www" ||
      username.toLowerCase() === "app" ||
      username.toLowerCase() === "tuturly" ||
      username.toLowerCase() === "degraphe" ||
      specialCharacterRegex.test(username) === true ||
      username.length === 0
    ) {
      return alert.show("username not valid", {
        type: "error",
      });
    }

    if (firstname.length === 0) {
      return alert.show("firstname not valid", {
        type: "error",
      });
    }

    if (lastname.length === 0) {
      return alert.show("lastname not valid", {
        type: "error",
      });
    }

    if (field.length === 0) {
      return alert.show("field not valid", {
        type: "error",
      });
    }

    if (about.length === 0) {
      return alert.show("about not valid", {
        type: "error",
      });
    }
    const updatesBody = {
      username: username,
      firstname: firstname,
      lastname: lastname,
      field: field,
      about: about,
    };
    postSettingsUpdates(updatesBody);
  };

  const postSettingsUpdates = async (updatesData) => {
    try {
      if (localStorage.getItem("token")) {
        setAuthToken(localStorage.getItem("token"));
      }
      dispatch(startLoading());
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };
      const body = JSON.stringify(updatesData);
      const res = await axios.put(
        "/api/v1/user/account/settings/update",
        body,
        config
      );
      const { user, school } = res.data;
      dispatch({
        type: LOAD_USER,
        payload: user,
      });
      dispatch({
        type: GET_SCHOOL,
        payload: school,
      });
      alert.show("setting updated successfully", {
        type: "success",
      });
      setUpdateSettingsConfirmationModal(false);
      dispatch(stopLoading());
    } catch (error) {
      dispatch(stopLoading());
      setUpdateSettingsConfirmationModal(false);
      const errors = error?.response?.data?.errors;
      if (errors) {
        return errors.forEach((error) => {
          alert.show(error.msg, {
            type: "error",
          });
        });
      }
      alert.show(error.message, {
        type: "error",
      });
    }
  };

  const handleUserAccountDelete = async () => {
    try {
      if (localStorage.getItem("token")) {
        setAuthToken(localStorage.getItem("token"));
      }
      dispatch(startLoading());
      await axios.delete("/api/v1/user/");
      dispatch(logout());
      setDeleteAccountPrompt(false);
      dispatch(stopLoading());
    } catch (error) {
      dispatch(stopLoading());
      setDeleteAccountPrompt(false);
      const errors = error?.response?.data?.errors;
      if (errors) {
        return errors.forEach((error) => {
          alert.show(error.msg, {
            type: "error",
          });
        });
      }
      alert.show(error.message, {
        type: "error",
      });
    }
  };

  useEffect(() => {
    getFieldsList();
    updatePageSelector(23);
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (appState.auth.user !== null) {
      const { username, firstname, lastname, email, field, about } =
        appState?.auth?.user;
      setSettingsInfo({
        username: username,
        firstname: firstname,
        lastname: lastname,
        email: email,
        field: field,
        about: about,
      });
    }
  }, [appState.auth.user]);

  return (
    <>
      <div className="dashboard-layout">
        <Container fluid>
          <Row>
            <DashboardNavbar />
            <Col className="page-actions__col">
              <div className="page-actions">
                <NotificationNavbar />
                <div className="setting__content">
                  <h2 className="settings-page__title">Account Settings</h2>
                  <p className="settings-page__subtitle">
                    Edit profile details and change password
                  </p>
                  <div className="settings-forms__container">
                    <Form onSubmit={(e) => handleFormSubmit(e)}>
                      <FormGroup>
                        <input
                          type="text"
                          class="form__input"
                          placeholder="username"
                          name="username"
                          id="username"
                          required
                          autoFocus
                          value={settingsInfo.username}
                          onChange={(e) =>
                            handleUpdatePageSettingsInfoOnClick(e)
                          }
                        />
                        <label for="username" className="form__label">
                          Username
                        </label>
                        <p className="school-url-info mt-1 ml-3">
                          Your Tuturly URL:
                          <span className="ml-2">{schoolUrl}</span>
                        </p>
                      </FormGroup>
                      <FormGroup>
                        <input
                          type="text"
                          class="form__input"
                          placeholder="First Name"
                          name="firstname"
                          id="firstname"
                          required
                          autoFocus
                          value={settingsInfo.firstname}
                          onChange={(e) =>
                            handleUpdatePageSettingsInfoOnClick(e)
                          }
                        />
                        <label for="firstname" className="form__label">
                          First Name
                        </label>
                      </FormGroup>
                      <FormGroup>
                        <input
                          type="text"
                          class="form__input"
                          placeholder="Last Name"
                          name="lastname"
                          id="lastname"
                          required
                          autoFocus
                          value={settingsInfo.lastname}
                          onChange={(e) =>
                            handleUpdatePageSettingsInfoOnClick(e)
                          }
                        />
                        <label for="lastname" className="form__label">
                          Last Name
                        </label>
                      </FormGroup>

                      <FormGroup>
                        <div className="input-icon__group">
                          <input
                            type="text"
                            className="form__input-extended"
                            placeholder="Email"
                            name="email"
                            id="email"
                            required
                            autoFocus
                            value={settingsInfo.email}
                          />
                          <i
                            class="fa fas fa-lock lock-icon"
                            aria-hidden="true"
                          ></i>
                        </div>
                        <label for="email" className="form__label">
                          Email
                        </label>
                      </FormGroup>

                      <FormGroup>
                        <Input
                          className="form-control-alternative input-Style form__input"
                          type="select"
                          name="field"
                          id="field"
                          required
                          autoFocus
                          placeholder="What Field are you in?"
                          value={settingsInfo.field}
                          onChange={(e) =>
                            handleUpdatePageSettingsInfoOnClick(e)
                          }
                        >
                          <option key="hf3iu43" value="">
                            Choose a Field
                          </option>
                          {fieldResults.map((field) => (
                            <option value={field.title} key={field._id}>
                              {field.title}
                            </option>
                          ))}
                        </Input>
                        <label for="category" className="form__label">
                          Category
                        </label>
                      </FormGroup>
                      <FormGroup>
                        <Input
                          className="form__input"
                          placeholder="About me"
                          rows="5"
                          type="textarea"
                          name="about"
                          autoComplete="off"
                          value={settingsInfo.about}
                          onChange={(e) =>
                            handleUpdatePageSettingsInfoOnClick(e)
                          }
                        />
                        <label for="username" className="form__label">
                          About me
                        </label>
                      </FormGroup>
                      <Button
                        type="submit"
                        className="modal-btn-style settings-button__style"
                        block
                      >
                        Update Account Settings
                      </Button>
                    </Form>
                    <Button
                      className="modal-btn-style-outline settings-button__style"
                      block
                      onClick={() => setUpdatePasswordModalOpen(true)}
                    >
                      Change Password
                    </Button>
                    <Button
                      className="modal-btn-style-outline settings-button__style"
                      block
                      onClick={() => setDeleteAccountPrompt(true)}
                    >
                      Delete Account
                    </Button>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
      <Modal
        className="modal-dialog-centered"
        isOpen={updateSettingsConfirmationModal}
      >
        <div className="modal-header settings-modal__header">
          <h3>Update Settings</h3>
          <div
            className="settings-modal-close__btn"
            onClick={() => setUpdateSettingsConfirmationModal(false)}
          >
            <i className="fas fa-times"></i>
          </div>
        </div>
        <div className="modal-body">
          <p className="text-center">
            Are you sure you want to update Settings ?
          </p>
        </div>
        <div className="modal-footer">
          <Button
            onClick={() => setUpdateSettingsConfirmationModal(false)}
            block
            className="modal-btn-style-outline"
          >
            Cancel
          </Button>
          <Button
            onClick={(e) => handleUpdateSettingsSubmit(e)}
            block
            className="modal-btn-style"
          >
            Update
          </Button>
        </div>
      </Modal>
      <Modal
        className="modal-dialog-centered"
        isOpen={modalSuccessPrompt}
        toggle={toggleModalSuccessPrompt}
      >
        <div className="modal-body">
          <div className="success-modal-content-container">
            <i class="fas fa-thumbs-up"></i>
            <h4>Password changed successfully</h4>
            <Button
              onClick={toggleModalSuccessPrompt}
              className="modal-btn-style-outline success-modal-btn mb-2"
              block
            >
              RETURN TO ACCOUNT SETTINGS
            </Button>
            <Button
              tag={Link}
              to="/dashboard/index"
              className="modal-btn-style"
              block
            >
              RETURN TO DASHBOARD
            </Button>
          </div>
        </div>
      </Modal>
      <ChangePasswordModal
        isUpdatePasswordModalOpen={isUpdatePasswordModalOpen}
        setUpdatePasswordModalOpen={setUpdatePasswordModalOpen}
        setModalSuccessPrompt={setModalSuccessPrompt}
      />
      <Modal
        className="modal-dialog-centered"
        isOpen={deleteAccountPrompt}
        toggle={toggleDeleteAccountPrompt}
      >
        <div className="modal-body">
          <div className="delete-account-modal__content">
            <h2>Warning!</h2>
            <h4>Are you sure you want to delete your Tuturly account ?</h4>
          </div>
        </div>
        <div className="modal-footer">
          <Button
            onClick={() => setDeleteAccountPrompt(false)}
            className="modal-btn-style"
            block
          >
            Cancel, Just kidding
          </Button>
          <Button
            onClick={handleUserAccountDelete}
            className="modal-btn-style-outline mb-2"
            block
          >
            Delete Account
          </Button>
        </div>
      </Modal>
    </>
  );
};

const mapStateToProps = (state) => ({
  user: state.auth.user,
});

export default connect(mapStateToProps)(Settings); // connecting to the
// redux state triggers a rerender for components that use
// values from the redux state...
