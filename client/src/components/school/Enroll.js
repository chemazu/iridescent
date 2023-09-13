import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import axios from "axios";
import { withRouter, Link } from "react-router-dom";
import { useAlert } from "react-alert";
import { Container, Form, InputGroup, Input, Button } from "reactstrap";
import { studentSignUp } from "../../actions/student";
import setDocumentTitle from "../../utilities/setDocumentTitle";
import PageNavbar from "./PageNavbar";
import SubdomainNotFoundPage from "../dashboard/Subdomain404";

import "../../custom-styles/pages/enroll.css";

const Enroll = ({ match, signup, history, schoolname }) => {
  const [school, setSchool] = useState(null);
  const [theme, setTheme] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);

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

  const updateTermsConditionAcceptedState = () => {
    setAcceptedTerms(!acceptedTerms);
    setshowTermsWarning(false);
  };

  const updateSignupDetails = (e) =>
    setSignupDetails({
      ...signupDetails,
      [e.target.name]: e.target.value,
    });

  const getSchoolBySchoolName = async (schoolname) => {
    try {
      const res = await axios.get(`/api/v1/school/${schoolname}`);
      setSchool(res.data);
      return res.data;
    } catch (error) {
      if (error.response.status === 404) {
        setSchool(null);
        setPageLoading(false);
      }
      console.log(error.response.data.errors[0].msg);
      return null;
    }
  };

  const getSchoolThemeBySchoolId = async (schoolId) => {
    try {
      const res = await axios.get(`/api/v1/theme/${schoolId}`);
      setTheme(res.data);
    } catch (error) {
      if (error.response.status === 404) {
        setTheme(null);
        setPageLoading(false);
      }
      console.log(error.response.data.errors[0].msg);
      return null;
    }
  };

  const getSchoolLandingPageContents = async (schoolName) => {
    setPageLoading(true);
    const school = await getSchoolBySchoolName(schoolName);
    if (school) {
      await getSchoolThemeBySchoolId(school._id);
    }
    setPageLoading(false);
  };

  useEffect(() => {
    if (schoolname.length > 0) {
      getSchoolLandingPageContents(schoolname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schoolname]);

  useEffect(() => {
    if (school) {
      setDocumentTitle(school);
    }
  }, [school]);

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
      signup(schoolname, signupDetails, history);
    }
  };

  return (
    <>
      {pageLoading === true ? (
        <div
          style={{
            width: "50%",
            margin: "20px auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <i
            style={{ fontSize: "22px" }}
            className="fas fa-circle-notch fa-spin"
          ></i>
        </div>
      ) : (
        <>
          {!pageLoading && school === null && theme === null ? (
            <SubdomainNotFoundPage schoolName={schoolname} school={school} />
          ) : (
            <>
              <PageNavbar theme={theme} pageName={schoolname} />
              <div
                style={{
                  backgroundColor: theme.themestyles.primarybackgroundcolor,
                }}
                className="studentenroll-page-contents"
              >
                <Container className="student-enroll__container">
                  <div className="student-enroll__card">
                    <h1
                      style={{
                        color: theme.themestyles.primarytextcolor,
                      }}
                    >
                      Enrollment
                    </h1>
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
                        <label
                          style={{
                            color: theme.themestyles.primarytextcolor,
                          }}
                          className="ml-2"
                          htmlFor="terms-and-condition-check"
                        >
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
                          <p
                            style={{
                              color: theme.themestyles.primarytextcolor,
                            }}
                            className="enrollment-form-warning"
                          >
                            You must accept our terms of use & privacy policy
                          </p>
                        )}
                      </div>
                      <InputGroup className="form-btn__input-group">
                        <Button
                          type="submit"
                          className="student-enrollment__btn"
                          style={{
                            color: theme.themestyles.buttontextcolor,
                            backgroundColor:
                              theme.themestyles.buttonbackgroundcolor,
                          }}
                        >
                          Enroll
                        </Button>
                      </InputGroup>
                    </Form>
                    <p
                      style={{
                        color: theme.themestyles.primarytextcolor,
                      }}
                      className="mt-2 signup_cta"
                    >
                      Already Have An Account?{" "}
                      <Link to={`/login`}>Login here</Link>
                    </p>
                  </div>
                </Container>
              </div>
              <div
                style={{
                  backgroundColor: theme.themestyles.footerbackgroundcolor,
                  borderTop: `0.2px solid ${theme.themestyles.primarytextcolor}`,
                }}
                className="studentenrollment-page-footer"
              >
                <p
                  style={{
                    color: theme.themestyles.footertextcolor,
                  }}
                >
                  Copyright {new Date().getFullYear()} - {schoolname}
                </p>
              </div>
            </>
          )}
        </>
      )}
    </>
  );
};

const mapStateToProps = (state) => ({
  schoolname: state.subdomain,
});

const mapDispatchToProps = (dispatch) => ({
  signup: (schoolname, signupDetails, history) =>
    dispatch(studentSignUp(schoolname, signupDetails, history)),
});

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Enroll));
