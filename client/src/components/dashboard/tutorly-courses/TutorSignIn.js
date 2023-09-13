import React, { useState, useEffect } from "react";
import axios from "axios";
import { useStore, useDispatch } from "react-redux";
import { Container, Form, Input, InputGroup, Button } from "reactstrap";
import {
  Link,
  useHistory,
  //  useLocation
} from "react-router-dom";
import SecondaryPagesNavbar from "./SecondaryPagesNavbar";
import { useAlert } from "react-alert";

import { TUTOR_SIGNIN_FAIL, TUTOR_SIGNIN } from "../../../actions/types";

import { startLoading, stopLoading } from "../../../actions/appLoading";
import setDocumentTitle from "../../../utilities/setDocumentTitle";

const TutorSignin = () => {
  const [formDetails, setFormDetails] = useState({
    email: "",
    password: "",
  });

  const updateFormInfo = (e) =>
    setFormDetails({
      ...formDetails,
      [e.target.name]: e.target.value,
    });

  const alert = useAlert();
  const history = useHistory();
  const dispatch = useDispatch();
  // const search = useLocation().search;
  // const params = new URLSearchParams(search);

  // const courseUnitId = params.get("cuid");
  // const commentId = params.get("cmid");
  // const courseChapter = params.get("ccpt");
  // const replyId = params.get("rplid");

  const store = useStore();
  const state = store.getState();
  const schoolname = state.subdomain;

  const tutorSignin = async (schoolname, tutorDetails) => {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const body = JSON.stringify(tutorDetails);
    try {
      dispatch(startLoading());
      const res = await axios.post("/api/v1/tutor/login", body, config);
      dispatch({
        type: TUTOR_SIGNIN,
        payload: res.data,
      });
      alert.show("signin completed successfully", {
        type: "success",
      });
      dispatch(stopLoading());
      // if (params.has("to")) {
      //   const urlConstruct =
      //     replyId !== null
      //       ? `/dashboard/page/notification?cuid=${courseUnitId}&cmid=${commentId}&ccpt=${courseChapter}&rplid=${replyId}`
      //       : `/dashboard/page/notification?cuid=${courseUnitId}&cmid=${commentId}&ccpt=${courseChapter}`;
      //   return history.push(urlConstruct);
      // }
      if (history) history.push(`/tutor/dashboard/home`);
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
        type: TUTOR_SIGNIN_FAIL,
      });
    }
  };

  const handleLoginFormSubmit = (e) => {
    e.preventDefault();
    tutorSignin(schoolname, formDetails);
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
      <Container className="student-login__container">
        <div className="student-login__card">
          <h1>Tutor Login</h1>
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
              <Button type="submit" className="student-login__btn">
                Login
              </Button>
            </InputGroup>
          </Form>
          <p className="mt-5 create-account_cta">
            Don't Have An Account?{" "}
            <Link to={`/tutor/register`}>Sign up here</Link>
          </p>
          <br />
          <Link to="/password/reset">Forgot Password ?</Link>
        </div>
      </Container>
    </>
  );
};

export default TutorSignin;
