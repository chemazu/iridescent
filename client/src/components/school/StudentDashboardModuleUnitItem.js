import React from "react";

const StudentDashboardModuleUnitItem = ({
  unitItem,
  loadUnit,
  scrollToVideo,
  pauseVideoOnCourseUnitChange,
  idOfActiveCourseUnit,
  theme,
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
        style={{
          backgroundColor:
            (idOfActiveCourseUnit === unitItem._id) === true
              ? theme.themestyles.coursecardtextcolor
              : theme.themestyles.coursecardbackgroundcolor,
        }}
        onClick={loadCourseUnit}
        className={`student-dashboard__moduleunit-item ${
          idOfActiveCourseUnit === unitItem._id && "active-unit"
        }`}
      >
        <div className="student-dashboard__moduleunit-item__container">
          <img
            src={unitItem.videothumbnail}
            alt="video thumbnail previewer"
            className="img-fluid img-preview"
          />
        </div>
        <div
          style={{
            color:
              (idOfActiveCourseUnit === unitItem._id) === true
                ? theme.themestyles.coursecardbackgroundcolor
                : theme.themestyles.coursecardtextcolor,
          }}
          className="module-unit__secondary-info"
        >
          <p title={unitItem.name} className="unit-name">
            {unitItem.name}
          </p>
          <div className="module-unit__video-duration">
            <p>{secondsToTime(unitItem.duration)}</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default StudentDashboardModuleUnitItem;
