import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import axios from "axios";
import {
  Modal,
  ModalBody,
  ModalFooter,
  Button,
  UncontrolledTooltip,
  Tooltip,
} from "reactstrap";
import { useAlert } from "react-alert";
import { UPDATE_COURSE_UNIT_PREVIEW_STATUS } from "../../../../actions/types";
import { startLoading, stopLoading } from "../../../../actions/appLoading";
import setAuthToken from "../../../../utilities/setAuthToken";

import videoIcon2 from "../../../../images/video-icon-placeholder2.png";

const TooltipItem = (props) => {
  const { position = "bottom", id } = props;
  const [tooltipOpen, setTooltipOpen] = useState(false);

  const toggle = () => setTooltipOpen(!tooltipOpen);
  return (
    <span>
      <span id={"tooltip-" + id}>{props.children}</span>
      <Tooltip
        placement={position}
        isOpen={tooltipOpen}
        target={"tooltip-" + id}
        toggle={toggle}
      >
        {props.title}
      </Tooltip>
    </span>
  );
};

export const CourseVideoItem = ({ courseUnit, handleDeleteVideoUnitClick }) => {
  const [deleteCourseUnitModal, setDeleteCourseUnitModal] = useState(false);

  const dispatch = useDispatch();
  const alert = useAlert();

  const btnDeleteCourseUnitEventHandler = async (courseUnitId) => {
    await handleDeleteVideoUnitClick(courseUnitId);
    setDeleteCourseUnitModal(false);
  };

  const setUnitAsPreviewAble = async () => {
    if (localStorage.getItem("token")) {
      setAuthToken(localStorage.getItem("token"));
    }
    if (courseUnit.isStreamReady === false) {
      return alert.show("course unit still processing...", {
        type: "info",
      });
    }
    try {
      dispatch(startLoading());
      const res = await axios.put(
        `/api/v1/courseunit/preview/${courseUnit._id}/set`
      );
      dispatch({
        type: UPDATE_COURSE_UNIT_PREVIEW_STATUS,
        payload: res.data,
      });
      alert.show("updated successfully", { type: "success" });
      dispatch(stopLoading());
    } catch (error) {
      dispatch(stopLoading());
      alert.show(error.message, { type: "error" });
    }
  };

  const unSetUnitAsPreviewAble = async () => {
    if (localStorage.getItem("token")) {
      setAuthToken(localStorage.getItem("token"));
    }
    try {
      dispatch(startLoading());
      const res = await axios.put(
        `/api/v1/courseunit/preview/${courseUnit._id}/unset`
      );
      dispatch({
        type: UPDATE_COURSE_UNIT_PREVIEW_STATUS,
        payload: res.data,
      });
      alert.show("updated successfully", { type: "success" });
      dispatch(stopLoading());
    } catch (error) {
      dispatch(stopLoading());
      alert.show(error.message, { type: "error" });
    }
  };

  const handleUnreadyCourseUnitClick = (e) => {
    e.preventDefault();
    if (courseUnit.isCloudflareVideoErrorState === true) {
      return alert.show("Error with video, please contact support", {
        type: "info",
      });
    }
    alert.show("Please wait a while as video is being processed", {
      type: "info",
    });
  };

  return (
    <>
      <div className="course-video-item">
        <div className="course-video-item__img-container">
          {courseUnit.isStreamReady === false ? (
            <>
              <Link onClick={(e) => handleUnreadyCourseUnitClick(e)}>
                <img src={videoIcon2} alt="" />
              </Link>
            </>
          ) : (
            <>
              <Link
                to={`/dashboard/course/module/vidoepreview/${courseUnit._id}`}
              >
                <img src={courseUnit.videothumbnail} alt="" />
              </Link>
            </>
          )}
        </div>
        <div className="course-video-item-info__container">
          <div className="course-video-item__description-action">
            <p className="course-video-item__name ml-4">
              {courseUnit.isStreamReady === false ? (
                <>
                  <Link onClick={(e) => handleUnreadyCourseUnitClick(e)}>
                    {courseUnit.name}
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to={`/dashboard/course/module/vidoepreview/${courseUnit._id}`}
                  >
                    {courseUnit.name}
                  </Link>
                </>
              )}
            </p>
            {courseUnit.is_preview_able === false ? (
              <div
                id={`TooltipForSetpreviewicon-${courseUnit._id}`}
                onClick={setUnitAsPreviewAble}
              >
                <TooltipItem
                  id={"edit" + courseUnit._id}
                  title={"Set as Previewable."}
                >
                  <i className="far fa-eye-slash"></i>
                </TooltipItem>
              </div>
            ) : (
              <div
                id={`TooltipForUnsetpreviewicon-${courseUnit._id}`}
                onClick={unSetUnitAsPreviewAble}
              >
                <TooltipItem
                  id={"edit" + courseUnit._id}
                  title={"Unset as Previewable."}
                >
                  <i className="fas fa-eye" />
                </TooltipItem>
              </div>
            )}
            <div onClick={() => setDeleteCourseUnitModal(true)}>
              <i
                id="UncontrolledTooltipForDeletevideo"
                className="fas fa-trash-alt"
              ></i>
              <UncontrolledTooltip
                placement="bottom"
                target="UncontrolledTooltipForDeletevideo"
              >
                Delete video from module.
              </UncontrolledTooltip>
            </div>
          </div>
          <div className="course-video-item-process__state">
            {courseUnit.isStreamReady === false ? (
              <>
                {courseUnit.isCloudflareVideoErrorState === false ? (
                  <>
                    <p
                      style={{
                        color: "#FFA500",
                      }}
                    >
                      Processing video
                    </p>
                  </>
                ) : (
                  <>
                    <p
                      style={{
                        color: "orangered",
                      }}
                    >
                      video error
                    </p>
                  </>
                )}
              </>
            ) : (
              <p
                style={{
                  color: "#00ab66",
                }}
              >
                Ready
              </p>
            )}
          </div>
        </div>
      </div>

      <Modal centered isOpen={deleteCourseUnitModal}>
        <div
          style={{
            fontWeight: "700",
            fontSize: "20",
            color: "#242121",
            textTransform: "uppercase",
          }}
          className="modal-header"
        >
          Delete Course Unit
        </div>
        <ModalBody>
          <p className="text-center">
            Are you sure you want to delete this course Unit ? <br />
            <span
              style={{
                color: "#f5365c",
              }}
            >
              Caution
            </span>{" "}
            This can not be changed!
          </p>
        </ModalBody>
        <ModalFooter>
          <Button
            className="modal-btn-style-outline"
            onClick={() => setDeleteCourseUnitModal(false)}
            style={{
              paddingLeft: "40px",
              paddingRight: "40px",
            }}
          >
            Cancel
          </Button>{" "}
          <Button
            className="modal-btn-style"
            onClick={() => btnDeleteCourseUnitEventHandler(courseUnit._id)}
            style={{
              paddingLeft: "40px",
              paddingRight: "40px",
            }}
          >
            Delete
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};
export default CourseVideoItem;
