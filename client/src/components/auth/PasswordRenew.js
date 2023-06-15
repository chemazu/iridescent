import React, { useState, useEffect } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { Link, useHistory } from "react-router-dom";
import {
  Row,
  Container,
  Col,
  Card,
  CardBody,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
} from "reactstrap";
import { useAlert } from "react-alert";
import { startLoading, stopLoading } from "../../actions/appLoading";

import PublicNavbar from "../layout/PublicNavbar";

import "../../custom-styles/auth/signin.css";

const PasswordRenew = ({ match }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [isValidatingToken, setIsValidatingToken] = useState(true);
  const alert = useAlert();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordMatch, setIsPasswordMatch] = useState(true);
  const history = useHistory();
  const dispatch = useDispatch();

  const handlePasswordChange = (e) => setPassword(e.target.value);
  const handleConfirmPasswordChange = (e) => setConfirmPassword(e.target.value);

  const validateUserToken = async (token) => {
    try {
      const res = await axios.get(`/api/v1/user/password/token/${token}`);
      setUserInfo(res.data);
      setIsValidatingToken(false);
    } catch (error) {
      setUserInfo(null);
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
        return alert.show("password to short", {
          type: "error",
        });
      }

      if (confirmPassword.length < 6) {
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
        `/api/v1/user/password/change/${userInfo.id}`,
        body,
        config
      );
      alert.show("Password changed successfully", {
        type: "success",
      });
      history.push("/signin");
      dispatch(stopLoading());
    } catch (error) {
      const errors = error.response.data.errors;
      if (errors) {
        errors.forEach((element) => {
          alert(element.msg);
        });
      }
      alert.show(error.message, {
        type: "error",
      });
      dispatch(stopLoading());
    }
  };

  const handlePasswordChangeSubmit = (e) => {
    e.preventDefault();
    handleChangePassword();
  };

  useEffect(() => {
    validateUserToken(match.params.token);
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (password !== confirmPassword) {
      setIsPasswordMatch(false);
    } else {
      setIsPasswordMatch(true);
    }
  }, [password, confirmPassword]);

  return (
    <>
      <div className="page-wrapper">
        <PublicNavbar />
        <br />
        <br />
        <Container>
          <Row>
            <Col sm="2"></Col>
            <Col sm="8">
              {isValidatingToken === true && userInfo === null ? (
                <>
                  <Card
                    style={{
                      width: "100%",
                      height: "40vh",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    className="card-style"
                  >
                    <p>Loading...</p>
                  </Card>
                </>
              ) : (
                <>
                  {isValidatingToken === false && userInfo === null ? (
                    <>
                      <Card
                        style={{
                          width: "100%",
                          height: "40vh",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        className="card-style"
                      >
                        <h5>Link Expired</h5>
                        <p
                          style={{
                            fontSize: "17px",
                            fontWeight: 300,
                            marginTop: "8px",
                          }}
                        >
                          Click{" "}
                          <Link
                            style={{
                              fontWeight: 700,
                              fontSize: "18px",
                              color: "#ff3100",
                            }}
                            to="/signin"
                          >
                            Here
                          </Link>{" "}
                          to go to Login Page and Generate A new Link.
                        </p>
                      </Card>
                    </>
                  ) : (
                    <>
                      <Card style={{ width: "100%" }} className="card-style">
                        <CardBody>
                          <h4 className="page-heading">Choose New Password</h4>
                          <Form onSubmit={(e) => handlePasswordChangeSubmit(e)}>
                            <FormGroup>
                              <Label>Password</Label>
                              <Input
                                className="form-control-alternative"
                                placeholder="Password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => handlePasswordChange(e)}
                              />
                            </FormGroup>
                            <FormGroup>
                              <Label>Confirm Password</Label>
                              <Input
                                className="form-control-alternative"
                                placeholder="Confirm Password"
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => handleConfirmPasswordChange(e)}
                              />
                            </FormGroup>
                            {isPasswordMatch === false && (
                              <p
                                style={{
                                  color: "#ff3100",
                                  fontSize: "14.5px",
                                  fontWeight: 400,
                                }}
                              >
                                Passwords do not match.
                              </p>
                            )}
                            <FormGroup className="mt-5">
                              <Button
                                className="form-btn"
                                type="submit"
                                block
                                size="lg"
                                onClick={handleChangePassword}
                                disabled={isPasswordMatch === false}
                              >
                                Submit
                              </Button>
                            </FormGroup>
                          </Form>
                        </CardBody>
                      </Card>
                    </>
                  )}
                </>
              )}
            </Col>
            <Col sm="2"></Col>
          </Row>
        </Container>
      </div>
    </>
  );
};

export default PasswordRenew;
