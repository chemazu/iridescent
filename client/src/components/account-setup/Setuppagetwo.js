import React, { useState, useEffect } from "react";
import { useDispatch, useStore } from "react-redux";
import { useHistory } from "react-router-dom";
import axios from "axios";
import {
  Container,
  Col,
  Row,
  Card,
  CardBody,
  Form,
  FormGroup,
  Input,
  Button,
} from "reactstrap";
import { useAlert } from "react-alert";
import {
  UPDATE_ACCOUNT_STEP_TWO,
  UPDATE_ACCOUNT_STEP_TWO_FAIL,
} from "../../actions/types";
import { startLoading, stopLoading } from "../../actions/appLoading";
import SetupPageNavbar from "../layout/SetupPageNavbar";
import setAuthToken from "../../utilities/setAuthToken";

import "../../custom-styles/account-setup/setuppagetwo.css";

const Setuppagetwo = () => {
  const alert = useAlert();
  const dispatch = useDispatch();
  const history = useHistory();
  const appState = useStore().getState();

  const [formData, setFormData] = useState({
    field: "",
    about: "",
  });

  const [other, setOtherText] = useState("");

  const [validationInfo, setValidationInfo] = useState({
    validField: true,
  });
  const [fieldResults, setFieldResults] = useState([]);

  const { field, about } = formData;

  const getFieldsOnType = async (query = "") => {
    try {
      const res = await axios.get(
        `/api/v1/coursetype/coursetitle?data=${query}`
      );
      setFieldResults(res.data);
    } catch (error) {
      alert.show(error, {
        type: "error",
      });
      console.log(error);
    }
  };

  const updateFormData = (e) =>
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

  const { validField } = validationInfo;

  const checkInputsOnBlur = (e, validationName) => {
    if (e.target.value.length === 0) {
      setValidationInfo({
        ...validationInfo,
        [validationName]: false,
      });
    } else {
      setValidationInfo({
        ...validationInfo,
        [validationName]: true,
      });
    }
  };

  const dropDownChangehandler = (e) => {
    setFormData({
      ...formData,
      field: e.target.value,
    });
  };

  const accountSetup = async ({ field, about }) => {
    if (localStorage.token) {
      setAuthToken(localStorage.token);
    }
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    const reqBody = {};
    reqBody["field"] = field;
    reqBody["about"] = about;

    if (other.length > 0) reqBody["other"] = other;

    const body = JSON.stringify({
      ...appState.auth.user,
      ...reqBody,
    });
    try {
      dispatch(startLoading());
      const res = await axios.put(
        "/api/v1/user/account/setup/stepcomplete",
        body,
        config
      );
      dispatch({
        type: UPDATE_ACCOUNT_STEP_TWO,
        payload: res.data.user,
      });
      // dispatch to add the school data to the state
      dispatch(stopLoading());
      history.push("/dashboard/index");
    } catch (error) {
      dispatch(stopLoading());
      const errors = error.response.data.errors;
      if (errors) {
        errors.forEach((error) => {
          alert.show(error.msg, {
            type: "error",
          });
        });
        dispatch({
          type: UPDATE_ACCOUNT_STEP_TWO_FAIL,
        });
      }
      alert.show("Error Creating Account.", {
        type: "error",
      });
    }
  };

  const submitData = (e) => {
    e.preventDefault();
    if (field.toLowerCase() === "other" && other.length === 0) {
      return alert.show("other text cannot be empty", {
        type: "error",
      });
    }
    accountSetup(formData, history);
  };

  useEffect(() => {
    getFieldsOnType();
    // eslint-disable-next-line
  }, []);

  return (
    <>
      <div className="page-wrapper-account-setup">
        <SetupPageNavbar />
        <br />
        <br />
        <Container>
          <Row>
            <Col md="2" sm="2"></Col>
            <Col md="8" sm="8">
              <div className="progress-container">
                <div className="step-counter text-center mr-5">
                  <div className="step-counter-number step-counter-number__coloured">
                    1
                  </div>
                  <div className="step-counter-text">Basic info</div>
                </div>
                <div className="step-counter text-center">
                  <div className="step-counter-number step-counter-number__coloured">
                    2
                  </div>
                  <div className="step-counter-text">Profile</div>
                </div>
              </div>
              <Card className="account-setup__page">
                <CardBody>
                  <h1 className="setup-info text-center">
                    Fill in the form to complete account setup
                  </h1>
                  <Form onSubmit={(e) => submitData(e)}>
                    <FormGroup className="mt-4">
                      <Input
                        className="form-control-alternative input-Style form__input"
                        type="select"
                        name="field"
                        id="field"
                        value={field}
                        onBlur={(e) => checkInputsOnBlur(e, "validField")}
                        required
                        autoFocus
                        onChange={(e) => dropDownChangehandler(e)}
                        placeholder="What Field are you in?"
                      >
                        <option key="hf3iu43" value="">
                          Choose a Field
                        </option>
                        <option value="other" key="hfkfkclk394">
                          Other
                        </option>
                        {fieldResults.map((field) => (
                          <option value={field.title} key={field._id}>
                            {field.title}
                          </option>
                        ))}
                      </Input>
                      <label for="username" className="form__label">
                        What Field are you in?
                      </label>
                      {!validField && (
                        <p className="form-warning">field cannot be empty</p>
                      )}
                    </FormGroup>
                    {field.toLowerCase() === "other" && (
                      <>
                        <FormGroup>
                          <Input
                            className="form-control-alternative input-Style form__input"
                            type="text"
                            name="other"
                            placeholder="Type other field"
                            value={other}
                            onChange={(e) => setOtherText(e.target.value)}
                          ></Input>
                          <label for="other" className="form__label">
                            Type other field
                          </label>
                        </FormGroup>
                      </>
                    )}
                    <FormGroup>
                      <Input
                        className="form__input"
                        placeholder="About me"
                        rows="5"
                        type="textarea"
                        name="about"
                        autoComplete="off"
                        value={about}
                        onChange={(e) => updateFormData(e)}
                      />
                      <label for="about" className="form__label">
                        About me
                      </label>
                    </FormGroup>
                    <FormGroup className="mt-5 btn-form-group-container">
                      <Button
                        className="accout-setup-btn"
                        type="submit"
                        size="lg"
                        disabled={!validField}
                      >
                        Proceed
                      </Button>
                    </FormGroup>
                  </Form>
                </CardBody>
              </Card>
            </Col>
            <Col md="2" sm="2"></Col>
          </Row>
        </Container>
        <br />
        <br />
      </div>
    </>
  );
};

export default Setuppagetwo;
