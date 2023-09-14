import React from "react";

const CourseItemDisplayMoreInfo = ({ course, theme }) => {
  return (
    <>
      <div className="display-page__more-info">
        <div
          className="content-info"
          style={{
            color: theme?.themestyles.primarytextcolor,
          }}
        >
          <div className="content-info-header">Prerequisites.</div>
          <div className="content-info-body">{course?.prerequisite}</div>
        </div>

        <div
          className="content-info"
          style={{
            color: theme?.themestyles.primarytextcolor,
          }}
        >
          <div className="content-info-header">Language.</div>
          <div className="content-info-body">{course?.language}</div>
        </div>

        <div
          className="content-info"
          style={{
            color: theme?.themestyles.primarytextcolor,
          }}
        >
          <div className="content-info-header">Category.</div>
          <div className="content-info-body">{course?.category}</div>
        </div>

        <div
          className="content-info"
          style={{
            color: theme?.themestyles.primarytextcolor,
          }}
        >
          <div className="content-info-header">Subtitle.</div>
          <div className="content-info-body">{course?.subtitle}</div>
        </div>

        <div
          className="content-info"
          style={{
            color: theme?.themestyles.primarytextcolor,
          }}
        >
          <div className="content-info-header">Description.</div>
          <div className="content-info-body">{course?.description}</div>
        </div>

        <div
          className="content-info"
          style={{
            color: theme?.themestyles.primarytextcolor,
          }}
        >
          <div className="content-info-header">Level.</div>
          <div className="content-info-body">{course?.level}</div>
        </div>
      </div>
    </>
  );
};

export default CourseItemDisplayMoreInfo;
