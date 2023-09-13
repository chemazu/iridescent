import React, { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import { useAlert } from "react-alert";
import {
  Button,
  Modal,
  UncontrolledCollapse,
  FormGroup,
  Input,
  Label,
  Spinner,
  Row,
  Col,
  Progress,
} from "reactstrap";
import setAuthToken from "../../../utilities/setAuthToken";
import VideoJS from "../../VideoJSPlayer/VideoJS";

import "../SectionStyles/videosection.css";

const convertBytesToMegabytes = (bytes, decimals = 2) => {
  const megaBytes = 1024 * 1024;
  return (bytes / megaBytes).toFixed(decimals);
};

const VideoSection = ({
  themeData,
  isAuthenticated,
  isPreviewMode,
  backendSectionData,
  openAddNewSectionModal,
  handleSectionDelete,
  displayUpdateLoader,
  removeUpdateLoader,
  updateSectionAfterBackendSubmit,
  handleBackToDashboard,
}) => {
  const [sectionData, setSectionData] = useState(null);
  const [displaySectionModal, setDisplaySectionModal] = useState(false);
  const uploadVideoRef = useRef();
  const [width, setWindowWidth] = useState(0);
  const alert = useAlert();
  const [loaded, setLoaded] = useState(0);
  const [openGeneratingSignaturModal, setGeneratingSignatureModal] =
    useState(false);
  const [videoUploadProgressModal, setVideoUploadProgressModal] =
    useState(false);

  const [formData, setFormData] = useState({
    headertext: "",
    videofile: null,
    videopath: "",
    isvideofullscreen: false,
    useSecondaryColorScheme: false,
  });

  const { headertext, isvideofullscreen, useSecondaryColorScheme } = formData;

  const [deleteModalConfirmation, setDeleteModalConfirmation] = useState(false);

  const handleBtnFileUploadClick = () => uploadVideoRef.current.click();

  const addNewSectionModal = () => {
    openAddNewSectionModal(backendSectionData.position);
  };

  const handleDeleteBtnClick = () => {
    setDeleteModalConfirmation(false);
    handleSectionDelete(backendSectionData._id);
  };

  const toggleVideoFullScreen = () => {
    setFormData({
      ...formData,
      isvideofullscreen: !isvideofullscreen,
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

  const handleVidoeFileUpload = (e) => {
    if (e.target.files.length === 0) {
      setFormData({
        ...formData,
        imagefile: null,
      });
    }

    const fileSize = e?.target?.files[0]?.size / 1024 / 1024; // file size in mb
    if (fileSize > 40) {
      return alert.show(
        "File Size exceeds maximum limit, choose another file",
        {
          type: "error",
        }
      );
    }

    setFormData({
      ...formData,
      videofile: e.target.files[0],
    });
  };

  const getCloudflareUploadUrl = async (videoFileSize) => {
    setGeneratingSignatureModal(true);
    if (localStorage.getItem("token")) {
      setAuthToken(localStorage.getItem("token"));
    }
    try {
      const res = await axios.get(
        `/api/v1/section/${backendSectionData._id}/video/cloudflare/${videoFileSize}`
      );
      setGeneratingSignatureModal(false);
      return res.data;
    } catch (error) {
      setGeneratingSignatureModal(false);
      alert.show(error.message, {
        type: "error",
      });
      return null;
    }
  };

  const saveVideoToCloudFlare = async (uploadurl) => {
    setVideoUploadProgressModal(true);
    try {
      const config = {
        onUploadProgress: (event) => {
          const progress = Math.round((event.loaded / event.total) * 100);
          setLoaded(progress);
        },
      };
      const formUpload = new FormData();
      formUpload.append("file", formData.videofile);
      delete axios.defaults.headers.common["x-auth-token"];
      await axios.post(uploadurl, formUpload, config);
      alert.show("uploaded successfully", {
        type: "success",
      });
      setLoaded(0);
      setVideoUploadProgressModal(false);
    } catch (error) {
      setVideoUploadProgressModal(false);
      setLoaded(0);
      alert.show("error uploading video", {
        type: "error",
      });
    }
  };

  const handleBtnSaveUpdate = async () => {
    setDisplaySectionModal(false);
    if (formData.headertext.length === 0) {
      removeUpdateLoader();
      return alert.show("Section Header cannot be empty", {
        type: "error",
      });
    }

    try {
      if (formData.videofile === undefined) {
        // then user not trying to upload video
        displayUpdateLoader();
        const config = {
          headers: {
            "Content-Type": "application/json",
          },
        };
        const body = JSON.stringify({
          headertext: formData.headertext,
          useSecondaryColorScheme: formData.useSecondaryColorScheme,
          isvideofullscreen: formData.isvideofullscreen,
        });
        const saveUploadRes = await axios.put(
          `/api/v1/section/${backendSectionData._id}/video`,
          body,
          config
        );
        updateSectionAfterBackendSubmit(saveUploadRes.data);
        setFormData({
          ...formData,
          videofile: null,
        });
        removeUpdateLoader();
      } else {
        const uploadData = await getCloudflareUploadUrl(
          convertBytesToMegabytes(formData.videofile.size)
        );
        if (uploadData !== null) {
          if (uploadData.result.success === false) {
            console.log(uploadData.result.errors);
            throw new Error("error uploading video");
          }
        }
        await saveVideoToCloudFlare(uploadData.result.uploadURL);
        // handle save section details to backend...

        displayUpdateLoader();
        const config = {
          headers: {
            "Content-Type": "application/json",
          },
        };
        const body = JSON.stringify({
          headertext: formData.headertext,
          useSecondaryColorScheme: formData.useSecondaryColorScheme,
          isvideofullscreen: formData.isvideofullscreen,
          videoId: uploadData.result.uid,
        });
        if (localStorage.getItem("token")) {
          setAuthToken(localStorage.getItem("token"));
        }
        const saveUploadRes = await axios.put(
          `/api/v1/section/${backendSectionData._id}/video`,
          body,
          config
        );
        updateSectionAfterBackendSubmit(saveUploadRes.data);
        setFormData({
          ...formData,
          videofile: null,
        });
        removeUpdateLoader();
      }
    } catch (error) {
      removeUpdateLoader();
      console.log(error);
      // const errors = error.response.data.errors;
      // if (errors) {
      //   errors.forEach((error) => {
      //     alert.show(error.msg, {
      //       type: "error",
      //     });
      //   });
      // }
      alert.show(error.message, {
        type: "error",
      });
    }
  };

  useEffect(() => {
    if (backendSectionData) {
      setSectionData(backendSectionData?.video);
    }
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (backendSectionData) {
      setSectionData(backendSectionData?.video);
    }
    // eslint-disable-next-line
  }, [backendSectionData]);

  useEffect(() => {
    if (sectionData) {
      setFormData({
        headertext:
          sectionData?.headertext !== undefined ? sectionData.headertext : "",
        isvideofullscreen: sectionData.isvideofullscreen,
        useSecondaryColorScheme: backendSectionData.isusingsecondarystyles,
      });
    }
    // eslint-disable-next-line
  }, [sectionData]);

  useEffect(() => {
    window.addEventListener("resize", () => {
      const width = window.innerWidth;
      setWindowWidth(width);
    });

    return () => {
      window.removeEventListener("resize", () => {
        const width = window.innerWidth;
        setWindowWidth(width);
      });
    };
  }, []);

  const videoContainerDefaultStyles =
    width < 767
      ? {
          width: "100%",
          height: "520px",
          position: "relative",
        }
      : {
          width: "80%",
          height: "520px",
          margin: "0 auto",
          position: "relative",
        };

  const videoContainerToggleFullScreenStyle = {
    width: "100%",
    height: "520px",
    position: "relative",
  };

  const videoJsOptionsForCloudFlare = useMemo(() => {
    const options = {
      autoplay: false,
      controls: true,
      responsive: true,
      fill: true,
      playbackRates: [0.5, 1, 1.5, 2],
      controlBar: {
        remainingTimeDisplay: {
          displayNegative: false,
        },
      },
      plugins: {
        seekButtons: {
          forward: 10,
          back: 10,
        },
      },
      videotitle: "section video",
      sources: [
        {
          src: sectionData?.cloudflare_hsl_videourl,
          type: "application/x-mpegURL",
        },
        {
          src: sectionData?.cloudflare_dash_videourl,
          type: "application/dash+xml",
        },
      ],
    };
    return options;
  }, [sectionData]);

  const videoJsOptionsForDefault = useMemo(() => {
    const options = {
      autoplay: false,
      controls: true,
      responsive: true,
      fill: true,
      playbackRates: [0.5, 1, 1.5, 2],
      controlBar: {
        remainingTimeDisplay: {
          displayNegative: false,
        },
      },
      plugins: {
        seekButtons: {
          forward: 10,
          back: 10,
        },
      },
      videotitle: "section video",
      sources: [
        {
          src:
            sectionData?.videourl?.length > 0
              ? sectionData?.videourl
              : "https://res.cloudinary.com/kolaniyi/video/upload/v1644594734/tuturly/Default%20Section%20Assets/The_Cinematic_Orchestra_-_Arrival_of_The_Birds_Transformation_ryssby.mp4",
          type: "video/mp4",
        },
      ],
    };
    return options;
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
        className="video-section"
      >
        {isAuthenticated === true && isPreviewMode === true && (
          <>
            <div className="video-section-overlay">
              <div className="video-section-overlay-controls text-center">
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

        <h3
          style={{
            color:
              backendSectionData.isusingsecondarystyles === true
                ? themeData.themestyles.secondarytextcolor
                : themeData.themestyles.primarytextcolor,
            fontFamily: themeData.themestyles.fontfamily,
          }}
          className="video-intro-text text-center"
        >
          {sectionData != null && sectionData?.headertext?.length > 0 ? (
            sectionData?.headertext
          ) : (
            <>Video Introduction Here, let your students know what to expect.</>
          )}
        </h3>
        <div
          style={
            sectionData != null && sectionData?.isvideofullscreen === true
              ? videoContainerToggleFullScreenStyle
              : videoContainerDefaultStyles
          }
          className="video-container mb-2"
        >
          {sectionData?.isCloudflareVideoSource !== true ? (
            <>
              <VideoJS options={videoJsOptionsForDefault} />
            </>
          ) : (
            <>
              {sectionData?.isStreamReady === true ? (
                <>
                  <VideoJS options={videoJsOptionsForCloudFlare} />
                </>
              ) : (
                <>
                  <div
                    style={{
                      padding: "2rem 1rem",
                    }}
                  >
                    <p
                      style={{
                        color:
                          backendSectionData.isusingsecondarystyles === true
                            ? themeData.themestyles.secondarytextcolor
                            : themeData.themestyles.primarytextcolor,
                        fontFamily: themeData.themestyles.fontfamily,
                        fontSize: "12px",
                      }}
                      className="text-center mb-2 mt-2"
                    >
                      Please wait while Video is still processing. Refresh page
                      to update.
                    </p>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </section>

      {/* modal to edit the section contents starts here  */}
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
                Update Introduction Header
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
                  value={headertext}
                  name="headertext"
                  onChange={(e) => updateFormFields(e)}
                />
              </FormGroup>
            </UncontrolledCollapse>
          </div>

          <div className="container-settings">
            <div id="update-video-toggler" className="toggle-action-launcher">
              <div className="toggle-action-text">Update Video Content</div>
              <div className="toggle-action-icon">
                <i className="fas fa-caret-down"></i>
              </div>
            </div>
            <UncontrolledCollapse toggler="#update-video-toggler">
              <Label>Upload Video:</Label>
              <FormGroup>
                <Button onClick={handleBtnFileUploadClick}>
                  Click To Upload
                </Button>
                <input
                  onChange={handleVidoeFileUpload}
                  accept="video/*"
                  ref={uploadVideoRef}
                  style={{
                    display: "none",
                  }}
                  type="file"
                ></input>
                {formData.videofile !== null && (
                  <small
                    className="mt-3 mb-2"
                    style={{
                      color: "tomato",
                      display: "block",
                    }}
                  >
                    {formData.videofile?.name}
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
              <FormGroup>
                <Label>Make Video Full Screen:</Label>
                <div className="modal-checkbox-toggle">
                  <label class="modal-switch">
                    <input
                      type="checkbox"
                      value={isvideofullscreen}
                      checked={isvideofullscreen}
                      onChange={toggleVideoFullScreen}
                    />
                    <span class="modal-slider modal-round"></span>
                  </label>
                </div>
              </FormGroup>
            </UncontrolledCollapse>
          </div>

          {/* modal body ending here  */}
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
      <Modal
        isOpen={openGeneratingSignaturModal}
        className="modal-dialog-centered app-loader"
      >
        <div className="modal-body">
          <div className="spinner-style">
            <Spinner
              color="dark"
              style={{ width: "5rem", height: "5rem", borderWidth: "7px" }}
            />
          </div>
          <p className="lead text-center loader-text">
            Preparing Media asset for upload...
          </p>
        </div>
      </Modal>
      <Modal isOpen={videoUploadProgressModal} centered>
        <div className="modal-header">
          <div
            style={{
              fontWeight: "700",
              fontSize: "20",
              color: "#242121",
              textTransform: "uppercase",
            }}
          >
            Uploading Video File.
          </div>
        </div>
        <div className="modal-body">
          <Row>
            <Col sm="12" md="12">
              <div className="course-thumbnail-upload-progress">
                <p
                  style={{
                    color: "#242121",
                    fontSize: "16px",
                    fontWeight: "600",
                  }}
                  className="lead text-center"
                >
                  Upload Progress...
                </p>
                {
                  <Progress
                    striped
                    color="#242121"
                    max="100"
                    style={{
                      backgroundColor: "#ffffff",
                    }}
                    value={loaded}
                  >
                    {Math.round(loaded, 2)}%
                  </Progress>
                }
              </div>
            </Col>
          </Row>
        </div>
      </Modal>
    </>
  );
};

export default VideoSection;
