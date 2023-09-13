import React, { useState, useEffect } from "react";
import { connect, useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import axios from "axios";
import {
  Container,
  Row,
  Col,
  Button,
  Card,
  CardBody,
  Form,
  FormGroup,
} from "reactstrap";
import { useAlert } from "react-alert";
import { UPDATE_ACCOUNT_STEP_ONE } from "../../actions/types";
import { startLoading, stopLoading } from "../../actions/appLoading";
import SetupPageNavbar from "../layout/SetupPageNavbar";

import "../../custom-styles/account-setup/setuppageone.css";

const Setuppageone = ({ user }) => {
  const dispatch = useDispatch();
  const alert = useAlert();
  const history = useHistory();

  const specialCharacterRegex = /[!"#$%&'()*+,-./:;<=>?@[\]^_` {|}~]/g; // handles puntuations and spaces inbetween regex...
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    username: "",
  });
  const [validationInfo, setValidationInfo] = useState({
    validFirstname: true,
    validLastname: true,
    validUsername: true,
  });

  const [existingUserByUsername, setExistingUserByUsername] = useState([]);

  const { firstname, lastname, username } = formData;
  const { validFirstname, validLastname, validUsername } = validationInfo;
  const updateFormData = (e, validationName) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (e.target.value.length === 0) {
      setValidationInfo({
        ...validationInfo,
        [validationName]: false,
      });
    } else if (e.target.value.length > 0) {
      setValidationInfo({
        ...validationInfo,
        [validationName]: true,
      });
    }
  };

  const checkInputOnBlur = (e, validationName) => {
    if (e.target.value.length === 0) {
      setValidationInfo({
        ...validationInfo,
        [validationName]: false,
      });
    } else if (e.target.value.length > 0) {
      setValidationInfo({
        ...validationInfo,
        [validationName]: true,
      });
    }
  };

  const getExistingUserByUsername = async (searchQuery) => {
    try {
      if (searchQuery.length !== 0) {
        const res = await axios.get(
          `/api/v1/user/account/setup/existinguser/username?username=${searchQuery}`
        );
        setExistingUserByUsername(res.data);
      } else {
        return;
      }
    } catch (error) {
      console.log(error);
    }
  };

  const accountSetup = async ({ firstname, lastname, username }) => {
    try {
      dispatch(startLoading());
      const payload = {
        firstname,
        lastname,
        username,
      };
      dispatch({
        type: UPDATE_ACCOUNT_STEP_ONE,
        payload,
      });
      dispatch(stopLoading());
      history.push("/account/setup/steptwo");
    } catch (error) {
      console.log(error);
      alert.show(error.message, {
        type: "error",
      });
    }
  };

  useEffect(() => {
    if (username?.length > 0) {
      getExistingUserByUsername(username);
    } else {
      return;
    }
  }, [username]);

  useEffect(() => {
    if (user !== null) {
      let userFirstName = user.firstname;
      let userLastname = user.lastname;
      let userName = user.username;
      setFormData({
        firstname: userFirstName,
        lastname: userLastname,
        username: userName,
      });
    }
  }, [user]);

  const submitData = (e) => {
    e.preventDefault();
    if (
      username.toLowerCase() === "www" ||
      username.toLowerCase() === "app" ||
      username.toLowerCase() === "tuturly" ||
      username.toLowerCase() === "degraphe" ||
      specialCharacterRegex.test(username) === true
    ) {
      return alert.show("username not valid.", {
        type: "error",
      });
    }
    accountSetup(formData);
  };

  return (
    <>
      <div className="page-wrapper-account-setup">
        <SetupPageNavbar />
        <br />
        <br />
        <Container>
          <Row>
            <Col md="2" sm="2"></Col>
            <Col md="8" sm="8">
              <div className="progress-container">
                <div className="step-counter text-center mr-5">
                  <div className="step-counter-number step-counter-number__coloured">
                    1
                  </div>
                  <div className="step-counter-text">Basic info</div>
                </div>
                <div className="step-counter text-center">
                  <div className="step-counter-number">2</div>
                  <div className="step-counter-text">Profile</div>
                </div>
              </div>
              <Card className="account-setup__page">
                <CardBody>
                  <h1 className="setup-info mb-5 mt-2 text-center">
                    Fill in the form to complete account setup
                  </h1>
                  <Form onSubmit={(e) => submitData(e)}>
                    <FormGroup>
                      <input
                        type="text"
                        class="form__input"
                        placeholder="First name"
                        name="firstname"
                        id="firstname"
                        value={firstname}
                        onChange={(e) => updateFormData(e, "validFirstname")}
                        onBlur={(e) => checkInputOnBlur(e, "validFirstname")}
                        required
                        autoFocus
                        autoComplete="off"
                      />
                      <label for="firstname" className="form__label">
                        First Name
                      </label>
                      {!validFirstname && (
                        <p className="form-warning">
                          firstname cannot be empty
                        </p>
                      )}
                    </FormGroup>
                    <FormGroup>
                      <input
                        type="text"
                        class="form__input"
                        placeholder="Last name"
                        name="lastname"
                        id="lastname"
                        value={lastname}
                        onChange={(e) => updateFormData(e, "validLastname")}
                        onBlur={(e) => checkInputOnBlur(e, "validLastname")}
                        required
                        autoComplete="off"
                      />
                      <label for="lastname" className="form__label">
                        Last Name
                      </label>
                      {!validLastname && (
                        <p className="form-warning">lastname cannot be empty</p>
                      )}
                    </FormGroup>
                    <FormGroup>
                      <input
                        type="text"
                        class="form__input"
                        placeholder="Username"
                        name="username"
                        id="username"
                        value={username}
                        onChange={(e) => updateFormData(e, "validUsername")}
                        onBlur={(e) => checkInputOnBlur(e, "validUsername")}
                        required
                        autoComplete="off"
                      />
                      <label for="username" className="form__label">
                        Username
                      </label>
                      <div className="username-info">
                        Your username would be used to form your personal URL,
                        so select this very carefully
                      </div>
                      {!validUsername && (
                        <p className="form-warning">Username cannot be empty</p>
                      )}
                      {existingUserByUsername.length > 0 && (
                        <p className="form-warning">username already exists</p>
                      )}
                      {specialCharacterRegex.test(username) === true && (
                        <p className="form-warning">
                          username can only contain alphabets and number
                        </p>
                      )}
                      {(username?.toLowerCase() === "www" ||
                        username?.toLowerCase() === "app" ||
                        username?.toLowerCase() === "tuturly" ||
                        username?.toLowerCase() === "degraphe") && (
                        <p className="form-warning">
                          username can not be any of the following text: "www",
                          "app" or "tuturly"
                        </p>
                      )}
                    </FormGroup>
                    <FormGroup className="mt-5 btn-form-group-container">
                      <Button
                        className="accout-setup-btn"
                        type="submit"
                        size="lg"
                        disabled={
                          !validFirstname ||
                          !validLastname ||
                          !validUsername ||
                          specialCharacterRegex.test(username) === true ||
                          existingUserByUsername.length > 0
                        }
                      >
                        Next
                      </Button>
                    </FormGroup>
                  </Form>
                </CardBody>
              </Card>
            </Col>
            <Col md="2" sm="2"></Col>
          </Row>
        </Container>
        <br />
        <br />
      </div>
    </>
  );
};

const mapStateToProps = (state) => ({
  user: state.auth.user,
});

export default connect(mapStateToProps)(Setuppageone);
