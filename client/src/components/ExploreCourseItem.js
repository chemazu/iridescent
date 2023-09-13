import React from "react";
import { Col } from "reactstrap";
// import { forwardRef } from 'react';
import CurrencyFormat from "react-currency-format";

const getSchoolUrl = (schoolname) => {
  const host = window.location.host;
  if (host.includes("localhost")) {
    return `http://${schoolname}.${host}`;
  }
  const baseDomain = host.split(".")[1];
  return baseDomain.includes("localhost")
    ? `http://${schoolname}.${baseDomain}`
    : `https://${schoolname}.${baseDomain}.com`;
};

const handleOpenCoursePage = (username, courseId) => {
  // open link in new tab
  const schoolUrl = getSchoolUrl(username);
  window.open(`${schoolUrl}/preview/${courseId}`, "_blank");
};

const handleOpenSchoolPage = (username) =>
  window.open(getSchoolUrl(username), "_blank");

const ExploreCourseItem = ({
  course: { title, thumbnail, level, price, author, _id },
  refVariable,
}) => {
  return (
    <Col xs="12" sm="12" md="6" lg="4" xl="3">
      <div className="explore-course__item mx-auto" ref={refVariable}>
        <div
          onClick={() => handleOpenCoursePage(author.username, _id)}
          className="explore-course__item-image__container"
        >
          <img alt="preview display.." src={thumbnail} />
        </div>
        <div className="explore-course__item-details__container">
          <h4
            onClick={() => handleOpenCoursePage(author.username, _id)}
            className="explore-course-item__course-name"
          >
            {title}
          </h4>
          <p
            onClick={() => handleOpenSchoolPage(author.username)}
            className="explore-course-item__course-author"
          >
            {`${author.firstname} ${author.lastname}`}
          </p>
          <p className="explore-course-item__course-level">{level}</p>
          <h3 className="explore-course-item__course-price">
            &#8358;
            <CurrencyFormat
              value={price}
              displayType="text"
              thousandSeparator={true}
            />
          </h3>
        </div>
      </div>
    </Col>
  );
};

export default ExploreCourseItem;
