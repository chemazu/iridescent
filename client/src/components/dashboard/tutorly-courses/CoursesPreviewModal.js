import React, { useState, useEffect, useMemo } from "react";
import { Modal } from "reactstrap";
import { connect, useDispatch } from "react-redux";
import { useAlert } from "react-alert";
import axios from "axios";
import {
  CLOSE_VIDEO_UNIT_PREVIEW_MODAL,
  EMPTY_ACTIVE_VIDEO_PREVIEW,
  EMPTY_COURSE_PREVIEWABLE_LIST,
  LOAD_COURSE_PREVIEWABLE_LIST,
} from "../../../actions/types";
import CourseUnitVideoPreviewItem from "../../school/CourseUnitVideoPreviewItem";
import VideoJS from "../../VideoJSPlayer/VideoJS";
// import CourseUnitVideoPreviewItem from "./CourseUnitVideoPreviewItem";

const CourseUnitVideoPreviewModal = ({
  preview: { displayPlayer, previewableList, unitInPreview },
  theme,
}) => {
  const [loading, setLoading] = useState(false);
  const alert = useAlert();
  const dispatch = useDispatch();

  const handleVideoWalkThroughModal = () =>
    dispatch({ type: CLOSE_VIDEO_UNIT_PREVIEW_MODAL });
  const getCoursePreviewAblelist = async (courseId) => {
    try {
      const res = await axios.get(`/api/v1/courseunit/preview/${courseId}`);
      dispatch({
        type: LOAD_COURSE_PREVIEWABLE_LIST,
        payload: res.data,
      });
      setLoading(false);
    } catch (error) {
      setLoading(false);
      const errors = error.response.data.errors;
      if (errors) {
        return errors.forEach((err) => {
          alert.show(err.msg, {
            type: "error",
          });
        });
      }
      alert.show(error.message, {
        type: "error",
      });
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
      videotitle: unitInPreview?.name,
      sources:
        unitInPreview?.isCloudflareVideoSource !== true
          ? [
              {
                src: unitInPreview?.videourl,
                type: "video/mp4",
              },
              {
                src: unitInPreview?.videourl.replace(".mp4", ".webm"),
                type: "video/webm",
              },
              {
                src: unitInPreview?.videourl.replace(".mp4", ".ogv"),
                type: "video/ogg",
              },
            ]
          : [
              {
                src: unitInPreview?.cloudflare_hsl_videourl,
                type: "application/x-mpegURL",
              },
              {
                src: unitInPreview?.cloudflare_dash_videourl,
                type: "application/dash+xml",
              },
            ],
    };
    return options;
  }, [unitInPreview]);

  useEffect(() => {
    getCoursePreviewAblelist(unitInPreview?.course);
    return () => {
      dispatch({ type: EMPTY_ACTIVE_VIDEO_PREVIEW });
      dispatch({ type: EMPTY_COURSE_PREVIEWABLE_LIST });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Modal isOpen={displayPlayer} size="lg" backdrop fade>
        {unitInPreview === null ? (
          <>
            <div
              style={{
                backgroundColor: theme?.themestyles.primarybackgroundcolor,
                color: theme?.themestyles.primarytextcolor,
              }}
              className="display-preview-error"
            >
              <p>No Preview Selected</p>
              <div
                onClick={handleVideoWalkThroughModal}
                className="close-preview-modal"
                style={{ cursor: "pointer" }}
              >
                <i className="fas fa-times"></i>
              </div>
            </div>
          </>
        ) : (
          <>
            <div
              style={{
                backgroundColor: theme?.themestyles.primarybackgroundcolor,
                color: theme?.themestyles.primarytextcolor,
                borderBottomColor: theme?.themestyles.primarytextcolor,
              }}
              className="modal-header preview-modal__header"
            >
              <h3
                style={{
                  color: theme?.themestyles.primarytextcolor,
                }}
              >
                {unitInPreview.name}
              </h3>
              <div
                onClick={handleVideoWalkThroughModal}
                className="close-preview-modal"
              >
                <i className="fas fa-times"></i>
              </div>
            </div>
            <div
              style={{
                backgroundColor:
                  theme?.themestyles.secondarypagebackgroundcolor,
              }}
              className="preview-player-video__player"
            >
              {unitInPreview.unitInPreviewisCloudflareVideoSource !== true ? (
                <>
                  <VideoJS options={videoJsOptions} />
                </>
              ) : (
                <>
                  {unitInPreview.isStreamReady === true ? (
                    <>
                      <VideoJS options={videoJsOptions} />
                    </>
                  ) : (
                    <>
                      <div className="video-unit-still-processing__message">
                        <p className="text-center">
                          Video is still processing. Refresh page to update.
                        </p>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
            <div
              style={{
                backgroundColor:
                  theme?.themestyles.secondarypagebackgroundcolor,
              }}
              className="previewable-list__container"
            >
              <h4
                style={{
                  color: theme.themestyles.primarytextcolor,
                }}
              >
                Course Preview List.
              </h4>
              {loading ? (
                <>
                  <div className="modal-loader-container">
                    <div
                      style={{
                        width: "50%",
                        margin: "10px auto",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "40px 10px",
                      }}
                    >
                      <i
                        style={{
                          fontSize: "22px",
                          color: theme.themestyles.primarytextcolor,
                        }}
                        className="fas fa-circle-notch fa-spin"
                      ></i>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {previewableList.length === 0 ? (
                    <p
                      style={{
                        color: theme.themestyles.primarytextcolor,
                      }}
                    >
                      No More Previews!
                    </p>
                  ) : (
                    <>
                      {previewableList.map((previewItem) => (
                        <CourseUnitVideoPreviewItem
                          key={previewItem._id}
                          preview={previewItem}
                          theme={theme}
                        />
                      ))}
                    </>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </Modal>
    </>
  );
};

const mapStateToProps = (state) => ({
  preview: state.preview,
});

export default connect(mapStateToProps)(CourseUnitVideoPreviewModal);
