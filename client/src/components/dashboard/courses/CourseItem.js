import React from "react";
import { Link } from "react-router-dom";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { Col } from "reactstrap";

export const CourseItem = ({ course }) => {
  return (
    <>
      <Col className="mb-3" xs="12" sm="6" md="6" xl="4">
        <div className="author-course-item">
          <div className="author-course-item-img">
            <Link to={`/dashboard/course/setup/module/${course._id}`}>
              <LazyLoadImage
                className="img-fluid"
                src={course.thumbnail}
                alt="..."
              />
            </Link>
          </div>
          <div className="author-course-item-course-info">
            <div title={course.title} className="author-course-item-title">
              <Link to={`/dashboard/course/setup/module/${course._id}`}>
                {course.title}
              </Link>
            </div>

            <p className="author-course-item-author-info">
              {`${course.author.firstname} ${course.author.lastname}`}
            </p>
            <p className="author-course-card-price">&#x24;{course.price_usd}</p>
          </div>
        </div>
      </Col>
    </>
  );
};

export default CourseItem;
