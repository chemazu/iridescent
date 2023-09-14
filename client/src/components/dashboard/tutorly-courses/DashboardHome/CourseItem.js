import React from "react";
import { Col } from "reactstrap";
import { Link } from "react-router-dom";

const CourseItem = ({ course, idToLinkTo }) => {
  return (
    <>
      <Col xs="12" sm="6" md="6" xl="3">
        <div className="tutor-course-item-dashboard">
          <div className="tutor-course-item-dashboard-card-img">
            <Link to={`/dashboard/course/content/${idToLinkTo}`}>
              <img src={course.thumbnail} alt="..." />
            </Link>
          </div>
          <div className="tutor-course-item-dashboard-card-info">
            <div
              title={course.title}
              className="tutor-course-item-title__container"
            >
              <Link to={`/dashboard/course/content/${idToLinkTo}`}>
                {course.title}
              </Link>
            </div>
            <p className="tutor-course-item-author-info">courses</p>
            <p className="tutor-course-item-level">{course.level}</p>
            <p className="tutor-course-item-price">{course.price}</p>
          </div>
        </div>
      </Col>
    </>
  );
};

export default CourseItem;
