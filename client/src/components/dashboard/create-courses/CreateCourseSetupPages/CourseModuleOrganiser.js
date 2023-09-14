import React, { useState, useEffect, useRef } from "react";
import { connect, useDispatch } from "react-redux";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  Modal,
  Button,
  FormGroup,
  Input,
  UncontrolledTooltip,
  Label,
} from "reactstrap";
import { useAlert } from "react-alert";
import AddNewModule from "./AddNewModule";
import CourseModuleItem from "./CourseModuleItem";
import {
  loadCourseModules,
  addNewCourseModule,
  addNewCourseUnitToModule,
} from "../../../../actions/modules";
import setAuthToken from "../../../../utilities/setAuthToken";
import { startLoading, stopLoading } from "../../../../actions/appLoading";
import { UPDATE_COURSE_UNIT_PREVIEW_STATUS } from "../../../../actions/types";
import GeneratingSignatureLoadingModal from "./GeneratingSignatureLoadingModal";
import VideoUploadProgressModal from "./VideoUploadProgressModal";
import FinalizingVideoUploadModal from "./FinalizingVideoUploadModal";
import socket from "../../../../utilities/client-socket-connect";

// modal SVG for call to action...
import uploadPDF from "../../../../images/upload-pdf.png";
import uploadQuiz from "../../../../images/upload-quiz.png";
import uploadVideo from "../../../../images/upload-video.png";

const CourseModuleOrganiser = ({
  course,
  modules,
  modulesLoading,
  addCourseModule,
  loadModules,
  createUnit,
}) => {
  const [launchAddModuleModal, setLaunchAddModuleModal] = useState(false);
  const [launchAddVideoModal, setLaunchAddVideoModal] = useState(false);
  const [launchAddCourseContentModal, setLaunchAddCourseContentModal] =
    useState(false);
  const [launchAddDocumentModal, setLaunchAddDocumentModal] = useState(false);
  const [moduleIdForVideoUpload, setModuleIdForVideoUpload] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [documentFile, setDocuentFile] = useState(null);
  const [openGeneratingSignaturModal, setGeneratingSignatureModal] =
    useState(false);
  const [videoUploadProgressModal, setVideoUploadProgressModal] =
    useState(false);
  const [saveVideoDataToBackendLoading, setSaveVideoDataToBackendLoading] =
    useState(false);
  const [videoFileSize, setVideoFileSize] = useState(0);
  const [cloudinaryVideoUploadData, setCloudinaryVideoUploadData] =
    useState(null);
  const [loaded, setLoaded] = useState(0);
  const [showVideoFileError, setShowUploadVideoFileError] = useState(false);
  const [showDocumentFileError, setShowDocumentFileError] = useState(false);
  const [nameOfActiveModule, setNameOfActiveModule] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [displayFeatureInPorgress, setDisplayFeatureInProgress] =
    useState(false);
  const dispatch = useDispatch();

  const alert = useAlert();
  const [newModuleName, setNewModuleName] = useState({
    name: "",
  });
  const videoFileInputRef = useRef();
  const documentFileInputRef = useRef();

  const [newLessonName, setNewLessonName] = useState("");

  const openModuleModal = () => setLaunchAddModuleModal(true);
  const closeModuleModal = () => setLaunchAddModuleModal(false);

  const openVideoModal = () => {
    setLaunchAddVideoModal(true);
  };

  const closeVideoModal = () => {
    setLaunchAddVideoModal(false);
    setModuleIdForVideoUpload(null);
    setNameOfActiveModule("");
    setNewLessonName("");
    setVideoFile(null);
  };

  const closeDocumentModal = () => {
    setLaunchAddDocumentModal(false);
    setModuleIdForVideoUpload(null);
    setNameOfActiveModule("");
    setNewLessonName("");
    setDocuentFile(null);
  };

  const updateModuleNameFromInput = (e) => {
    setNewModuleName({
      ...newModuleName,
      name: e.target.value,
    });
  };

  const videoLessonFilePickerHandler = (e) => {
    if (e.target.files.length === 0) {
      return setVideoFile(null);
    }
    if (e.target.files.length > 1) {
      return alert.show("Only one upload allowed at a time.", {
        type: "error",
      });
    }
    const fileSizeInMegaBytes = e.target.files[0]?.size / (1024 * 1024); // uploaded filesize in MB
    const fileSizeRoundedToNearestDecimal =
      Math.round(fileSizeInMegaBytes * 10) / 10;
    if (fileSizeRoundedToNearestDecimal > 256) {
      return alert.show("Video file cannot exceed 256MB", {
        type: "error",
      });
    }
    setVideoFile(e.target.files[0]);
  };

  const documentLessonFilePickerHandler = (e) => {
    if (e.target.files.length === 0) {
      return setDocuentFile(null);
    }
    if (e.target.files.length > 1) {
      return alert.show("Only one upload allowed at a time.", {
        type: "error",
      });
    }
    const fileSizeInMegaBytes = e.target.files[0]?.size / (1024 * 1024); // uploaded filesize in MB
    const fileSizeRoundedToNearestDecimal =
      Math.round(fileSizeInMegaBytes * 10) / 10;
    if (fileSizeRoundedToNearestDecimal > 25) {
      return alert.show("Document file cannot exceed 25MB", {
        type: "error",
      });
    }
    setDocuentFile(e.target.files[0]);
  };

  // button references the video file picker
  const buttonFilePickerEventHandler = () => videoFileInputRef.current.click();

  // button references the document file picker
  const buttonDocumentFileUploadEventHandler = () =>
    documentFileInputRef.current.click();

  // state update for the video name in modal
  const updateVideoLessonTitle = (e) => setNewLessonName(e.target.value);

  const addModuleToCourse = () => {
    if (newModuleName.name.length === 0) {
      return alert.show("module name cannot be empty", {
        type: "error",
      });
    }
    addCourseModule(newModuleName, course._id);
    closeModuleModal(false);
  };

  // eslint-disable-next-line
  const generateSignatureForFileUpload = async () => {
    setGeneratingSignatureModal(true);
    if (localStorage.getItem("token")) {
      setAuthToken(localStorage.getItem("token"));
    }
    try {
      const res = await axios.get(
        `/api/v1/courseunit/upload/signature/${course._id}/${videoFileSize}`
      );
      setGeneratingSignatureModal(false);
      return res.data;
    } catch (error) {
      setGeneratingSignatureModal(false);
      alert.show(error.message, {
        type: "error",
      });
      setVideoFile(null);
      return null;
    }
  };

  // eslint-disable-next-line
  const processFile = async (
    signature,
    apikey,
    timestamp,
    eager,
    folder,
    cloudname
  ) => {
    setVideoUploadProgressModal(true);

    const chunkSize = 6000000;
    let chunkCounter = 0;
    const XUniqueUploadId = new Date();
    const file = videoFile;
    const numberOfChunks = Math.ceil(videoFile.size / chunkSize);
    let start = 0;
    let chunkEnd = start + chunkSize;

    const uploadChunk = (chunkForm, start, chunkEnd) => {
      const cloudinaryUploadUrl = `https://api.cloudinary.com/v1_1/${cloudname}/auto/upload`;
      const blobEnd = chunkEnd - 1;
      const config = {
        headers: {
          "X-Unique-Upload-Id": XUniqueUploadId,
          "Content-Range": "bytes " + start + "-" + blobEnd + "/" + file.size,
        },
        onUploadProgress: (event) => {
          const progress = Math.round((event.loaded / event.total) * 100);
          setLoaded(
            Math.round(
              ((chunkCounter - 1) / numberOfChunks) * 100 +
                progress / numberOfChunks
            )
          );
        },
      };
      delete axios.defaults.headers.common["x-auth-token"];
      axios
        .post(cloudinaryUploadUrl, chunkForm, config)
        .then((data) => {
          start += chunkSize;
          if (start < file.size) {
            createChunk(start);
          } else {
            setCloudinaryVideoUploadData(data.data);
            setVideoUploadProgressModal(false);
            alert.show("video uploaded successfully", {
              type: "success",
            });
            setVideoFile(null);
            setLoaded(0);
            setLaunchAddVideoModal(false);
            setNewLessonName("");
          }
        })
        .catch((error) => {
          console.log(JSON.stringify(error));
          setVideoUploadProgressModal(false);
          setVideoFile(null);
          setLoaded(0);
          setLaunchAddVideoModal(false);
          setNewLessonName("");
          alert.show("video upload failed. Try Later", {
            type: "error",
          });
        });
    };

    const createChunk = (start) => {
      chunkCounter++;
      chunkEnd = Math.min(start + chunkSize, file.size);
      const chunk = file.slice(start, chunkEnd);

      const chunkForm = new FormData();
      chunkForm.append("file", chunk);
      chunkForm.append("api_key", apikey);
      chunkForm.append("timestamp", timestamp);
      chunkForm.append("signature", signature);
      // chunkForm.append("eager", eager);
      chunkForm.append("folder", folder);

      uploadChunk(chunkForm, start, chunkEnd);
    };

    createChunk(start);
  };

  const saveVideoDataToBackend = async ({
    videourl,
    videopublicid,
    filesize,
    duration,
    name,
  }) => {
    try {
      if (localStorage.getItem("token")) {
        setAuthToken(localStorage.getItem("token"));
      }
      setSaveVideoDataToBackendLoading(true);

      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };
      const body = JSON.stringify({
        videourl,
        videopublicid,
        filesize,
        duration,
        name,
      });
      const res = await axios.post(
        `/api/v1/courseunit/${course._id}/${moduleIdForVideoUpload}`,
        body,
        config
      );
      alert.show("video saved successfully", {
        type: "success",
      });
      setSaveVideoDataToBackendLoading(false);
      setNewLessonName("");
      return res.data;
    } catch (error) {
      setSaveVideoDataToBackendLoading(false);
      setNewLessonName("");
      const errors = error.response.data.errors | [];
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
      return null;
    }
  };

  const getCloudflareUploadUrl = async () => {
    setGeneratingSignatureModal(true);
    if (localStorage.getItem("token")) {
      setAuthToken(localStorage.getItem("token"));
    }
    try {
      const res = await axios.get(
        `/api/v1/courseunit/upload/url/cloudflare/${course._id}/${videoFileSize}`
      );
      setGeneratingSignatureModal(false);
      return res.data;
    } catch (error) {
      setGeneratingSignatureModal(false);
      if (error.response.status === 401) {
        setShowPaymentModal(true);
      }
      alert.show(error.message, {
        type: "error",
      });
      setVideoFile(null);
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
      formUpload.append("file", videoFile);
      delete axios.defaults.headers.common["x-auth-token"];
      await axios.post(uploadurl, formUpload, config);
      alert.show("uploaded successfully", {
        type: "success",
      });
      setVideoFile(null);
      setLoaded(0);
      setLaunchAddVideoModal(false);
      setVideoUploadProgressModal(false);
      setNewLessonName("");
    } catch (error) {
      setVideoUploadProgressModal(false);
      setVideoFile(null);
      setLoaded(0);
      setLaunchAddVideoModal(false);
      setNewLessonName("");
      alert.show("error uploading video", {
        type: "error",
      });
    }
  };

  const saveCloudflareMetaDateToDB = async (video_Id) => {
    setSaveVideoDataToBackendLoading(true);
    if (localStorage.getItem("token")) {
      setAuthToken(localStorage.getItem("token"));
    }
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const body = JSON.stringify({
      name: newLessonName,
      videoId: video_Id,
    });
    try {
      const res = await axios.post(
        `/api/v1/courseunit/upload/save/cloudflare/${course._id}/${moduleIdForVideoUpload}`,
        body,
        config
      );
      setSaveVideoDataToBackendLoading(false);
      setNewLessonName("");
      return res.data;
    } catch (error) {
      setSaveVideoDataToBackendLoading(false);
      alert.show(error.message, {
        type: "error",
      });
      return null;
    }
  };

  const saveVideo = async () => {
    if (newLessonName.length === 0) {
      return alert.show("lesson name cannot be empty", {
        type: "error",
      });
    }

    if (videoFile === null) {
      return setShowUploadVideoFileError(true);
    }

    try {
      const uploadData = await getCloudflareUploadUrl();
      if (uploadData !== null) {
        if (uploadData.result.success === false) {
          console.log(uploadData.result.errors);
          throw new Error("error uploading video");
        }
        await saveVideoToCloudFlare(uploadData.result.uploadURL);
        const backendData = await saveCloudflareMetaDateToDB(
          uploadData.result.uid
        );
        createUnit(backendData);
      }
    } catch (error) {
      console.log(error);
      alert.show("error uploading video", {
        type: "error",
      });
    }

    // const signatureData = await generateSignatureForFileUpload();
    // await processFile(
    //   signatureData.signature,
    //   signatureData.apikey,
    //   signatureData.timestamp,
    //   signatureData.eager,
    //   signatureData.folder,
    //   signatureData.cloudname
    // );
  };

  const postDataToBackend = async (uploadResponse) => {
    const videoData = {
      videourl: uploadResponse.secure_url,
      videopublicid: uploadResponse.public_id,
      filesize: uploadResponse.bytes,
      duration: uploadResponse.duration,
      name: newLessonName,
      // streamableVideoUrl: uploadResponse.eager[0].secure_url,
    };
    const backendData = await saveVideoDataToBackend(videoData);
    createUnit(backendData);
  };

  const openUploadCourseContentModal = (moduleId, moduleName) => {
    setModuleIdForVideoUpload(moduleId);
    setNameOfActiveModule(moduleName);
    setLaunchAddCourseContentModal(true);
  };

  const handleVideoUploadModalClick = () => {
    openVideoModal();
    setLaunchAddCourseContentModal(false);
  };

  // eslint-disable-next-line
  const handledocumentUploadModalClick = () => {
    setLaunchAddDocumentModal(true);
    setLaunchAddCourseContentModal(false);
  };

  const saveDocument = async () => {
    if (newLessonName.length === 0) {
      return alert.show("lesson name cannot be empty", {
        type: "error",
      });
    }

    if (documentFile === null) {
      return setShowDocumentFileError(true);
    }
    try {
      if (localStorage.getItem("token")) {
        setAuthToken(localStorage.getItem("token"));
      }
      dispatch(startLoading());
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      };
      const formField = new FormData();
      formField.append("document", documentFile);
      formField.append("name", newLessonName);

      const documentFileSizeInMegaBytes = documentFile?.size / (1024 * 1024); // uploaded filesize in MB
      const fileSizeRoundedToNearestDecimal =
        Math.round(documentFileSizeInMegaBytes * 10) / 10;
      const res = await axios.post(
        `/api/v1/courseunit/document/${course._id}/${moduleIdForVideoUpload}/${fileSizeRoundedToNearestDecimal}`,
        formField,
        config
      );
      createUnit(res.data);
      alert.show("document saved successfully", {
        type: "success",
      });
      dispatch(stopLoading());
      setLaunchAddDocumentModal(false);
    } catch (error) {
      dispatch(stopLoading());
      setNewLessonName("");
      setDocuentFile(null);
      const errors = error.response.data.errors;
      if (errors) {
        return errors.forEach((error) => {
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

  useEffect(() => {
    if (cloudinaryVideoUploadData) {
      postDataToBackend(cloudinaryVideoUploadData);
    }
    // eslint-disable-next-line
  }, [cloudinaryVideoUploadData]);

  useEffect(() => {
    // useEffect to keep track of video size
    // when user selects video to be uploaded
    if (videoFile) {
      const fileSizeInMegaBytes = videoFile?.size / (1024 * 1024); // uploaded filesize in MB
      const fileSizeRoundedToNearestDecimal =
        Math.round(fileSizeInMegaBytes * 10) / 10;

      setVideoFileSize(fileSizeRoundedToNearestDecimal);
    }
  }, [videoFile]);

  useEffect(() => {
    if (course !== null) {
      loadModules(course._id);
    }
    // eslint-disable-next-line
  }, [course]);

  // listen to socket request here
  useEffect(() => {
    const handleUnitUpdateInState = (data) => {
      // since the UPDATE_COURSE_UNIT_PREVIEW_STATUS
      // has the same effect similar with updating a courseUnit
      // isStreamReady state, we simply dispatch it here also..
      dispatch({
        type: UPDATE_COURSE_UNIT_PREVIEW_STATUS,
        payload: data,
      });
    };
    socket.on("unit-update", handleUnitUpdateInState);
    return () => {
      socket.off("unit-update", handleUnitUpdateInState);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className="mt-5 course-module">
        {course === null ? (
          <p className="text-center lead">Loading...</p>
        ) : (
          <>
            <div className="modules-container">
              <div className="modules-container__header">
                <h3 className="modules-container__header-title">
                  Course Structure
                </h3>
                <i
                  href="#"
                  id="UncontrolledToolForModuleIcon"
                  onClick={openModuleModal}
                  className="fas fa-plus-circle modules-container__icon"
                ></i>
                <UncontrolledTooltip
                  placement="bottom"
                  target="UncontrolledToolForModuleIcon"
                >
                  Add new Module to course.
                </UncontrolledTooltip>
              </div>
              <div className="modules-container__body">
                {modulesLoading === true ? (
                  <p className="lead text-center">modules loading...</p>
                ) : (
                  <>
                    {modules?.length === 0 ? (
                      <AddNewModule openModalDialog={openModuleModal} />
                    ) : (
                      modules.map((module) => (
                        <CourseModuleItem
                          key={module?._id}
                          module={module}
                          openUploadCourseContentModal={
                            openUploadCourseContentModal
                          }
                        />
                      ))
                    )}
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </div>
      {/* modal for module add creation  */}
      <Modal
        className="modal-dialog-centered add-module-loader"
        isOpen={launchAddModuleModal}
      >
        <div
          style={{
            fontWeight: "600",
            textTransform: "uppercase",
            fontSize: "17px",
            color: "#3d3d3d",
          }}
          className="modal-header"
        >
          Add a new Module
        </div>
        <div className="modal-body">
          <FormGroup className="mb-3 mt-3">
            <Label className="ml-1">Module Name. (45 characters or less)</Label>
            <Input
              type="text"
              className="form-control-alternative"
              placeholder="Enter Module Name. (45 characters or less)"
              maxLength={45}
              onChange={(e) => updateModuleNameFromInput(e)}
            />
          </FormGroup>
        </div>
        <div className="modal-footer">
          <Button
            style={{
              paddingLeft: "35px",
              paddingRight: "35px",
            }}
            onClick={closeModuleModal}
            size="large"
            className="modal-btn-style-outline"
          >
            Cancel
          </Button>
          <Button
            onClick={addModuleToCourse}
            style={{
              paddingLeft: "30px",
              paddingRight: "30px",
            }}
            size="large"
            className="modal-btn-style"
          >
            Add Module
          </Button>
        </div>
      </Modal>
      {/* modal for course creation content prompt  */}
      <Modal
        isOpen={launchAddCourseContentModal}
        className="modal-dialog-centered"
        size="lg"
      >
        <div
          style={{
            fontWeight: "600",
            textTransform: "uppercase",
            fontSize: "17px",
            color: "#3d3d3d",
          }}
          className="modal-header upload-course-content-modal__header"
        >
          Upload Course Content
          <div onClick={() => setLaunchAddCourseContentModal(false)}>
            <i className="fas fa-times"></i>
          </div>
        </div>
        <div className="modal-body">
          <div className="upload-course-content__container">
            <div
              onClick={handleVideoUploadModalClick}
              className="unit-content-cta__container"
            >
              <div className="upload-content-img-cta">
                <img src={uploadVideo} alt="..." />
              </div>
              <p className="text-center">Video Content</p>
            </div>
            <div
              onClick={() => setDisplayFeatureInProgress(true)}
              className="unit-content-cta__container"
            >
              <div className="upload-content-img-cta">
                <img src={uploadQuiz} alt="..." />
              </div>
              <p className="text-center">Quiz</p>
            </div>
            <div
              // onClick={handledocumentUploadModalClick}
              onClick={() => setDisplayFeatureInProgress(true)}
              className="unit-content-cta__container"
            >
              <div className="upload-content-img-cta">
                <img src={uploadPDF} alt="..." />
              </div>
              <p className="text-center">PDF file</p>
            </div>
          </div>
        </div>
      </Modal>
      {/* modal for video upload creation  */}
      <Modal
        className="modal-dialog-centered add-video-loader"
        isOpen={launchAddVideoModal}
      >
        <div
          style={{
            fontWeight: "600",
            textTransform: "uppercase",
            fontSize: "17px",
            color: "#3d3d3d",
          }}
          className="modal-header"
        >
          Upload Video Content - {nameOfActiveModule}
        </div>
        <div className="modal-body">
          <FormGroup className="mb-3 mt-3">
            <Label className="ml-1">
              Lesson title. (70 characters or less.)
            </Label>
            <Input
              type="text"
              className="form-control-alternative"
              placeholder="Enter Lesson title. (70 characters or less.)"
              onChange={(e) => updateVideoLessonTitle(e)}
              maxLength={70}
              value={newLessonName}
            />
          </FormGroup>
          <input
            type="file"
            accept="video/*"
            ref={videoFileInputRef}
            style={{ display: "none" }}
            onChange={(e) => videoLessonFilePickerHandler(e)}
          />
          <FormGroup className="mb-3 mt-3">
            <Button
              style={{
                backgroundColor: "#000000",
                color: "#ffffff",
                margin: "5px 0",
                boxShadow: "none",
              }}
              onClick={buttonFilePickerEventHandler}
              block
            >
              Upload Media File
            </Button>
          </FormGroup>
          {videoFile === null && showVideoFileError === true && (
            <p className="video-file-required-text">video file required</p>
          )}
          {videoFile !== null && (
            <p
              style={{
                fontWeight: "600",
              }}
              className="video-file-required-text"
            >
              {videoFile.name}
            </p>
          )}
        </div>
        <div className="modal-footer">
          <Button
            className="modal-btn-style-outline"
            style={{
              paddingLeft: "35px",
              paddingRight: "35px",
            }}
            onClick={closeVideoModal}
            size="large"
          >
            Cancel
          </Button>
          <Button
            onClick={saveVideo}
            className="modal-btn-style"
            style={{
              paddingLeft: "30px",
              paddingRight: "30px",
            }}
            size="large"
          >
            Save Video
          </Button>
        </div>
      </Modal>
      {/* modal for documents upload creation  */}
      <Modal
        className="modal-dialog-centered add-video-loader"
        isOpen={launchAddDocumentModal}
      >
        <div
          style={{
            fontWeight: "600",
            textTransform: "uppercase",
            fontSize: "17px",
            color: "#3d3d3d",
          }}
          className="modal-header"
        >
          Upload Document Content - {nameOfActiveModule}
        </div>
        <div className="modal-body">
          <FormGroup className="mb-3 mt-3">
            <Label className="ml-1">
              Lesson title. (70 characters or less.)
            </Label>
            <Input
              type="text"
              className="form-control-alternative"
              placeholder="Enter Lesson title. (70 characters or less.)"
              onChange={(e) => updateVideoLessonTitle(e)}
              maxLength={70}
              value={newLessonName}
            />
          </FormGroup>
          <input
            type="file"
            ref={documentFileInputRef}
            style={{ display: "none" }}
            onChange={(e) => documentLessonFilePickerHandler(e)}
          />
          <FormGroup className="mb-3 mt-3">
            <Button
              style={{
                backgroundColor: "#000000",
                color: "#ffffff",
                margin: "5px 0",
                boxShadow: "none",
              }}
              onClick={buttonDocumentFileUploadEventHandler}
              block
            >
              Upload Document File
            </Button>
          </FormGroup>
          {documentFile === null && showDocumentFileError === true && (
            <p className="video-file-required-text">document file required</p>
          )}
          {documentFile !== null && (
            <p
              style={{
                fontWeight: "600",
              }}
              className="video-file-required-text"
            >
              {documentFile.name}
            </p>
          )}
        </div>
        <div className="modal-footer">
          <Button
            className="modal-btn-style-outline"
            style={{
              paddingLeft: "35px",
              paddingRight: "35px",
            }}
            onClick={closeDocumentModal}
            size="large"
          >
            Cancel
          </Button>
          <Button
            onClick={saveDocument}
            className="modal-btn-style"
            style={{
              paddingLeft: "30px",
              paddingRight: "30px",
            }}
            size="large"
          >
            Save Document
          </Button>
        </div>
      </Modal>
      <GeneratingSignatureLoadingModal isOpen={openGeneratingSignaturModal} />
      <VideoUploadProgressModal
        isOpen={videoUploadProgressModal}
        loaded={loaded}
      />
      <FinalizingVideoUploadModal isOpen={saveVideoDataToBackendLoading} />
      <Modal isOpen={showPaymentModal} size="md" centered>
        <div className="modal-header plan-upgrade-modal__header">
          <h3>Plan Upgrade</h3>
          <div
            onClick={() => setShowPaymentModal(false)}
            className="modal-close__btn"
          >
            <i className="fas fa-times"></i>
          </div>
        </div>
        <div className="modal-body plan-upgrade-modal__body">
          <p className="text-center lead">
            You have used the total amount of storage space allocated to you as
            per your plan. <br /> Consider Upgrading your plan to get more
            space.
          </p>
        </div>
        <div className="modal-footer">
          <Button
            block
            tag={Link}
            to="/dashboard/plans/payment"
            className="modal-btn-style"
          >
            Upgrade Plan
          </Button>
        </div>
      </Modal>
      <Modal centered isOpen={displayFeatureInPorgress}>
        <div className="modal-header plan-upgrade-modal__header">
          <h3>Feature Coming Soon</h3>
          <div
            onClick={() => setDisplayFeatureInProgress(false)}
            className="modal-close__btn"
          >
            <i className="fas fa-times"></i>
          </div>
        </div>
        <div className="modal-body plan-upgrade-modal__body">
          <p className="text-center lead">
            This Feature is currently being developed. <br />
            Only Video Course Contents are allowed for now.
          </p>
        </div>
        <div className="modal-footer">
          <Button
            onClick={() => setDisplayFeatureInProgress(false)}
            block
            className="modal-btn-style"
          >
            Ok
          </Button>
        </div>
      </Modal>
    </>
  );
};

const mapStateToProps = (state) => ({
  course: state.course.courseDetails,
  modules: state.modules.courseModules,
  modulesLoading: state.modules.loading,
});

const mapDispatchToProps = (dispatch) => ({
  addCourseModule: (moduleInfo, courseId) =>
    dispatch(addNewCourseModule(moduleInfo, courseId)),
  loadModules: (courseId) => dispatch(loadCourseModules(courseId)),
  createUnit: (data) => dispatch(addNewCourseUnitToModule(data)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CourseModuleOrganiser);
