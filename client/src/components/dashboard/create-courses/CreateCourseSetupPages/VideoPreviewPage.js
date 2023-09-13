import React, { useEffect, useState, useRef, useMemo } from "react";
import { connect } from "react-redux";
import {
  Row,
  Col,
  Container,
  Nav,
  NavItem,
  NavLink,
  Card,
  CardBody,
  TabContent,
  TabPane,
  FormGroup,
  Input,
  InputGroup,
  InputGroupAddon,
  Button,
} from "reactstrap";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAlert } from "react-alert";
import DashboardNavbar from "../../DashboardNavbar";
import VideoJS from "../../../VideoJSPlayer/VideoJS";
import {
  loadCourseUnit,
  updateCourseUnitName,
  updateCourseUnitVideo,
  addAttachmentToCourseUnit,
} from "../../../../actions/courseunit";
import CommentsItem from "./CommentsItem";
import AttachmentItem from "./AttachmentItem";
import setAuthToken from "../../../../utilities/setAuthToken";

import "../../../../custom-styles/dashboard/dashboardlayout.css";
import "../../../../custom-styles/dashboard/videounitpreview.css";

import NotificationNavbar from "../../NotificationNavbar";
import GeneratingSignatureLoadingModal from "./GeneratingSignatureLoadingModal";
import VideoUploadProgressModal from "./VideoUploadProgressModal";
import FinalizingVideoUploadModal from "./FinalizingVideoUploadModal";

export const VideoPreviewPage = ({
  match,
  courseunit: { loading, unitDetails },
  course,
  loadUnit,
  updateUnitName,
  updateUnitVideo,
  addAttachment,
}) => {
  const [iconTabsSelect, updateIconTabsSelect] = useState({
    iconTabs: 1,
    plainTabs: 1,
  });

  const [videoName, setVideoName] = useState({
    name: "",
  });

  const [commentDetails, setCommentDetails] = useState(null);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [commentsPagination, setCommentsPagination] = useState(1);
  const [loadingMoreTextDisplay, setLoadingMoreTextDisplay] = useState(false);
  const [attachmentFile, setAttachmentFile] = useState(null);
  const attachmentRef = useRef();
  const videoInputRef = useRef();
  const customAlert = useAlert();

  const [openGeneratingSignatureModal, setGeneratingSignatureModal] =
    useState(false);
  const [videoUploadProgressModal, setVideoUploadProgressModal] =
    useState(false);
  const [saveVideoDataToBackendLoading, setSaveVideoDataToBackendLoading] =
    useState(false);
  const [loaded, setLoaded] = useState(0);
  const [cloudinaryVideoUploadModalData, setCloudinaryVideoUploadData] =
    useState(null);

  const handleAttachmentFileChange = () => attachmentRef.current.click();
  const updateVideo = () => videoInputRef.current.click();

  const toggleNavs = (e, name, value) => {
    e.preventDefault();
    updateIconTabsSelect({
      ...iconTabsSelect,
      [name]: value,
    });
  };

  const editVideoNameHandler = (e) =>
    setVideoName({
      name: e.target.value,
    });

  const onAttachmentFileUpdate = (e) => {
    if (e.target.files.length === 0) {
      setAttachmentFile(null);
    }
    setAttachmentFile(e.target.files[0]);
  };

  const submitVideoNameUpdates = () => {
    if (videoName.name.length === 0) {
      return customAlert.show("video name cannot be empty", {
        type: "error",
      });
    }
    updateUnitName(videoName, unitDetails._id);
  };

  const submitNewAttachment = () => {
    const formData = new FormData();
    formData.append("attachment", attachmentFile);
    addAttachment(formData, unitDetails._id);
    setAttachmentFile(null);
  };

  // eslint-disable-next-line
  const generateSignaturesForVideoFileUpload = async (videoFileSize) => {
    setGeneratingSignatureModal(true);
    if (localStorage.getItem("token")) {
      setAuthToken(localStorage.getItem("token"));
    }
    try {
      const res = await axios.get(
        `/api/v1/courseunit/upload/signature/${unitDetails.course}/${videoFileSize}`
      );
      setGeneratingSignatureModal(false);
      return res.data;
    } catch (error) {
      setGeneratingSignatureModal(false);
      customAlert.show(error.message, {
        type: "error",
      });
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
    cloudname,
    videoFile
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
            customAlert.show("video uploaded successfully", {
              type: "success",
            });
            setLoaded(0);
          }
        })
        .catch((error) => {
          console.log(JSON.stringify(error));
          setVideoUploadProgressModal(false);
          setLoaded(0);
          customAlert.show("video upload failed. Try Later", {
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
      chunkForm.append("eager", eager);
      chunkForm.append("folder", folder);

      uploadChunk(chunkForm, start, chunkEnd);
    };

    createChunk(start);
  };

  const onVideoUpdateClickHandler = async (e) => {
    if (e.target.files.length === 0) {
      return customAlert.show("video file cannot be empty", {
        type: "error",
      });
    }

    if (e.target.files.length > 1) {
      return customAlert.show("Only one upload allowed at a time.", {
        type: "error",
      });
    }

    const fileSizeInMegaBytes = e.target.files[0].size / (1024 * 1024); // uploaded filesize in MB
    const fileSizeRoundedToNearestDecimal =
      Math.round(fileSizeInMegaBytes * 10) / 10;
    if (fileSizeRoundedToNearestDecimal > 200) {
      return customAlert.show("Video file cannot exceed 200MB", {
        type: "error",
      });
    }

    const videoFile = e.target.files[0];

    try {
      const uploadData = await getCloudflareUploadUrl(fileSizeInMegaBytes);
      if (uploadData.result.success === false) {
        console.log(uploadData.result.errors);
        throw new Error("error uploading video");
      }
      await saveVideoToCloudFlare(uploadData.result.uploadURL, videoFile);
      const courseUnitWithUpdates = await sendCloudflareUpdatesToBackend(
        uploadData.result.uid
      );
      updateUnitVideo(courseUnitWithUpdates);
    } catch (error) {
      console.log(error);
      customAlert.show("error uploading video", {
        type: "error",
      });
    }
    // const signatureData = await generateSignaturesForVideoFileUpload(
    //   fileSizeRoundedToNearestDecimal
    // );

    // await processFile(
    //   signatureData.signature,
    //   signatureData.apikey,
    //   signatureData.timestamp,
    //   signatureData.eager,
    //   signatureData.folder,
    //   signatureData.cloudname,
    //   videoFile
    // );
  };

  const saveUpdatesToDatabase = async (
    videoUpdates,
    courseId,
    courseUnitId
  ) => {
    try {
      setSaveVideoDataToBackendLoading(true);
      if (localStorage.getItem("token")) {
        setAuthToken(localStorage.getItem("token"));
      }
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };
      const body = JSON.stringify(videoUpdates);
      const res = await axios.put(
        `/api/v1/courseunit/video/${courseId}/${courseUnitId}`,
        body,
        config
      );
      customAlert.show("video updated successfully", {
        type: "success",
      });
      setSaveVideoDataToBackendLoading(false);
      return res.data;
    } catch (error) {
      const errors = error.response.data.errors | [];
      if (errors) {
        errors.forEach((element) => {
          customAlert.show(element.msg, {
            type: "error",
          });
        });
      }
      console.log(JSON.stringify(error, "error updating"));
      setSaveVideoDataToBackendLoading(false);
      return null;
    }
  };

  const postDataToBackend = async (uploadResponse) => {
    const videoData = {
      videourl: uploadResponse.secure_url,
      videopublicid: uploadResponse.public_id,
      filesize: uploadResponse.bytes,
      duration: uploadResponse.duration,
    };
    try {
      const courseUnit = await saveUpdatesToDatabase(
        videoData,
        unitDetails.course,
        unitDetails._id
      );
      updateUnitVideo(courseUnit);
    } catch (error) {
      console.log(error);
      customAlert.show("error updating video", {
        type: "error",
      });
    }
  };

  useEffect(() => {
    if (cloudinaryVideoUploadModalData) {
      postDataToBackend(cloudinaryVideoUploadModalData);
    }
    // eslint-disable-next-line
  }, [cloudinaryVideoUploadModalData]);

  useEffect(() => {
    loadUnit(match.params.videoId);
  }, [match.params.videoId, loadUnit]);

  useEffect(() => {
    if (unitDetails) {
      setVideoName({
        name: unitDetails.name,
      });
    }
  }, [unitDetails]);

  // useEffect called to load courseunit comments
  useEffect(() => {
    loadComments(match.params.videoId);
    // eslint-disable-next-line
  }, [match.params.videoId]);

  const loadComments = async (courseUnitId) => {
    if (localStorage.getItem("token")) {
      setAuthToken(localStorage.getItem("token"));
    }
    const res = await axios.get(
      `/api/v1/comment/${courseUnitId}/?page=${commentsPagination}&size=3`
    );
    setCommentDetails(res.data);
    setComments(res.data.docs);
    setCommentsPagination(res.data.nextPage);
    setLoadingComments(false);
  };

  const loadMoreComments = async (courseUnitId) => {
    if (localStorage.getItem("token")) {
      setAuthToken(localStorage.getItem("token"));
    }
    setLoadingMoreTextDisplay(true);
    const res = await axios.get(
      `/api/v1/comment/${courseUnitId}/?page=${commentsPagination}&size=3`
    );
    setCommentDetails(res.data);
    setComments([...comments, ...res.data.docs]);
    setCommentsPagination(res.data.nextPage);
    setLoadingMoreTextDisplay(false);
  };

  const seeLessComments = async (courseUnitId) => {
    if (localStorage.getItem("token")) {
      setAuthToken(localStorage.getItem("token"));
    }
    const res = await axios.get(
      `/api/v1/comment/${courseUnitId}/?page=1&size=3`
    );
    setCommentDetails(res.data);
    setComments(res.data.docs);
    setCommentsPagination(res.data.nextPage);
    setLoadingComments(false);
  };

  // cloudflare upload implementations
  const getCloudflareUploadUrl = async (videoFileSize) => {
    setGeneratingSignatureModal(true);
    if (localStorage.getItem("token")) {
      setAuthToken(localStorage.getItem("token"));
    }
    try {
      const res = await axios.get(
        `/api/v1/courseunit/upload/url/cloudflare/${unitDetails.course}/${videoFileSize}`
      );
      setGeneratingSignatureModal(false);
      return res.data;
    } catch (error) {
      setGeneratingSignatureModal(false);
      customAlert.show(error.message, {
        type: "error",
      });
      return null;
    }
  };

  // save video to cloudflare
  const saveVideoToCloudFlare = async (uploadurl, file) => {
    setVideoUploadProgressModal(true);
    try {
      const config = {
        onUploadProgress: (event) => {
          const progress = Math.round((event.loaded / event.total) * 100);
          setLoaded(progress);
        },
      };
      const formUpload = new FormData();
      formUpload.append("file", file);
      delete axios.defaults.headers.common["x-auth-token"];
      await axios.post(uploadurl, formUpload, config);
      customAlert.show("uploaded successfully", {
        type: "success",
      });
      setLoaded(0);
      setVideoUploadProgressModal(false);
    } catch (error) {
      setVideoUploadProgressModal(false);
      setLoaded(0);
      customAlert.show("error uploading video", {
        type: "error",
      });
    }
  };

  const sendCloudflareUpdatesToBackend = async (video_id) => {
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
      videoId: video_id,
    });
    try {
      const res = await axios.put(
        `/api/v1/courseunit/upload/update/cloudflare/${unitDetails.course}/${unitDetails._id}`,
        body,
        config
      );
      customAlert.show("video updated successfully", {
        type: "success",
      });
      setSaveVideoDataToBackendLoading(false);
      return res.data;
    } catch (error) {
      setSaveVideoDataToBackendLoading(false);
      customAlert.show(error.message, {
        type: "error",
      });
      return null;
    }
  };

  const videoJsOptions = useMemo(() => {
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
      videotitle: unitDetails?.name,
      sources:
        unitDetails?.isCloudflareVideoSource !== true
          ? [
              {
                src: unitDetails?.videourl,
                type: "video/mp4",
              },
              {
                src: unitDetails?.webmvideourl,
                type: "video/webm",
              },
              {
                src: unitDetails?.ogvvideourl,
                type: "video/ogg",
              },
            ]
          : [
              {
                src: unitDetails?.cloudflare_hsl_videourl,
                type: "application/x-mpegURL",
              },
              {
                src: unitDetails?.cloudflare_dash_videourl,
                type: "application/dash+xml",
              },
            ],
    };
    return options;
  }, [unitDetails]);

  return (
    <>
      <div className="dashboard-layout">
        <Container fluid>
          <Row>
            <DashboardNavbar />
            <Col className="page-actions__col">
              <div className="page-actions">
                <NotificationNavbar />
                {loading === true && unitDetails === null ? (
                  <p className="text-center lead">loading...</p>
                ) : (
                  <>
                    <div className="video-preview-container">
                      <div className="video-preview-page-controls">
                        <div className="previous-page-arrow">
                          <Link
                            to={`/dashboard/course/setup/module/${unitDetails?.course}`}
                          >
                            <i className="fas fa-arrow-left"></i>
                          </Link>
                        </div>
                        <div className="nav-wrapper">
                          <Nav
                            className="nav-fill flex-column flex-md-row"
                            id="tabs-icons-text"
                            pills
                            role="tablist"
                          >
                            <NavItem>
                              <NavLink
                                aria-selected={iconTabsSelect.iconTabs === 1}
                                className={`mb-sm-3 mb-md-0 ${
                                  iconTabsSelect.iconTabs === 1 && "active"
                                }`}
                                onClick={(e) => toggleNavs(e, "iconTabs", 1)}
                                role="tab"
                              >
                                Preview
                              </NavLink>
                            </NavItem>
                            <NavItem>
                              <NavLink
                                aria-selected={iconTabsSelect.iconTabs === 2}
                                className={`mb-sm-3 mb-md-0 ${
                                  iconTabsSelect.iconTabs === 2 && "active"
                                }`}
                                onClick={(e) => toggleNavs(e, "iconTabs", 2)}
                                role="tab"
                              >
                                Edit
                              </NavLink>
                            </NavItem>
                          </Nav>
                        </div>
                      </div>
                      <div className="tab-contents">
                        <Card>
                          <CardBody>
                            <TabContent
                              activeTab={"iconTabs" + iconTabsSelect.iconTabs}
                            >
                              <TabPane tabId="iconTabs1">
                                <p className="text-center title-style">
                                  Preview Video Content
                                </p>
                                <h2 className="text-center video-name">
                                  {unitDetails.name}
                                </h2>
                                <div className="video-player__container">
                                  {unitDetails.isCloudflareVideoSource !==
                                  true ? (
                                    <>
                                      <VideoJS options={videoJsOptions} />
                                    </>
                                  ) : (
                                    <>
                                      {unitDetails.isStreamReady === true ? (
                                        <>
                                          <VideoJS options={videoJsOptions} />
                                        </>
                                      ) : (
                                        <>
                                          <div className="video-unit-still-processing__message">
                                            <p className="text-center">
                                              Video is still processing. Refresh
                                              page to update.
                                            </p>
                                          </div>
                                        </>
                                      )}
                                    </>
                                  )}
                                </div>
                                <div className="comments-container">
                                  {loadingComments ? (
                                    <div
                                      style={{
                                        width: "50%",
                                        margin: "20px auto",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                      }}
                                    >
                                      <i
                                        style={{ fontSize: "22px" }}
                                        className="fas fa-circle-notch fa-spin"
                                      ></i>
                                    </div>
                                  ) : (
                                    <>
                                      {comments.length === 0 ? (
                                        <p className="text-center lead mt-3 mb-3">
                                          No comments found
                                        </p>
                                      ) : (
                                        <>
                                          {comments.map((comment) => (
                                            <CommentsItem
                                              key={comment._id}
                                              comment={comment}
                                              courseunitId={unitDetails._id}
                                              courseChapterId={
                                                unitDetails.coursechapter
                                              }
                                            />
                                          ))}
                                        </>
                                      )}
                                    </>
                                  )}
                                  {loadingMoreTextDisplay && (
                                    <p className="text-center lead">
                                      loading more...
                                    </p>
                                  )}
                                  {commentDetails !== null && (
                                    <div className="comments-container__controls">
                                      <p className="comments-total-placeholder">
                                        {commentDetails.totalDocs} comments
                                      </p>
                                      {commentDetails.hasNextPage === true ? (
                                        <button
                                          onClick={(e) =>
                                            loadMoreComments(unitDetails._id)
                                          }
                                          className="load-more-comments ml-5"
                                        >
                                          <i className="fas fa-circle"></i> View
                                          More
                                        </button>
                                      ) : (
                                        <button
                                          onClick={(e) =>
                                            seeLessComments(unitDetails._id)
                                          }
                                          className="load-more-comments ml-5"
                                        >
                                          <i className="fas fa-circle"></i> See
                                          Less
                                        </button>
                                      )}
                                    </div>
                                  )}
                                </div>
                                <div className="attachments-container">
                                  <h4 className="text-center mb-4">
                                    Course Unit Attachments
                                  </h4>
                                  {unitDetails.attachment.length === 0 ? (
                                    <p
                                      style={{
                                        fontWeight: "500",
                                        fontSize: "14px",
                                      }}
                                      className="text-center mt-3 mb-3"
                                    >
                                      No Attachments for this course Unit
                                    </p>
                                  ) : (
                                    <>
                                      {unitDetails.attachment.map((item) => (
                                        <AttachmentItem
                                          key={item._id}
                                          attachment={item}
                                          courseUnitId={unitDetails._id}
                                        />
                                      ))}
                                    </>
                                  )}
                                </div>
                              </TabPane>
                              <TabPane tabId="iconTabs2">
                                <p className="text-center title-style">
                                  Edit Video Content
                                </p>
                                <h2 className="text-center video-name">
                                  {unitDetails.name}
                                </h2>
                                <div className="edits-controls-container">
                                  <div className="edit-course-unit-name mb-4">
                                    <h4>Update course unit name</h4>
                                    <FormGroup>
                                      <InputGroup>
                                        <Input
                                          aria-label="Edit video name"
                                          placeholder="Edit video name"
                                          type="text"
                                          value={videoName.name}
                                          onChange={(e) =>
                                            editVideoNameHandler(e)
                                          }
                                        ></Input>
                                        <InputGroupAddon addonType="append">
                                          <Button
                                            disabled={
                                              unitDetails.name ===
                                              videoName.name
                                            }
                                            onClick={submitVideoNameUpdates}
                                            className="update-video-name-btn"
                                            type="button"
                                          >
                                            Update Video Name
                                          </Button>
                                        </InputGroupAddon>
                                      </InputGroup>
                                    </FormGroup>
                                  </div>
                                  <div className="course-unit-video-edit mb-4">
                                    <h4>Replace course unit video</h4>
                                    <div className="update-course-unit-video">
                                      <div
                                        onClick={updateVideo}
                                        className="update-course-unit-video-btn"
                                      >
                                        <input
                                          ref={videoInputRef}
                                          type="file"
                                          onChange={(e) =>
                                            onVideoUpdateClickHandler(e)
                                          }
                                          style={{
                                            display: "none",
                                          }}
                                        />
                                        <i className="fas fa-upload"></i>
                                        <p className="text-center mt-3">
                                          Click to Upload Video
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="course-unit-attachment">
                                    <h4>Add Attachment to course unit</h4>
                                    <InputGroup>
                                      <Input
                                        aria-describedby="button-addon4"
                                        aria-label="attachment filename"
                                        placeholder="attachment filename"
                                        type="text"
                                        value={
                                          attachmentFile !== null
                                            ? attachmentFile?.name
                                            : ""
                                        }
                                      ></Input>
                                      <input
                                        type="file"
                                        ref={attachmentRef}
                                        style={{ display: "none" }}
                                        onChange={(e) =>
                                          onAttachmentFileUpdate(e)
                                        }
                                      />
                                      <InputGroupAddon
                                        addonType="append"
                                        id="button-addon4"
                                      >
                                        <Button
                                          onClick={handleAttachmentFileChange}
                                          color="primary"
                                          className="attachment-btn-style"
                                          outline
                                          type="button"
                                        >
                                          Pick File
                                        </Button>
                                        <Button
                                          onClick={submitNewAttachment}
                                          disabled={attachmentFile === null}
                                          color="primary"
                                          className="attachment-btn-style"
                                          outline
                                          type="button"
                                        >
                                          Upload Attachment
                                        </Button>
                                      </InputGroupAddon>
                                    </InputGroup>
                                  </div>
                                </div>
                              </TabPane>
                            </TabContent>
                          </CardBody>
                        </Card>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </Col>
          </Row>
        </Container>
      </div>
      <GeneratingSignatureLoadingModal isOpen={openGeneratingSignatureModal} />
      <VideoUploadProgressModal
        isOpen={videoUploadProgressModal}
        loaded={loaded}
      />
      <FinalizingVideoUploadModal isOpen={saveVideoDataToBackendLoading} />
    </>
  );
};

const mapStateToProps = (state) => ({
  courseunit: state.courseunit,
  course: state.course.courseDetails,
});

const mapDispatchToProps = (dispatch) => ({
  loadUnit: (courseUnitId) => dispatch(loadCourseUnit(courseUnitId)),
  updateUnitName: (updates, courseUnitId) =>
    dispatch(updateCourseUnitName(updates, courseUnitId)),
  updateUnitVideo: (videoFile, courseId, courseUnitId) =>
    dispatch(updateCourseUnitVideo(videoFile, courseId, courseUnitId)),
  addAttachment: (attachmentFile, courseUnitId) =>
    dispatch(addAttachmentToCourseUnit(attachmentFile, courseUnitId)),
});

export default connect(mapStateToProps, mapDispatchToProps)(VideoPreviewPage);
