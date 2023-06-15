import React, { useState, useEffect, useRef } from "react";
import { connect } from "react-redux";
import axios from "axios";
import { useDispatch } from "react-redux";
import { Container, Row, Col, Form, FormGroup, Button } from "reactstrap";
import { useAlert } from "react-alert";
import {
  UPDATE_DASHBOARD_PAGE_COUNTER,
  UPDATE_THEME_INFO,
  THEME_SETUP_ERROR,
} from "../../../../actions/types";
import { getTheme } from "../../../../actions/theme";
import { startLoading, stopLoading } from "../../../../actions/appLoading";
import DashboardNavbar from "../../DashboardNavbar";
import setAuthToken from "../../../../utilities/setAuthToken";
import vector from "../../../../images/Vector.png";
// import ReactFlagsSelect from 'react-flags-select'

import "../../../../custom-styles/dashboard/dashboardlayout.css";
import "../../../../custom-styles/dashboard/customize.css";
import NotificationNavbar from "../../NotificationNavbar";

export const ThemeInfo = ({ getSchoolTheme, school, theme }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    countryphonecode: "",
    address: "",
    phone: "",
    googleurl: "",
    youtubeurl: "",
    twitterurl: "",
    instagramurl: "",
    facebookurl: "",
  });

  const dispatch = useDispatch();
  const alert = useAlert();
  const [logoUpload, setLogoUpload] = useState(null);
  const [faviconUpload, setFaviconUpload] = useState(null);

  const [logoFileImage, setLogoFileImage] = useState(null);
  const [favIconFileImage, setFavIconFileImage] = useState(null);

  const logoUploadRef = useRef();
  const faviconUploadRef = useRef();

  const {
    title,
    phone,
    googleurl,
    address,
    youtubeurl,
    twitterurl,
    countryphonecode,
    instagramurl,
    facebookurl,
  } = formData;

  const favIconUploadChangeHandler = (e) => {
    const fileSize = e?.target?.files[0]?.size / 1024 / 1024; // size in mb
    if (fileSize > 20) {
      // if filesize is more that 20mb return error message
      return alert.show("image file to large, select another image", {
        type: "error",
      });
    }
    if (!/^image\//.test(e?.target?.files[0]?.type)) {
      return alert.show(`File ${e?.target?.files[0]?.name} is not an image.`, {
        type: "error",
      });
    }

    const reader = new FileReader();
    setFaviconUpload(e.target.files[0]); //used to save the image blob before uploading
    reader.addEventListener(
      "load",
      function () {
        setFavIconFileImage(reader.result);
      },
      false
    );

    if (e.target.files[0]) {
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const logoUploadChangeHandler = (e) => {
    const fileSize = e?.target?.files[0]?.size / 1024 / 1024; // size in mb
    if (fileSize > 20) {
      // if filesize is more that 20mb return error message
      return alert.show("image file to large, select another image", {
        type: "error",
      });
    }
    if (!/^image\//.test(e?.target?.files[0]?.type)) {
      return alert.show(`File ${e?.target?.files[0]?.name} is not an image.`, {
        type: "error",
      });
    }
    const reader = new FileReader();
    setLogoUpload(e.target.files[0]); //used to save the image blob before uploading
    reader.addEventListener(
      "load",
      function () {
        setLogoFileImage(reader.result);
      },
      false
    );

    if (e.target.files[0]) {
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleFaviconUpload = () => faviconUploadRef.current.click();
  const handleLogoUpload = () => logoUploadRef.current.click();

  const updateFormFields = (e) =>
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

  const updateThemeInfo = async (formData, school) => {
    if (localStorage.token) {
      setAuthToken(localStorage.token);
    }
    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };
    const body = formData;
    try {
      dispatch(startLoading());
      const res = await axios.put(
        `/api/v1/theme/setup/themeinfo/${school._id}`,
        body,
        config
      );
      dispatch({
        type: UPDATE_THEME_INFO,
        payload: res.data,
      });
      alert.show("Updates Save Successfully", {
        type: "success",
      });
      setLogoFileImage(null);
      setFavIconFileImage(null);
      dispatch(stopLoading());
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
        type: THEME_SETUP_ERROR,
      });
    }
  };

  const submitFormInfoHandler = (e) => {
    e.preventDefault();
    if (title.length === 0) {
      return alert.show("title is required", {
        type: "error",
      });
    }

    if (address.length === 0) {
      return alert.show("address is required", {
        type: "error",
      });
    }

    if (countryphonecode.length === 0) {
      return alert.show("country code is required", {
        type: "error",
      });
    }

    if (phone.length === 0) {
      return alert.show("contact phone is required", {
        type: "error",
      });
    }

    const formData = new FormData();

    formData.append("title", title);
    formData.append("countryphonecode", countryphonecode);
    formData.append("address", address);
    formData.append("phone", phone);
    formData.append("logo", logoUpload);
    formData.append("favicon", faviconUpload);

    if (googleurl?.length !== 0) {
      formData.append("googleurl", googleurl);
    }

    if (youtubeurl?.length !== 0) {
      formData.append("youtubeurl", youtubeurl);
    }

    if (twitterurl?.length !== 0) {
      formData.append("twitterurl", twitterurl);
    }

    if (facebookurl?.length !== 0) {
      formData.append("facebookurl", facebookurl);
    }

    if (instagramurl?.length !== 0) {
      formData.append("instagramurl", instagramurl);
    }

    updateThemeInfo(formData, school);
  };

  useEffect(() => {
    if (theme !== null) {
      let title =
        theme.title !== null && theme.title !== undefined ? theme.title : "";
      let address =
        theme.address !== null && theme.address !== undefined
          ? theme.address
          : "";
      let phoneCode =
        theme.countryphonecode !== null && theme.countryphonecode !== undefined
          ? theme.countryphonecode
          : "";
      let phoneNum =
        theme.phonenumber !== null && theme.phonenumber !== undefined
          ? theme.phonenumber
          : "";

      let facebookurl =
        theme.facebookurl !== null && theme.facebookurl !== "undefined"
          ? theme.facebookurl
          : "";
      let twitterurl =
        theme.twitterurl !== null && theme.twitterurl !== "undefined"
          ? theme.twitterurl
          : "";
      let instagramurl =
        theme.instagramurl !== null && theme.instagramurl !== "undefined"
          ? theme.instagramurl
          : "";
      let googleurl =
        theme.googleurl !== null && theme.googleurl !== "undefined"
          ? theme.googleurl
          : "";
      let youtubeurl =
        theme.youtubeurl !== null && theme.youtubeurl !== "undefined"
          ? theme.youtubeurl
          : "";
      setFormData({
        title: title,
        address: address,
        phone: phoneNum,
        countryphonecode: phoneCode,
        facebookurl: facebookurl,
        twitterurl: twitterurl,
        instagramurl: instagramurl,
        googleurl: googleurl,
        youtubeurl: youtubeurl,
      });
    }
  }, [theme]);

  useEffect(() => {
    if (school) {
      getSchoolTheme(school._id);
    }
  }, [getSchoolTheme, school]);

  useEffect(() => {
    dispatch({
      type: UPDATE_DASHBOARD_PAGE_COUNTER,
      payload: 2,
    });
    // eslint-disable-next-line
  }, []);

  return (
    <>
      <div className="dashboard-layout">
        <Container fluid>
          <Row>
            <DashboardNavbar />
            <Col className="page-actions__col">
              <div className="page-actions">
                <NotificationNavbar />
                {theme === null ? (
                  <p className="text-center mt-3">Loading...</p>
                ) : (
                  <>
                    <div className="customize-page">
                      <div className="customize-page__secondary-view">
                        <h3 className="customize-page-title">
                          Customize space
                        </h3>
                        <div className="theme-preview-container">
                          <div className="theme-setup">
                            <div className="form-container">
                              <p className="page-subtitle">
                                Input Information about Your school
                              </p>
                              <Form onSubmit={(e) => submitFormInfoHandler(e)}>
                                <FormGroup>
                                  <input
                                    type="text"
                                    className="form__input"
                                    placeholder="Title"
                                    name="title"
                                    id="title"
                                    required
                                    autoFocus
                                    autoComplete="off"
                                    onChange={(e) => updateFormFields(e)}
                                    value={title}
                                  />
                                  <label for="heading" className="form__label">
                                    Title
                                  </label>
                                </FormGroup>
                                {/* <FormGroup>
                              <input
                                type="text"
                                className="form__input"
                                placeholder="Description"
                                name="description"
                                id="description"
                                required
                                autoFocus
                                autoComplete="off"
                                onChange={e => updateFormFields(e)}
                                value={description}
                                />
                              <label for="subheading" className="form__label">Sub Heading</label>
                              </FormGroup> */}
                              </Form>
                            </div>
                            <div className="form-container">
                              <p className="page-subtitle">
                                Upload Website Media
                              </p>
                              <Row>
                                {theme.favicon.length === 0 ? (
                                  <>
                                    <Col
                                      xs="12"
                                      sm="12"
                                      md="6"
                                      className="mb-4"
                                    >
                                      <div className="image-upload__container">
                                        <div
                                          className="image-with-upload-btn"
                                          onClick={handleFaviconUpload}
                                        >
                                          <div className="img-container">
                                            <img
                                              src={
                                                favIconFileImage !== null
                                                  ? favIconFileImage
                                                  : vector
                                              }
                                              alt=".."
                                              className="img-fluid"
                                            />
                                          </div>
                                          <div className="upload-cta">
                                            Upload
                                          </div>
                                        </div>
                                        <small>
                                          Recommended: 20px x 20px (20kb)
                                        </small>
                                        <h3>Favicon</h3>
                                      </div>
                                    </Col>
                                  </>
                                ) : (
                                  <>
                                    <Col
                                      xs="12"
                                      sm="12"
                                      md="6"
                                      className="mb-4"
                                    >
                                      <div className="image-upload__container">
                                        <div
                                          className="image-with-upload-btn"
                                          onClick={handleFaviconUpload}
                                        >
                                          <div className="img-container">
                                            <img
                                              src={
                                                favIconFileImage !== null
                                                  ? favIconFileImage
                                                  : theme.favicon
                                              }
                                              alt=".."
                                              className="img-fluid"
                                            />
                                          </div>
                                          <div className="upload-cta">
                                            Replace Favicon
                                          </div>
                                        </div>
                                        {/* <small>Recommended: 20px x 20px (20kb)</small>
                                    <h3>Favicon</h3> */}
                                      </div>
                                    </Col>
                                  </>
                                )}
                                {theme.logo.length === 0 ? (
                                  <>
                                    <Col xs="12" sm="12" md="6">
                                      <div className="image-upload__container">
                                        <div
                                          className="image-with-upload-btn"
                                          onClick={handleLogoUpload}
                                        >
                                          <div className="img-container">
                                            <img
                                              src={
                                                logoFileImage !== null
                                                  ? logoFileImage
                                                  : vector
                                              }
                                              alt=".."
                                              className="img-fluid"
                                            />
                                          </div>
                                          <div className="upload-cta">
                                            Upload
                                          </div>
                                        </div>
                                        <small>
                                          Recommended: 100px x 100px (500kb)
                                        </small>
                                        <h3>Logo</h3>
                                      </div>
                                    </Col>
                                  </>
                                ) : (
                                  <>
                                    <Col xs="12" sm="12" md="6">
                                      <div className="image-upload__container">
                                        <div
                                          className="image-with-upload-btn"
                                          onClick={handleLogoUpload}
                                        >
                                          <div className="img-container">
                                            <img
                                              src={
                                                logoFileImage !== null
                                                  ? logoFileImage
                                                  : theme.logo
                                              }
                                              alt=".."
                                              className="img-fluid"
                                            />
                                          </div>
                                          <div className="upload-cta">
                                            Replace Logo
                                          </div>
                                        </div>
                                      </div>
                                    </Col>
                                  </>
                                )}
                              </Row>
                              <input
                                style={{
                                  display: "none",
                                }}
                                type="file"
                                ref={faviconUploadRef}
                                onChange={(e) => favIconUploadChangeHandler(e)}
                              />
                              <input
                                style={{
                                  display: "none",
                                }}
                                type="file"
                                ref={logoUploadRef}
                                onChange={(e) => logoUploadChangeHandler(e)}
                              />
                            </div>
                            <div className="form-container">
                              <p className="page-subtitle">
                                Contact Information
                              </p>
                              <FormGroup>
                                <input
                                  type="text"
                                  class="form__input"
                                  placeholder="Address"
                                  name="address"
                                  id="address"
                                  value={address}
                                  required
                                  autoFocus
                                  autoComplete="off"
                                  onChange={(e) => updateFormFields(e)}
                                />
                                <label
                                  for="themeheading"
                                  className="form__label"
                                >
                                  Address
                                </label>
                              </FormGroup>
                              <div className="phone-number-input-container">
                                <Row>
                                  <Col xs="12" sm="3" md="3">
                                    {/* <ReactFlagsSelect
                                      showSecondaryOptionLabel={false}
                                      selectButtonClassName="menu-flags-button"
                                  selected={'NG'}
                                  onSelect={(e) => console.log(e, 'selected flag')}
                                  /> */}
                                    <FormGroup>
                                      <input
                                        type="tel"
                                        class="form__input"
                                        placeholder="Country Code (234)"
                                        name="countryphonecode"
                                        id="countryphonecode"
                                        value={countryphonecode}
                                        required
                                        autoFocus
                                        autoComplete="off"
                                        onChange={(e) => updateFormFields(e)}
                                      />
                                      <label
                                        for="countryphonecode"
                                        className="form__label"
                                      >
                                        Country Code (234)
                                      </label>
                                    </FormGroup>
                                  </Col>
                                  <Col xs="12" sm="9" md="9">
                                    <FormGroup>
                                      <input
                                        type="text"
                                        class="form__input"
                                        placeholder="Phone No."
                                        name="phone"
                                        id="phone"
                                        value={phone}
                                        required
                                        autoFocus
                                        autoComplete="off"
                                        onChange={(e) => updateFormFields(e)}
                                      />
                                      <label
                                        for="phone"
                                        className="form__label"
                                      >
                                        Phone No.
                                      </label>
                                    </FormGroup>
                                  </Col>
                                </Row>
                              </div>
                            </div>
                            <div className="form-container">
                              <p className="page-subtitle">
                                Enter Your Social Media URL's{" "}
                              </p>
                              <div className="social-urls">
                                <div className="social-icon-and-input">
                                  <i class="fab fa-google icon-styles"></i>
                                  <input
                                    type="text"
                                    class="form__input"
                                    placeholder="Enter URL"
                                    name="googleurl"
                                    id="googleurl"
                                    value={googleurl}
                                    autoComplete="off"
                                    onChange={(e) => updateFormFields(e)}
                                  />
                                </div>
                                <div className="social-icon-and-input">
                                  <i class="fab fa-youtube icon-styles"></i>
                                  <input
                                    type="text"
                                    class="form__input"
                                    placeholder="Enter URL"
                                    name="youtubeurl"
                                    id="youtubeurl"
                                    value={youtubeurl}
                                    autoComplete="off"
                                    onChange={(e) => updateFormFields(e)}
                                  />
                                </div>
                                <div className="social-icon-and-input">
                                  <i class="fab fa-twitter icon-styles"></i>
                                  <input
                                    type="text"
                                    class="form__input"
                                    placeholder="Enter URL"
                                    name="twitterurl"
                                    id="twitterurl"
                                    value={twitterurl}
                                    autoComplete="off"
                                    onChange={(e) => updateFormFields(e)}
                                  />
                                </div>
                                <div className="social-icon-and-input">
                                  <i class="fab fa-instagram icon-styles"></i>
                                  <input
                                    type="text"
                                    class="form__input"
                                    placeholder="Enter URL"
                                    name="instagramurl"
                                    id="instagramurl"
                                    value={instagramurl}
                                    autoComplete="off"
                                    onChange={(e) => updateFormFields(e)}
                                  />
                                </div>
                                <div className="social-icon-and-input">
                                  <i class="fab fa-facebook icon-styles"></i>
                                  <input
                                    type="text"
                                    class="form__input"
                                    placeholder="Enter URL"
                                    name="facebookurl"
                                    id="facebookurl"
                                    value={facebookurl}
                                    autoComplete="off"
                                    onChange={(e) => updateFormFields(e)}
                                  />
                                </div>
                              </div>
                            </div>
                            <FormGroup className="mt-5">
                              <Button
                                className="customize-page-btn"
                                type="submit"
                                size="lg"
                                block
                                onClick={submitFormInfoHandler}
                              >
                                Save
                              </Button>
                            </FormGroup>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
};

const mapStateToProps = (state) => ({
  theme: state.theme.schoolTheme,
  school: state.school.schoolDetails,
});

const mapDispatchToProps = (dispatch) => ({
  getSchoolTheme: (schoolId) => dispatch(getTheme(schoolId)),
});

export default connect(mapStateToProps, mapDispatchToProps)(ThemeInfo);
