import React, { useState, useEffect } from "react";
import { connect, useDispatch } from "react-redux";
import axios from "axios";
import { Link, useHistory } from "react-router-dom";
import { Container, Form, Input, FormGroup, Button, Label } from "reactstrap";
import { useAlert } from "react-alert";
import PageNavbar from "./PageNavbar";
import setDocumentTitle from "../../utilities/setDocumentTitle";
import { startLoading, stopLoading } from "../../actions/appLoading";

import "../../custom-styles/pages/login.css";
import SubdomainNotFoundPage from "../dashboard/Subdomain404";

const PasswordRenew = ({ match, schoolname }) => {
  const [school, setSchool] = useState(null);
  const [theme, setTheme] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const alert = useAlert();
  const history = useHistory();
  const dispatch = useDispatch();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordMatch, setIsPasswordMatch] = useState(true);

  const [studentDetails, setStudentDetails] = useState(null);
  const [isValidationToken, setIsValidatingToken] = useState(true);

  const updatePasswordOnType = (e) => setPassword(e.target.value);
  const updateConfirmPasswordOnType = (e) => setConfirmPassword(e.target.value);

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

  const validateStudentToken = async (token) => {
    try {
      const res = await axios.get(`/api/v1/student/password/token/${token}`);
      setStudentDetails(res.data);
      setIsValidatingToken(false);
    } catch (error) {
      setStudentDetails(null);
      setIsValidatingToken(false);
      alert.show(error.message, {
        type: "error",
      });
    }
  };

  const handleChangePassword = async () => {
    try {
      dispatch(startLoading());
      if (password.length < 6) {
        dispatch(stopLoading());
        return alert.show("password to short", {
          type: "error",
        });
      }

      if (confirmPassword.length < 6) {
        dispatch(stopLoading());
        return alert.show("password to short", {
          type: "error",
        });
      }

      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };
      const body = JSON.stringify({
        password: password,
        confirmpassword: confirmPassword,
      });

      await axios.put(
        `/api/v1/student/password/change/${studentDetails.id}`,
        body,
        config
      );
      alert.show("Password changed successfully", {
        type: "success",
      });
      history.push("/login");
      dispatch(stopLoading());
    } catch (error) {
      dispatch(stopLoading());
      const errors = error.response.data.errors;
      if (errors) {
        errors.forEach((element) => {
          alert(element.msg);
        });
      }
      alert.show(error.message, {
        type: "error",
      });
    }
  };

  const handlePasswordChangeSubmitHandler = (e) => {
    e.preventDefault();
    handleChangePassword();
  };

  useEffect(() => {
    if (schoolname.length > 0) {
      getSchoolLandingPageContents(schoolname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schoolname]);

  useEffect(() => {
    if (pageLoading === false) {
      if (school !== null && theme !== null) {
        validateStudentToken(match.params.token);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageLoading, school, theme]);

  useEffect(() => {
    if (password !== confirmPassword) {
      setIsPasswordMatch(false);
    } else {
      setIsPasswordMatch(true);
    }
  }, [password, confirmPassword]);

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
                      textAlign: "left",
                    }}
                    className="student-login__card"
                  >
                    {isValidationToken === true ? (
                      <>
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
                            style={{
                              fontSize: "22px",
                              color: theme.themestyles.primarytextcolor,
                            }}
                            className="fas fa-circle-notch fa-spin"
                          ></i>
                        </div>
                      </>
                    ) : (
                      <>
                        {isValidationToken === false &&
                        studentDetails === null ? (
                          <>
                            <h5
                              style={{
                                color: theme.themestyles.primarytextcolor,
                              }}
                            >
                              Link Expired
                            </h5>
                            <p
                              style={{
                                fontSize: "17px",
                                fontWeight: 300,
                                marginTop: "8px",
                                color: theme.themestyles.primarytextcolor,
                              }}
                            >
                              Click{" "}
                              <Link
                                style={{
                                  fontWeight: 700,
                                  fontSize: "18px",
                                  color: theme.themestyles.primarytextcolor,
                                }}
                                to="/login"
                              >
                                Here
                              </Link>{" "}
                              to go to Login Page and Generate A new Link.
                            </p>
                          </>
                        ) : (
                          <>
                            <h1
                              style={{
                                color: theme.themestyles.primarytextcolor,
                                fontSize: "30px",
                              }}
                            >
                              choose new password
                            </h1>
                            <Form
                              onSubmit={(e) =>
                                handlePasswordChangeSubmitHandler(e)
                              }
                            >
                              <FormGroup>
                                <Label
                                  style={{
                                    color: theme.themestyles.primarytextcolor,
                                  }}
                                >
                                  Password
                                </Label>
                                <Input
                                  placeholder="password"
                                  type="password"
                                  autoComplete="off"
                                  autoCorrect="off"
                                  className="student-login-input"
                                  value={password}
                                  onChange={(e) => updatePasswordOnType(e)}
                                />
                              </FormGroup>
                              <FormGroup>
                                <Label
                                  style={{
                                    color: theme.themestyles.primarytextcolor,
                                  }}
                                >
                                  Confirm Password
                                </Label>
                                <Input
                                  placeholder="Confirm password"
                                  type="password"
                                  value={confirmPassword}
                                  autoComplete="off"
                                  autoCorrect="off"
                                  className="student-login-input"
                                  onChange={(e) =>
                                    updateConfirmPasswordOnType(e)
                                  }
                                />
                              </FormGroup>
                              {isPasswordMatch === false && (
                                <>
                                  <p
                                    style={{
                                      color: "#ff3100",
                                      fontSize: "14.5px",
                                      fontWeight: 400,
                                    }}
                                  >
                                    Passwords do not match.
                                  </p>
                                </>
                              )}
                              <FormGroup className="form-btn__input-group mt-5">
                                <Button
                                  type="submit"
                                  style={{
                                    color: theme.themestyles.buttontextcolor,
                                    backgroundColor:
                                      theme.themestyles.buttonbackgroundcolor,
                                  }}
                                  disabled={isPasswordMatch === false}
                                  className="student-login__btn"
                                >
                                  Submit
                                </Button>
                              </FormGroup>
                            </Form>
                          </>
                        )}
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

export default connect(mapStateToProps)(PasswordRenew);
