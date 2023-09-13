import React, { useState, useEffect } from "react";
import { Container, Form, InputGroup, Input, Button } from "reactstrap";
import { useStore, useDispatch } from "react-redux";
import { Link, useHistory } from "react-router-dom";
import axios from "axios";
import { useAlert } from "react-alert";
import SecondaryPagesNavbar from "./SecondaryPagesNavbar";
import { startLoading, stopLoading } from "../../../actions/appLoading";
import { STUDENT_SIGNUP, STUDENT_SIGNUP_FAIL } from "../../../actions/types";
import setDocumentTitle from "../../../utilities/setDocumentTitle";

const Signup = () => {
  const store = useStore();
  const state = store.getState();
  const dispatch = useDispatch();
  const schoolname = state.subdomain;

  const [signupDetails, setSignupDetails] = useState({
    firstname: "",
    lastname: "",
    email: "",
    username: "",
    password: "",
  });
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTermsWarning, setshowTermsWarning] = useState(false);
  const alert = useAlert();
  const history = useHistory();

  const updateTermsConditionAcceptedState = () => {
    setAcceptedTerms(!acceptedTerms);
    setshowTermsWarning(false);
  };

  const updateSignupDetails = (e) =>
    setSignupDetails({
      ...signupDetails,
      [e.target.name]: e.target.value,
    });

  const onFormSubmit = (e) => {
    e.preventDefault();
    if (signupDetails.firstname.length === 0) {
      return alert.show("firstname not valid", { type: "error" });
    }
    if (signupDetails.lastname.length === 0) {
      return alert.show("lastname not valid", { type: "error" });
    }
    if (signupDetails.email.length === 0) {
      return alert.show("email not valid", { type: "error" });
    }
    if (signupDetails.username.length === 0) {
      return alert.show("username not valid", { type: "error" });
    }
    if (signupDetails.password.length === 0) {
      return alert.show("password not valid", { type: "error" });
    }
    if (acceptedTerms === false) {
      setshowTermsWarning(true);
    } else {
      signup(schoolname, signupDetails);
    }
  };

  const signup = async (schoolName, studentDetails) => {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const body = JSON.stringify(studentDetails);
    try {
      dispatch(startLoading());
      const res = await axios.post(
        `/api/v1/student/signup/${schoolName}`,
        body,
        config
      );
      dispatch({
        type: STUDENT_SIGNUP,
        payload: res.data,
      });
      alert.show("signed up completed", {
        type: "success",
      });
      dispatch(stopLoading());
      if (history) {
        history.push(`/dashboard/home`);
      }
    } catch (error) {
      const errors = error.response.data.errors;
      if (errors) {
        errors.forEach((error) => {
          alert.show(error.msg, {
            type: "error",
          });
        });
      }
      dispatch(stopLoading());
      dispatch({
        type: STUDENT_SIGNUP_FAIL,
      });
    }
  };

  useEffect(() => {
    const data = {
      name: schoolname,
    };
    setDocumentTitle(data);
  }, [schoolname]);

  return (
    <>
      <SecondaryPagesNavbar />
      <Container className="student-enroll__container">
        <div className="student-enroll__card">
          <h1>Student Sign Up</h1>
          <Form onSubmit={(e) => onFormSubmit(e)}>
            <InputGroup>
              <Input
                placeholder="Firstname"
                type="text"
                name="firstname"
                required
                value={signupDetails.firstname}
                onChange={(e) => updateSignupDetails(e)}
                className="student-enrollment-input"
              />
            </InputGroup>
            <InputGroup>
              <Input
                placeholder="Lastname"
                type="text"
                name="lastname"
                required
                value={signupDetails.lastname}
                onChange={(e) => updateSignupDetails(e)}
                className="student-enrollment-input"
              />
            </InputGroup>
            <InputGroup>
              <Input
                placeholder="Email"
                type="email"
                name="email"
                required
                value={signupDetails.email}
                onChange={(e) => updateSignupDetails(e)}
                className="student-enrollment-input"
              />
            </InputGroup>
            <InputGroup>
              <Input
                placeholder="Username"
                type="username"
                name="username"
                required
                value={signupDetails.username}
                onChange={(e) => updateSignupDetails(e)}
                className="student-enrollment-input"
              />
            </InputGroup>
            <InputGroup>
              <Input
                placeholder="Password"
                type="password"
                name="password"
                required
                value={signupDetails.password}
                onChange={(e) => updateSignupDetails(e)}
                className="student-enrollment-input"
              />
            </InputGroup>
            <div className="erollment-terms-condition-text">
              <input
                id="terms-and-condition-check"
                type="checkbox"
                className="terms-and-condition-checkbox"
                checked={acceptedTerms}
                onChange={updateTermsConditionAcceptedState}
              />
              <label className="ml-2" htmlFor="terms-and-condition-check">
                i accept the{" "}
                <span className="student_enroll-terms-condition-highlight">
                  terms of use
                </span>{" "}
                &
                <span className="student_enroll-terms-condition-highlight">
                  privacy policy
                </span>
              </label>
              {showTermsWarning && (
                <p className="enrollment-form-warning">
                  You must accept our terms of use & privacy policy
                </p>
              )}
            </div>
            <InputGroup className="form-btn__input-group">
              <Button type="submit" className="student-enrollment__btn">
                Enroll
              </Button>
            </InputGroup>
          </Form>
          <p className="mt-2 signup_cta">
            Already Have An Account? <Link to={`/signin`}>Login here</Link>
          </p>
        </div>
      </Container>
    </>
  );
};

export default Signup;
