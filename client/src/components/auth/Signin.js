import React, { useState } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
import { Link, useHistory, useLocation } from "react-router-dom";
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
import { useAlert } from "react-alert";
import { SIGNIN_SUCCESS, SIGNIN_FAIL, LOAD_USER } from "../../actions/types";
import { startLoading, stopLoading } from "../../actions/appLoading";
// import { loadUser } from "../../actions/auth";
import PublicNavbar from "../layout/PublicNavbar";

import tuturlyLogo from "../../images/tuturlySvgLogo.svg";

import "../../custom-styles/auth/signin.css";

const Signin = () => {
  const alert = useAlert();
  const dispatch = useDispatch();
  const history = useHistory();
  const search = useLocation().search;
  const params = new URLSearchParams(search);

  const courseUnitId = params.get("cuid");
  const commentId = params.get("cmid");
  const courseChapter = params.get("ccpt");
  const replyId = params.get("rplid");

  const [userCredentials, setUserCredentials] = useState({
    email: "",
    password: "",
  });

  const updateUserCredentials = (e) =>
    setUserCredentials({
      ...userCredentials,
      [e.target.name]: e.target.value,
    });

  const formSubmit = (e) => {
    e.preventDefault();
    handleSignIn(userCredentials);
  };

  const handleSignIn = async ({ email, password }) => {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const body = JSON.stringify({ email, password });
    try {
      dispatch(startLoading());
      const res = await axios.post("/api/v1/user/signin", body, config);
      if (res.data.user.isverified === true) {
        if (res.data.user.setupComplete === true) {
          dispatch({
            type: SIGNIN_SUCCESS,
            payload: res.data.token,
          });
          dispatch(stopLoading());
          dispatch({
            type: LOAD_USER,
            payload: res.data.user,
          });
          if (params.has("to")) {
            if (params.has("validationRequestId")) {
              const urlConstruct = `/admin/course/review/${params.get(
                "validationRequestId"
              )}`;
              return history.push(urlConstruct);
            } else {
              const urlConstruct =
                replyId !== null
                  ? `/dashboard/notification?cuid=${courseUnitId}&cmid=${commentId}&ccpt=${courseChapter}&rplid=${replyId}`
                  : `/dashboard/notification?cuid=${courseUnitId}&cmid=${commentId}&ccpt=${courseChapter}`;
              return history.push(urlConstruct);
            }
          }
          history.push("/dashboard/index");
        } else {
          dispatch({
            type: SIGNIN_SUCCESS,
            payload: res.data.token,
          });
          dispatch(stopLoading());
          history.push("/account/setup/stepone");
        }
      } else {
        dispatch(stopLoading());
        history.push(`/verify/prompt/${res.data.user._id}`);
      }
    } catch (error) {
      console.log(error);
      const errors = error.response.data.errors;
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
        type: SIGNIN_FAIL,
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
                    <img src={tuturlyLogo} className="img-fluid" alt="..." />
                  </div>
                  <h1 className="text-center page-heading">Login</h1>
                  <Form onSubmit={(e) => formSubmit(e)}>
                    <FormGroup>
                      <Input
                        className="form-control-alternative"
                        placeholder="Johnsmith@gmail.com"
                        type="email"
                        name="email"
                        required
                        onChange={(e) => updateUserCredentials(e)}
                      />
                    </FormGroup>
                    <FormGroup>
                      <Input
                        className="form-control-alternative"
                        placeholder="your password"
                        type="password"
                        name="password"
                        required
                        onChange={(e) => updateUserCredentials(e)}
                      />
                    </FormGroup>
                    <FormGroup>
                      <Button
                        className="form-btn"
                        type="submit"
                        block
                        size="lg"
                      >
                        Submit
                      </Button>
                    </FormGroup>
                    <p className="lead signup-cta">
                      Don't have an account?{" "}
                      <Link to="/signup">Sign up here</Link>
                    </p>
                  </Form>
                </CardBody>
                <div className="change-password_cta text-center">
                  <p>
                    <Link to="/password/reset">Forgot Password?</Link>
                  </p>
                </div>
              </Card>
            </Col>
            <Col sm="3"></Col>
          </Row>
        </Container>
      </div>
    </>
  );
};

export default Signin;
