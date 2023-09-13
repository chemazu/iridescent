import React, { useState, useEffect } from "react";
import axios from "axios";
import { useStore, useDispatch } from "react-redux";
import { Container, Form, Input, InputGroup, Button } from "reactstrap";
import { Link, useHistory, useLocation } from "react-router-dom";
import { useAlert } from "react-alert";
import { STUDENT_SIGNIN_FAIL, STUDENT_SIGNIN } from "../../actions/types";
import { startLoading, stopLoading } from "../../actions/appLoading";
import PageNavbar from "./PageNavbar";
import setDocumentTitle from "../../utilities/setDocumentTitle";

import "../../custom-styles/pages/login.css";
import SubdomainNotFoundPage from "../dashboard/Subdomain404";

const Login = ({ signin }) => {
  const [school, setSchool] = useState(null);
  const [theme, setTheme] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);

  const alert = useAlert();
  const history = useHistory();
  const dispatch = useDispatch();
  const search = useLocation().search;
  const params = new URLSearchParams(search);

  const courseUnitId = params.get("cuid");
  const commentId = params.get("cmid");
  const courseChapter = params.get("ccpt");
  const replyId = params.get("rplid");

  const store = useStore();
  const state = store.getState();
  const schoolname = state.subdomain;

  const [formDetails, setFormDetails] = useState({
    email: "",
    password: "",
  });

  const updateFormInfo = (e) =>
    setFormDetails({
      ...formDetails,
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

  const studentSignIn = async (schoolname, studentDetails, history) => {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const body = JSON.stringify(studentDetails);
    try {
      dispatch(startLoading());
      const res = await axios.post(
        `/api/v1/student/signin/${schoolname}`,
        body,
        config
      );
      dispatch({
        type: STUDENT_SIGNIN,
        payload: res.data,
      });
      alert.show("signin completed successfully", {
        type: "success",
      });
      dispatch(stopLoading());
      if (params.has("to")) {
        const urlConstruct =
          replyId !== null
            ? `/dashboard/page/notification?cuid=${courseUnitId}&cmid=${commentId}&ccpt=${courseChapter}&rplid=${replyId}`
            : `/dashboard/page/notification?cuid=${courseUnitId}&cmid=${commentId}&ccpt=${courseChapter}`;
        return history.push(urlConstruct);
      }
      if (history) history.push(`/dashboard/courses`);
    } catch (error) {
      const errors = error?.response?.data?.errors;
      if (errors) {
        errors.forEach((error) => {
          alert.show(error.msg, {
            type: "error",
          });
        });
      }
      dispatch(stopLoading());
      dispatch({
        type: STUDENT_SIGNIN_FAIL,
      });
    }
  };

  const handleLoginFormSubmit = (e) => {
    e.preventDefault();
    studentSignIn(schoolname, formDetails, history);
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
                  <div className="student-login__card">
                    <h1
                      style={{
                        color: theme.themestyles.primarytextcolor,
                      }}
                    >
                      {" "}
                      Login
                    </h1>
                    <Form onSubmit={(e) => handleLoginFormSubmit(e)}>
                      <InputGroup>
                        <Input
                          placeholder="Email"
                          type="email"
                          name="email"
                          value={formDetails.email}
                          autoComplete="off"
                          autoCorrect="off"
                          className="student-login-input"
                          onChange={(e) => updateFormInfo(e)}
                        />
                      </InputGroup>
                      <InputGroup>
                        <Input
                          placeholder="Password"
                          type="password"
                          name="password"
                          value={formDetails.password}
                          autoComplete="off"
                          autoCorrect="off"
                          className="student-login-input"
                          onChange={(e) => updateFormInfo(e)}
                        />
                      </InputGroup>
                      <InputGroup className="form-btn__input-group">
                        <Button
                          type="submit"
                          className="student-login__btn"
                          style={{
                            color: theme.themestyles.buttontextcolor,
                            backgroundColor:
                              theme.themestyles.buttonbackgroundcolor,
                          }}
                        >
                          Login
                        </Button>
                      </InputGroup>
                    </Form>
                    <p
                      style={{
                        color: theme.themestyles.primarytextcolor,
                      }}
                      className="mt-5 create-account_cta"
                    >
                      Don't Have An Account?{" "}
                      <Link to={`/enroll`}>Sign up here</Link>
                    </p>
                    <br />
                    <Link
                      style={{
                        color: theme.themestyles.primarytextcolor,
                        fontWeight: 500,
                      }}
                      to="/password-reset"
                    >
                      Forgot Password ?
                    </Link>
                  </div>
                </Container>
              </div>
              <div
                style={{
                  backgroundColor: theme.themestyles.footerbackgroundcolor,
                  borderTop: `0.2px solid ${theme.themestyles.primarytextcolor}`,
                }}
                className="studentlogin-page-footer"
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

export default Login;
