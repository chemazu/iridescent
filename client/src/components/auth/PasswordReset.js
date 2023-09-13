import React, { useState } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
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
import PublicNavbar from "../layout/PublicNavbar";
import { startLoading, stopLoading } from "../../actions/appLoading";

import "../../custom-styles/auth/signin.css";

const PasswordReset = () => {
  const alert = useAlert();
  const dispatch = useDispatch();

  const [email, setEmail] = useState("");
  const [isSent, setIsSent] = useState(false);

  const handleFormUpdate = (e) => setEmail(e.target.value);

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    try {
      dispatch(startLoading());
      await axios.get(`/api/v1/user/password/reset/${email}`);
      alert.show("Request Sent", {
        type: "success",
      });
      dispatch(stopLoading());
      setIsSent(true);
      setEmail("");
    } catch (error) {
      alert.show(error.message, {
        type: "error",
      });
      dispatch(stopLoading());
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
            <Col sm="2"></Col>
            <Col sm="8">
              <Card
                style={{
                  width: "100%",
                }}
                className="card-style"
              >
                <CardBody>
                  <h4 className="page-heading">Reset Password</h4>
                  <Form onSubmit={handlePasswordReset}>
                    <FormGroup>
                      <Label>Email</Label>
                      <Input
                        className="form-control-alternative"
                        placeholder="Johnsmith@gmail.com"
                        type="email"
                        name="email"
                        value={email}
                        onChange={(e) => handleFormUpdate(e)}
                        required
                      />
                    </FormGroup>
                    <FormGroup className="mt-5">
                      <Button
                        className="form-btn"
                        type="submit"
                        block
                        size="lg"
                      >
                        Submit
                      </Button>
                    </FormGroup>
                  </Form>
                </CardBody>
              </Card>
              {isSent === true && (
                <>
                  <div className="passord-reset-link-sent__instructions mt-4">
                    <h5>Check Your Email.</h5>
                    <p>
                      Thanks. If there's a Tuturly account associated with this
                      email address, we'll send the password reset instructions.
                    </p>
                    <p> 1. This link is valid for the next 24 hours. </p>
                    <p>
                      2. If you don't receive an email within 10 minutes, check
                      your spam folder first and then try again.
                    </p>
                  </div>
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

export default PasswordReset;
