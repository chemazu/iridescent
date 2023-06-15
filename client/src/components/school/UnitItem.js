import React from "react";
import { useDispatch } from "react-redux";
import {
  LOAD_ACTIVE_VIDEO_PREVIEW,
  DISPLAY_VIDEO_UNIT_PREVIEW_MODAL,
} from "../../actions/types";

export const UnitItem = ({ unitItem, theme, index }) => {
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

  const handleUnitItemPreviewBtnClick = (unitDetails) => {
    dispatch({
      type: LOAD_ACTIVE_VIDEO_PREVIEW,
      payload: unitDetails,
    });
    dispatch({ type: DISPLAY_VIDEO_UNIT_PREVIEW_MODAL });
  };

  return (
    <>
      <div
        style={{
          backgroundColor: theme.themestyles.coursecardbackgroundcolor,
        }}
        className="unit-item"
      >
        <div className="unit-item-img__container">
          <img
            src={unitItem.videothumbnail}
            className="img-fluid img-preview"
            alt="video thumbnail previewer"
          />
        </div>
        <div
          style={{
            color: theme.themestyles.coursecardtextcolor,
          }}
          className="video-secondary-info"
        >
          <div className="title-preview-btn__container">
            <p title={unitItem.name} className="mt-2 ml-2">
              {index + 1}
              {". "}
              {unitItem.name}
            </p>
            {unitItem.is_preview_able === true && (
              <>
                <p
                  onClick={() => handleUnitItemPreviewBtnClick(unitItem)}
                  className="mt-2 mr-3 preview-btn"
                >
                  Preview Video
                </p>
              </>
            )}
          </div>
          <div className="video-duration">
            <p className="mr-2">{secondsToTime(unitItem.duration)}</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default UnitItem;
