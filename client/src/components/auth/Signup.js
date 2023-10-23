import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { useDispatch } from "react-redux";
import { startLoading, stopLoading } from "../../actions/appLoading";
import axios from "axios";
import { useAlert } from "react-alert";
import {
  Row,
  Container,
  Col,
  Button,
  Card,
  CardBody,
  Input,
  Form,
  FormGroup,
} from "reactstrap";
import { Link } from "react-router-dom";
import { SIGNUP_FAIL } from "../../actions/types";
import PublicNavbar from "../layout/PublicNavbar";
import validateEmail from "../../utilities/validateEmail";

import tuturlyLogo from "../../images/tuturlySvgLogo.svg";

import "../../custom-styles/auth/signup.css";

const Signup = () => {
  const alert = useAlert();
  const history = useHistory();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    email:
      localStorage.getItem("userEmail").length > 0
        ? localStorage.getItem("userEmail")
        : "",
    password: "",
  });

  const [validationInfo, setValidationInfo] = useState({
    validEmail: true,
    validPassword: true,
  });
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTermsWarning, setshowTermsWarning] = useState(false);
  const { validEmail, validPassword } = validationInfo;

  const { email, password } = formData;

  const updateEmailValidation = (email) => {
    if (validateEmail(email)) {
      setValidationInfo({
        ...validationInfo,
        validEmail: true,
      });
    } else {
      setValidationInfo({
        ...validationInfo,
        validEmail: false,
      });
    }
  };

  const updatePasswordValidation = (password) => {
    if (password.length >= 6) {
      setValidationInfo({
        ...validationInfo,
        validPassword: true,
      });
    } else {
      setValidationInfo({
        ...validationInfo,
        validPassword: false,
      });
    }
  };

  const updateEmail = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const updatePassword = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // updatePasswordValidation(e.target.value)
  };

  const updateTermsConditionAcceptedState = () => {
    setAcceptedTerms(!acceptedTerms);
    setshowTermsWarning(false);
  };

  const handleEmailValidationOnBlur = () => {
    updateEmailValidation(email);
  };

  const handlePasswordValidationOnBlur = () => {
    updatePasswordValidation(password);
  };

  const submitForm = (e) => {
    e.preventDefault();
    if (acceptedTerms === false) {
      setshowTermsWarning(true);
    } else {
      handleSignUp(formData, history);
    }
  };

  const handleSignUp = async ({ email, password }) => {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const requestBody = { email, password };
    if (localStorage.getItem("ref")) {
      requestBody["ref"] = localStorage.getItem("ref");
    }
    const body = JSON.stringify(requestBody);
    try {
      dispatch(startLoading());
      const res = await axios.post("/api/v1/user/signup", body, config);
      dispatch(stopLoading());
      localStorage.removeItem("ref");
      history.push(`/verify/prompt/${res.data.user._id}`);
    } catch (error) {
      console.log(error);
      const errors = error.response?.data?.errors;
      if (errors) {
        errors.forEach((error) => {
          alert.show(error.msg, {
            type: "error",
          });
        });
      } else {
        alert.show(error.message, {
          type: "error",
        });
      }
      dispatch(stopLoading());
      dispatch({
        type: SIGNUP_FAIL,
      });
    }
  };

  return (
    <>
      <div className="page-wrapper">
        <PublicNavbar />
        <br />
        <br />
        <Container>
          <Row>
            <Col sm="3"></Col>
            <Col sm="6">
              <Card className="card-style">
                <CardBody>
                  <div className="card-logo__container">
                    <img src={tuturlyLogo} alt="..." />
                  </div>
                  <h1 className="text-center page-heading">Sign up</h1>
                  <Form onSubmit={submitForm}>
                    <FormGroup>
                      <Input
                        className="form-control-alternative"
                        placeholder="email"
                        type="email"
                        name="email"
                        value={email}
                        onChange={(e) => updateEmail(e)}
                        onBlur={handleEmailValidationOnBlur}
                        required
                      />
                      {
                        //  email.length > 0 &&
                        !validEmail && (
                          <p className="form-warning">
                            use a valid email address
                          </p>
                        )
                      }
                    </FormGroup>
                    <FormGroup className="remove-margin">
                      <Input
                        className="form-control-alternative"
                        placeholder="password"
                        type="password"
                        name="password"
                        value={password}
                        onChange={(e) => updatePassword(e)}
                        onBlur={handlePasswordValidationOnBlur}
                        required
                      />
                      {
                        // password.length > 0 &&
                        !validPassword && (
                          <p className="form-warning">Invalid password</p>
                        )
                      }
                    </FormGroup>

                    <div className="terms-condition-text">
                      <input
                        id="terms-and-condition-check"
                        type="checkbox"
                        className="terms-and-condition-checkbox"
                        checked={acceptedTerms}
                        onChange={updateTermsConditionAcceptedState}
                      />
                      <label
                        className="ml-2"
                        htmlFor="terms-and-condition-check"
                      >
                        I accept the{" "}
                        <Link to="/tofpp">
                          <span className="terms-condition-highlight">
                            terms of use
                          </span>
                        </Link>{" "}
                        &{" "}
                        <Link to="/tofpp">
                          <span className="terms-condition-highlight">
                            privacy policy
                          </span>
                        </Link>
                      </label>
                      {showTermsWarning && (
                        <p className="form-warning">
                          You must accept our terms of use & privacy policy
                        </p>
                      )}
                    </div>
                    <FormGroup>
                      <Button
                        className="form-btn"
                        type="submit"
                        size="lg"
                        block
                        disabled={!validEmail || !validPassword}
                      >
                        Submit
                      </Button>
                    </FormGroup>
                    <p className="lead login-cta">
                      Already have an account?{" "}
                      <Link to="/signin">Login here</Link>
                    </p>
                  </Form>
                </CardBody>
              </Card>
            </Col>
            <Col sm="3"></Col>
          </Row>
        </Container>
      </div>
    </>
  );
};

export default Signup;
