import React from "react";
import { useDispatch } from "react-redux";
import { LOAD_ACTIVE_VIDEO_PREVIEW } from "../../actions/types";

const CourseUnitVideoPreviewItem = ({ preview, theme }) => {
  const dispatch = useDispatch();

  function secondsToTime(e) {
    var h = Math.floor(e / 3600)
        .toString()
        .padStart(2, "0"),
      m = Math.floor((e % 3600) / 60)
        .toString()
        .padStart(2, "0"),
      s = Math.floor(e % 60)
        .toString()
        .padStart(2, "0");

    return h + ":" + m + ":" + s;
  }

  const loadActiveVideoReview = () => {
    dispatch({
      type: LOAD_ACTIVE_VIDEO_PREVIEW,
      payload: preview,
    });
  };

  return (
    <>
      <div
        onClick={loadActiveVideoReview}
        style={{
          backgroundColor: theme.themestyles.coursecardbackgroundcolor,
        }}
        className="course-video-preview__item"
      >
        <div className="video-preview-item-img__container">
          <img src={preview.videothumbnail} alt="preview item" />
        </div>
        <div className="preview-item__details">
          <p
            style={{
              color: theme.themestyles.coursecardtextcolor,
            }}
            title={preview.name}
            className="preview-item__title"
          >
            {preview.name}
          </p>
          <p
            style={{
              color: theme.themestyles.coursecardtextcolor,
            }}
            className="preview-item__duration"
          >
            {secondsToTime(preview.duration)}
          </p>
        </div>
      </div>
    </>
  );
};

export default CourseUnitVideoPreviewItem;
