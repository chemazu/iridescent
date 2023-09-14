import React, { useState, useEffect } from "react";
import axios from "axios";
import { connect, useDispatch } from "react-redux";
import { Container, Form, Input, InputGroup, Button } from "reactstrap";
import PageNavbar from "./PageNavbar";
import setDocumentTitle from "../../utilities/setDocumentTitle";
import { useAlert } from "react-alert";
import { startLoading, stopLoading } from "../../actions/appLoading";

import "../../custom-styles/pages/login.css";
import SubdomainNotFoundPage from "../dashboard/Subdomain404";

const PasswordReset = ({ schoolname }) => {
  const [school, setSchool] = useState(null);
  const [theme, setTheme] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);

  const alert = useAlert();
  const dispatch = useDispatch();

  const [email, setEmail] = useState("");
  const [isSent, setIsSent] = useState(false);

  const handleEmailChangeHandler = (e) => setEmail(e.target.value);

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

  const handlePasswordResetSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(startLoading());
      await axios.get(`/api/v1/student/password/reset/${email}`);
      alert.show("Request Sent", {
        type: "success",
      });
      setIsSent(true);
      setEmail("");
      dispatch(stopLoading());
    } catch (error) {
      alert.show(error.message, {
        type: "error",
      });
      dispatch(stopLoading());
    }
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
          {!pageLoading && school == null && theme === null ? (
            <>
              <SubdomainNotFoundPage schoolName={schoolname} school={school} />
            </>
          ) : (
            <>
              <PageNavbar theme={theme} pageName={schoolname} />
              <div
                style={{
                  backgroundColor: theme.themestyles.primarybackgroundcolor,
                }}
                className="studentlogin-page-contents"
              >
                <Container className="student-login__container">
                  <div
                    style={{
                      maxWidth: "450px",
                    }}
                    className="student-login__card"
                  >
                    <h1
                      style={{
                        color: theme.themestyles.primarytextcolor,
                        fontSize: "30px",
                      }}
                    >
                      Password Reset
                    </h1>
                    <Form onSubmit={(e) => handlePasswordResetSubmit(e)}>
                      <InputGroup>
                        <Input
                          placeholder="Email"
                          type="email"
                          name="email"
                          autoComplete="off"
                          autoCorrect="off"
                          onChange={(e) => handleEmailChangeHandler(e)}
                          className="student-login-input"
                        />
                      </InputGroup>
                      <InputGroup className="form-btn__input-group mt-5">
                        <Button
                          type="submit"
                          className="student-login__btn"
                          style={{
                            color: theme.themestyles.buttontextcolor,
                            backgroundColor:
                              theme.themestyles.buttonbackgroundcolor,
                          }}
                        >
                          Submit
                        </Button>
                      </InputGroup>
                    </Form>
                    {isSent === true && (
                      <>
                        <div className="mt-5">
                          <h5
                            style={{
                              color: theme.themestyles.primarytextcolor,
                            }}
                          >
                            Check Your Email.
                          </h5>
                          <p
                            style={{
                              color: theme.themestyles.primarytextcolor,
                            }}
                          >
                            Thanks. If there's a valid account associated with
                            this email address, we'll send the password reset
                            instructions.
                          </p>
                          <p
                            style={{
                              color: theme.themestyles.primarytextcolor,
                            }}
                          >
                            1. This link is valid for the next 24 hours.
                          </p>
                          <p
                            style={{
                              color: theme.themestyles.primarytextcolor,
                            }}
                          >
                            2. If you don't receive an email within 10 minutes,
                            check your spam folder first and then try again.
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </Container>
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

export default connect(mapStateToProps)(PasswordReset);
