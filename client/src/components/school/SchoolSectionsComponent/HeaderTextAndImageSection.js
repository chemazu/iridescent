import React, { useEffect, useState, useRef } from "react";
import {
  Button,
  Modal,
  UncontrolledCollapse,
  FormGroup,
  Label,
  Input,
} from "reactstrap";
import { useAlert } from "react-alert";

import setAuthToken from "../../../utilities/setAuthToken";
import axios from "axios";

import "../SectionStyles/headertextandimage.css";

const HeaderTextAndImageSection = ({
  themeData,
  backendSectionData,
  isAuthenticated,
  isPreviewMode,
  openAddNewSectionModal,
  displayUpdateLoader,
  removeUpdateLoader,
  updateSectionAfterBackendSubmit,
  handleSectionDelete,
  handleBackToDashboard,
}) => {
  const [sectionData, setSectionData] = useState(null);
  const [deleteModalConfirmation, setDeleteModalConfirmation] = useState(false);
  const [displaySectionModal, setDisplaySectionModal] = useState(false);
  const uploadBackgroundImageRef = useRef();
  const alert = useAlert();

  const [formData, setFormData] = useState({
    header: "",
    subtitle: "",
    imagefile: null,
    useSecondaryColorScheme: false,
    showSocialLinks: false,
  });

  const { header, subtitle, useSecondaryColorScheme, showSocialLinks } =
    formData;

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

  const addNewSectionModal = () => {
    openAddNewSectionModal(backendSectionData.position);
  };

  const handleBtnSaveUpdate = async () => {
    setDisplaySectionModal(false);
    displayUpdateLoader();
    if (formData.header.length === 0) {
      removeUpdateLoader();
      return alert.show("Section Header cannot be empty", {
        type: "error",
      });
    }
    if (formData.subtitle.length === 0) {
      removeUpdateLoader();
      return alert.show("Section Subtitle cannot be empty", {
        type: "error",
      });
    }

    try {
      const formField = new FormData();
      formField.append("header", header);
      formField.append("subtitle", subtitle);
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
        `/api/v1/section/${backendSectionData._id}/headertextandimage`,
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
      alert.show(error.message, {
        type: "error",
      });
    }
  };

  const handleDeleteBtnClick = () => {
    setDeleteModalConfirmation(false);
    handleSectionDelete(backendSectionData._id);
  };

  useEffect(() => {
    setSectionData(backendSectionData?.headertextandimage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setSectionData(backendSectionData?.headertextandimage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backendSectionData]);

  useEffect(() => {
    if (sectionData) {
      setFormData({
        header: sectionData?.header !== undefined ? sectionData?.header : "",
        subtitle:
          sectionData?.subtitle !== undefined ? sectionData?.subtitle : "",
        showSocialLinks: sectionData?.showsociallinks,
        useSecondaryColorScheme: backendSectionData.isusingsecondarystyles,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionData]);

  return (
    <>
      <section
        style={{
          backgroundColor:
            backendSectionData.isusingsecondarystyles === true
              ? themeData.themestyles.secondarybackgroundcolor
              : themeData.themestyles.primarybackgroundcolor,
        }}
        className="header-imagetext-section"
      >
        {isAuthenticated === true && isPreviewMode === true && (
          <>
            <div className="header-text-image-section-overlay">
              <div className="header-text-image-Controls text-center">
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

        <div className="image-text-content__container">
          {sectionData !== null && sectionData?.showsociallinks === true && (
            <>
              <div className="header-text__social-links">
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
                    <i className="fab fa-google"></i>
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
          <div className="image-text__container">
            <div className="header-text-container-on-section-lander">
              <h2
                style={{
                  color:
                    backendSectionData.isusingsecondarystyles === true
                      ? themeData.themestyles.secondarytextcolor
                      : themeData.themestyles.primarytextcolor,
                  fontFamily: themeData.themestyles.fontfamily,
                }}
              >
                {sectionData != null && sectionData?.header?.length > 0 ? (
                  <>{sectionData?.header}</>
                ) : (
                  <>
                    Being the strategic part of the page that people see in the
                    first seconds of loading a website, a header acts as a kind
                    of invitation.
                  </>
                )}
              </h2>
              <p
                style={{
                  color:
                    backendSectionData.isusingsecondarystyles === true
                      ? themeData.themestyles.secondarytextcolor
                      : themeData.themestyles.primarytextcolor,
                  fontFamily: themeData.themestyles.fontfamily,
                }}
              >
                {sectionData != null && sectionData?.subtitle?.length > 0 ? (
                  <>{sectionData?.subtitle}</>
                ) : (
                  <>
                    Lorem, ipsum dolor sit amet consectetur adipisicing elit.
                    Qui, natus? Est sapiente quasi voluptates voluptatem
                    recusandae sint dicta debitis porro eligendi veritatis
                    repellendus aut nemo ipsa maxime mollitia, temporibus
                    voluptatum?
                  </>
                )}
              </p>
            </div>
            <div className="header-image-container">
              {sectionData != null && sectionData?.imageurl?.length > 0 ? (
                <>
                  <img src={sectionData?.imageurl} alt="..." />
                </>
              ) : (
                <>
                  <img
                    src={themeData.defaultassets.defaultheadertextandimage}
                    alt="..."
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* edit section modal  */}
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
                Update Section Header And Subtitle
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
                  value={header}
                  name="header"
                  onChange={(e) => updateFormFields(e)}
                />
              </FormGroup>
              <FormGroup>
                <Label>
                  Description: <span className="compulsory-indicator">*</span>
                </Label>
                <Input
                  className="form-group__settings"
                  placeholder="Section Subtitle"
                  type="textarea"
                  rows="4"
                  value={subtitle}
                  name="subtitle"
                  onChange={(e) => updateFormFields(e)}
                />
              </FormGroup>
            </UncontrolledCollapse>
          </div>

          <div className="container-settings">
            <div id="update-image-toggler" className="toggle-action-launcher">
              <div className="toggle-action-text">Update Section Image</div>
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
            </UncontrolledCollapse>
          </div>

          <div className="container-settings">
            <div
              id="update-background-toggler"
              className="toggle-action-launcher"
            >
              <div className="toggle-action-text">
                Update Section Background
              </div>
              <div className="toggle-action-icon">
                <i className="fas fa-caret-down"></i>
              </div>
            </div>
            <UncontrolledCollapse toggler="#update-background-toggler">
              <FormGroup>
                <Label>Display Social Links:</Label>
                <div className="modal-checkbox-toggle">
                  <label className="modal-switch">
                    <input
                      type="checkbox"
                      value={showSocialLinks}
                      checked={showSocialLinks}
                      onChange={toggleShowSocailLink}
                    />
                    <span className="modal-slider modal-round"></span>
                  </label>
                </div>
              </FormGroup>
              <FormGroup>
                <Label>Use Secondary Color Scheme:</Label>
                <div className="modal-checkbox-toggle">
                  <label className="modal-switch">
                    <input
                      type="checkbox"
                      value={useSecondaryColorScheme}
                      checked={useSecondaryColorScheme}
                      onChange={toggleUseSecondaryColorScheme}
                    />
                    <span className="modal-slider modal-round"></span>
                  </label>
                </div>
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

export default HeaderTextAndImageSection;
