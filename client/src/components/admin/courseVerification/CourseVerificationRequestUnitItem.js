import React from "react";

const CourseVerificationRequestUnitItem = ({
  unitItem,
  setActiveCourseHandler,
}) => {
  const handleRequestItemClickHandler = () => setActiveCourseHandler(unitItem);

  return (
    <div
      onClick={handleRequestItemClickHandler}
      className="verification-request-unit__container"
    >
      <div className="verification-request-video-item">
        <div className="verification-request-video-item__img-container">
          <img src={unitItem.videothumbnail} alt="unit item thumbnail" />
        </div>
        <p className="verification-request-video-item__name ml-3">
          {unitItem.name}
        </p>
      </div>
    </div>
  );
};

export default CourseVerificationRequestUnitItem;
