import React from "react";

const TutorUnitItem = ({
  unitItem,
  loadUnit,
  scrollToVideo,
  pauseVideoOnCourseUnitChange,
  idOfActiveCourseUnit,
}) => {
  const loadCourseUnit = () => {
    loadUnit(unitItem._id);
    scrollToVideo();
    pauseVideoOnCourseUnitChange();
  };

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

  return (
    <>
      <div
        onClick={loadCourseUnit}
        className={`tutor-course-content__moduleunit-item ${
          idOfActiveCourseUnit === unitItem._id && "active-unit"
        }`}
      >
        <div className="tutor__moduleunit-item__container">
          <img
            src={unitItem.videothumbnail}
            alt="video thumbnail previewer"
            className="img-fluid img-preview"
          />
        </div>
        <div className="tutor-module-unit__secondary-info">
          <p title={unitItem.name} className="unit-name">
            {unitItem.name}
          </p>
          <div className="tutor-module-unit__video-duration">
            <p>{secondsToTime(unitItem.duration)}</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default TutorUnitItem;
