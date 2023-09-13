import React, { useState, useEffect, useRef } from "react";
import { connect } from "react-redux";
import { useAlert } from "react-alert";
import axios from "axios";
import {
  Button,
  Container,
  Modal,
  UncontrolledCollapse,
  Input,
  FormGroup,
  Label,
} from "reactstrap";
import setAuthToken from "../../../utilities/setAuthToken";

import "../SectionStyles/callToAction.css";

const subdomainSiteUrl = (schoolname) => {
  return process.env.NODE_ENV === "production"
    ? `https://${schoolname}.tuturly.com`
    : `http://${schoolname}.localhost:3000`;
};

const CalltoActionSection = ({
  themeData,
  backendSectionData,
  isAuthenticated,
  isPreviewMode,
  displayUpdateLoader,
  removeUpdateLoader,
  updateSectionAfterBackendSubmit,
  openAddNewSectionModal,
  handleSectionDelete,
  handleBackToDashboard,
  schoolname,
}) => {
  const [sectionData, setSectionData] = useState(null);
  const [displaySectionModal, setDisplaySectionModal] = useState(false);
  const [deleteModalConfirmation, setDeleteModalConfirmation] = useState(false);
  const uploadBackgroundImageRef = useRef();
  const alert = useAlert();

  const [formData, setFormData] = useState({
    headertitle: "",
    description: "",
    buttonurl: "",
    btntext: "",
    displayimageurl: "",
    imagefile: null,
    useSecondaryColorScheme: false,
    showSocialLinks: false,
  });

  const {
    headertitle,
    description,
    buttonurl,
    btntext,
    useSecondaryColorScheme,
    showSocialLinks,
    displayimageurl,
  } = formData;

  const handleImageFileUpload = (e) => {
    if (e.target.files.length === 0) {
      setFormData({
        ...formData,
        imagefile: null,
      });
    }

    const fileSize = e?.target?.files[0]?.size / 1024 / 1024; // file size in mb
    if (fileSize > 30) {
      return alert.show(
        "File Size exceeds maximum limit, choose another file",
        {
          type: "error",
        }
      );
    }

    // const fileType = `.${e.target.files[0].name.split(".")[e.target.files[0].name.split(".").length - 1]}`
    // if(fileType !== '.png' || fileType !== '.jpg' || fileType !== '.jpeg'|| fileType !== '.PNG' || fileType !== '.JPG' || fileType !== '.JPEG'){
    //   return alert.show("thumbnail must be an image", {
    //     type: "error"
    //   })
    // }

    setFormData({
      ...formData,
      imagefile: e.target.files[0],
    });
  };

  const toggleShowSocailLink = () => {
    setFormData({
      ...formData,
      showSocialLinks: !showSocialLinks,
    });
  };

  const toggleUseSecondaryColorScheme = () => {
    setFormData({
      ...formData,
      useSecondaryColorScheme: !useSecondaryColorScheme,
    });
  };

  const updateFormFields = (e) =>
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

  const handleBtnFileUploadClick = () =>
    uploadBackgroundImageRef.current.click();

  const handleBtnSaveUpdate = async () => {
    setDisplaySectionModal(false);
    displayUpdateLoader();
    if (formData.headertitle.length === 0) {
      removeUpdateLoader();
      return alert.show("Section Header cannot be empty", {
        type: "error",
      });
    }
    if (formData.description.length === 0) {
      removeUpdateLoader();
      return alert.show("Section Description Cannot be empty", {
        type: "error",
      });
    }
    if (formData.buttonurl.length === 0) {
      removeUpdateLoader();
      return alert.show("Section Button URL cannot be empty", {
        type: "error",
      });
    }
    if (formData.btntext.length === 0) {
      removeUpdateLoader();
      return alert.show("Section Button Text cannot be empty", {
        type: "error",
      });
    }

    try {
      const formField = new FormData();
      formField.append("headertitle", headertitle);
      formField.append("description", description);
      formField.append("buttonurl", buttonurl);
      formField.append("btntext", btntext);
      formField.append("useSecondaryColorScheme", useSecondaryColorScheme);
      formField.append("showSocialLinks", showSocialLinks);

      if (formData.imagefile !== null) {
        formField.append("file", formData.imagefile);
      }

      if (localStorage.getItem("token")) {
        setAuthToken(localStorage.getItem("token"));
      }

      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      };
      const body = formField;
      const res = await axios.put(
        `/api/v1/section/${backendSectionData._id}/calltoaction`,
        body,
        config
      );
      updateSectionAfterBackendSubmit(res.data);
      setFormData({
        ...formData,
        imagefile: null,
      });
      removeUpdateLoader();
    } catch (error) {
      removeUpdateLoader();
      const errors = error.response.data.errors;
      if (errors) {
        errors.forEach((error) => {
          alert.show(error.msg, {
            type: "error",
          });
        });
      }
    }
  };

  const handleDeleteBtnClick = () => {
    setDeleteModalConfirmation(false);
    handleSectionDelete(backendSectionData._id);
  };

  useEffect(() => {
    if (backendSectionData) {
      setSectionData(backendSectionData?.calltoaction);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (backendSectionData) {
      setSectionData(backendSectionData?.calltoaction);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backendSectionData]);

  const addNewSectionModal = () => {
    openAddNewSectionModal(backendSectionData.position);
  };

  useEffect(() => {
    if (sectionData) {
      setFormData({
        headertitle:
          sectionData?.headertitle !== undefined
            ? sectionData?.headertitle
            : "",
        description:
          sectionData?.description !== undefined
            ? sectionData?.description
            : "",
        btntext: sectionData?.btntext !== undefined ? sectionData?.btntext : "",
        buttonurl:
          sectionData?.buttonurl !== undefined ? sectionData?.buttonurl : "",
        showSocialLinks: sectionData?.showsociallinks,
        displayimageurl: sectionData?.imageurl,
        useSecondaryColorScheme: backendSectionData.isusingsecondarystyles,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionData]);

  return (
    <>
      <section
        style={{
          backgroundImage:
            sectionData != null && sectionData?.imageurl?.length > 0
              ? `url(${displayimageurl})`
              : `url(${themeData.defaultassets.defaultcalltoactionheroimage})`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
          backgroundPosition: "bottom",
          width: "100%",
          height: "70vh",
          backgroundColor: "rgba(0,0,0,0.566)",
          backgroundBlendMode: "darken",
          paddingTop: "11vh",
        }}
        className="callToAction"
      >
        {isAuthenticated === true && isPreviewMode === true && (
          <>
            <div className="callToAction-section-overlay">
              <div className="callToActionControls text-center">
                <Button onClick={() => setDisplaySectionModal(true)} block>
                  Edit
                </Button>
                <Button onClick={() => setDeleteModalConfirmation(true)} block>
                  Delete
                </Button>
                <Button onClick={handleBackToDashboard} block>
                  Back To Dashboard
                </Button>
              </div>
              <div onClick={addNewSectionModal} className="add-section-btn">
                <i className="fas fa-plus"></i>
              </div>
            </div>
          </>
        )}
        <Container fluid className="callToAction-container-styles">
          <div className="callToAction-contents">
            {sectionData !== null && sectionData.showsociallinks === true && (
              <>
                <div className="callToAction-section-socail-links">
                  {themeData.twitterurl !== "undefined" && (
                    <a
                      target="_blank"
                      rel="noreferrer"
                      href={`https://${themeData.twitterurl}`}
                      className="social-icon-item"
                      style={{
                        color:
                          backendSectionData.isusingsecondarystyles === true
                            ? themeData.themestyles.secondarytextcolor
                            : themeData.themestyles.primarytextcolor,
                      }}
                    >
                      <i className="fab fa-twitter"></i>
                    </a>
                  )}
                  {themeData.youtubeurl !== "undefined" && (
                    <a
                      target="_blank"
                      rel="noreferrer"
                      href={`https://${themeData.youtubeurl}`}
                      className="social-icon-item"
                      style={{
                        color:
                          backendSectionData.isusingsecondarystyles === true
                            ? themeData.themestyles.secondarytextcolor
                            : themeData.themestyles.primarytextcolor,
                      }}
                    >
                      <i className="fab fa-youtube"></i>
                    </a>
                  )}
                  {themeData.googleurl !== "undefined" && (
                    <a
                      target="_blank"
                      rel="noreferrer"
                      href={`https://${themeData.googleurl}`}
                      className="social-icon-item"
                      style={{
                        color:
                          backendSectionData.isusingsecondarystyles === true
                            ? themeData.themestyles.secondarytextcolor
                            : themeData.themestyles.primarytextcolor,
                      }}
                    >
                      <i class="fab fa-google"></i>
                    </a>
                  )}
                  {themeData.instagramurl !== "undefined" && (
                    <a
                      target="_blank"
                      rel="noreferrer"
                      href={`https://${themeData.instagramurl}`}
                      className="social-icon-item"
                      style={{
                        color:
                          backendSectionData.isusingsecondarystyles === true
                            ? themeData.themestyles.secondarytextcolor
                            : themeData.themestyles.primarytextcolor,
                      }}
                    >
                      <i className="fab fa-instagram"></i>
                    </a>
                  )}
                  {themeData.facebookurl !== "undefined" && (
                    <a
                      target="_blank"
                      rel="noreferrer"
                      href={`https://${themeData.facebookurl}`}
                      className="social-icon-item"
                      style={{
                        color:
                          backendSectionData.isusingsecondarystyles === true
                            ? themeData.themestyles.secondarytextcolor
                            : themeData.themestyles.primarytextcolor,
                      }}
                    >
                      <i className="fab fa-facebook"></i>
                    </a>
                  )}
                </div>
              </>
            )}
            <div className="callToAction-section-school-info">
              <h1
                style={{
                  color:
                    backendSectionData.isusingsecondarystyles === true
                      ? themeData.themestyles.secondarytextcolor
                      : themeData.themestyles.primarytextcolor,
                  fontFamily: themeData.themestyles.fontfamily,
                }}
                className="callToAction-header"
              >
                {sectionData !== null && sectionData?.headertitle?.length > 0
                  ? sectionData?.headertitle
                  : "This is the call to action main header. Include Call To Action Phrase Here."}
              </h1>
              <p
                style={{
                  color:
                    backendSectionData.isusingsecondarystyles === true
                      ? themeData.themestyles.secondarytextcolor
                      : themeData.themestyles.primarytextcolor,
                  fontFamily: themeData.themestyles.fontfamily,
                }}
                className="callToAction-subtitle"
              >
                {sectionData !== null && sectionData?.description?.length > 0
                  ? sectionData?.description
                  : "This is the call to Call to action subtitles text. this part contains more information on what you want your student to do!"}
              </p>
              <Button
                style={{
                  color: themeData.themestyles.buttontextcolor,
                  borderRadius: themeData.themestyles.buttonborderradius,
                  backgroundColor: themeData.themestyles.buttonbackgroundcolor,
                }}
                target="_blank"
                rel="noreferrer"
                href={
                  sectionData !== null && sectionData?.buttonurl?.length > 0
                    ? `https://${sectionData?.buttonurl}`
                    : `${subdomainSiteUrl(schoolname)}/enroll`
                }
                className="btn callToAction-btn-link"
              >
                {sectionData !== null && sectionData?.btntext?.length > 0
                  ? sectionData?.btntext
                  : "Enroll"}
              </Button>
            </div>
          </div>
        </Container>
      </section>
      <Modal isOpen={displaySectionModal} size="md" centered>
        <div className="modal-header header-design">
          <h3>Update Section</h3>
          <div
            onClick={() => setDisplaySectionModal(false)}
            className="close-container"
          >
            <i className="fas fa-times"></i>
          </div>
        </div>
        <div className="modal-body">
          {/* modal body beginning  */}

          <div className="container-settings">
            <div id="update-header-toggler" className="toggle-action-launcher">
              <div className="toggle-action-text">
                Update Call To Action Header And Subtitle
              </div>
              <div className="toggle-action-icon">
                <i className="fas fa-caret-down"></i>
              </div>
            </div>
            <UncontrolledCollapse toggler="#update-header-toggler">
              <FormGroup>
                <Label>
                  Header: <span className="compulsory-indicator">*</span>
                </Label>
                <Input
                  className="form-group__settings"
                  placeholder="Section Header"
                  type="text"
                  value={headertitle}
                  name="headertitle"
                  onChange={(e) => updateFormFields(e)}
                />
              </FormGroup>
              <FormGroup>
                <Label>
                  Description: <span className="compulsory-indicator">*</span>
                </Label>
                <Input
                  className="form-group__settings"
                  placeholder="Section Description"
                  type="textarea"
                  rows="4"
                  value={description}
                  name="description"
                  onChange={(e) => updateFormFields(e)}
                />
              </FormGroup>
            </UncontrolledCollapse>
          </div>

          <div className="container-settings">
            <div id="update-image-toggler" className="toggle-action-launcher">
              <div className="toggle-action-text">
                Update Call To Action Background
              </div>
              <div className="toggle-action-icon">
                <i className="fas fa-caret-down"></i>
              </div>
            </div>
            <UncontrolledCollapse toggler="#update-image-toggler">
              <Label>Upload Background Image:</Label>
              <FormGroup>
                <Button onClick={handleBtnFileUploadClick}>
                  Click To Upload
                </Button>
                <input
                  onChange={handleImageFileUpload}
                  ref={uploadBackgroundImageRef}
                  style={{
                    display: "none",
                  }}
                  type="file"
                ></input>
                {formData.imagefile !== null && (
                  <small
                    className="mt-3 mb-2"
                    style={{
                      color: "tomato",
                      display: "block",
                    }}
                  >
                    {formData.imagefile?.name}
                  </small>
                )}
              </FormGroup>
              <FormGroup>
                <Label>Display Social Links:</Label>
                <div className="modal-checkbox-toggle">
                  <label class="modal-switch">
                    <input
                      type="checkbox"
                      value={showSocialLinks}
                      checked={showSocialLinks}
                      onChange={toggleShowSocailLink}
                    />
                    <span class="modal-slider modal-round"></span>
                  </label>
                </div>
              </FormGroup>
              <FormGroup>
                <Label>Use Secondary Color Scheme:</Label>
                <div className="modal-checkbox-toggle">
                  <label class="modal-switch">
                    <input
                      type="checkbox"
                      value={useSecondaryColorScheme}
                      checked={useSecondaryColorScheme}
                      onChange={toggleUseSecondaryColorScheme}
                    />
                    <span class="modal-slider modal-round"></span>
                  </label>
                </div>
              </FormGroup>
            </UncontrolledCollapse>
          </div>

          <div className="container-settings">
            <div id="update-btn-toggler" className="toggle-action-launcher">
              <div className="toggle-action-text">
                Update Call To Action Button
              </div>
              <div className="toggle-action-icon">
                <i className="fas fa-caret-down"></i>
              </div>
            </div>
            <UncontrolledCollapse toggler="#update-btn-toggler">
              <FormGroup>
                <Label>
                  Button Text: <span className="compulsory-indicator">*</span>
                </Label>
                <Input
                  className="form-group__settings"
                  placeholder='Button Text e.g "Enroll"'
                  type="text"
                  value={btntext}
                  name="btntext"
                  onChange={(e) => updateFormFields(e)}
                />
              </FormGroup>
              <FormGroup>
                <Label>
                  Button Destination URL:{" "}
                  <span className="compulsory-indicator">*</span>
                </Label>
                <Input
                  className="form-group__settings"
                  placeholder="Button Destination URL"
                  type="text"
                  value={buttonurl}
                  name="buttonurl"
                  onChange={(e) => updateFormFields(e)}
                />
              </FormGroup>
            </UncontrolledCollapse>
          </div>

          {/* modal body ending  */}
        </div>
        <div className="modal-footer">
          <Button onClick={handleBtnSaveUpdate} className="save-button" block>
            Save
          </Button>
        </div>
      </Modal>

      {/* delete section modal starts here  */}
      <Modal
        className="modal-dialog-centered"
        isOpen={deleteModalConfirmation}
        size="md"
      >
        <div className="modal-header delete-section-modal">
          <h3>Delete Section</h3>
          <div onClick={() => setDeleteModalConfirmation(false)}>
            <i className="fas fa-times"></i>
          </div>
        </div>
        <div className="modal-body">
          <p className="text-center lead confirmation-text">
            Are you sure you want to Delete this section ?
          </p>
        </div>
        <div className="modal-footer">
          <Button
            block
            onClick={() => setDeleteModalConfirmation(false)}
            className="delete-confimation-cancel"
          >
            Cancel
          </Button>
          <Button
            block
            onClick={handleDeleteBtnClick}
            className="delete-confirmation-confirm"
          >
            Delete
          </Button>
        </div>
      </Modal>
    </>
  );
};

const mapStateToProps = (state) => ({
  schoolname: state.subdomain,
});

export default connect(mapStateToProps)(CalltoActionSection);
