import React from "react";
import { Link } from "react-router-dom";
import { Button } from "reactstrap";
import CurrencyFormat from "react-currency-format";

const CourseVerificationRequestItem = ({ verificationItem }) => {
  return (
    <div className="course-verification-request__item">
      <div className="course-verification-request__item-img-container">
        <img
          src={verificationItem.course_id.thumbnail}
          alt="course thumbnail"
        />
      </div>
      <div className="course-verification-request__item-details">
        <p className="course-request-title">{verificationItem.title}</p>
        <div>
          <p className="course-request-author">{`${verificationItem.course_author.firstname} ${verificationItem.course_author.lastname}`}</p>
          <h4 className="course-request-price">
            &#8358;
            <CurrencyFormat
              value={verificationItem.course_id.price}
              displayType="text"
              thousandSeparator={true}
              fixedDecimalScale={true}
            />
          </h4>
        </div>
      </div>
      <div className="course-verification-request__item-cta">
        <Button
          disabled={verificationItem.is_verified}
          tag={Link}
          to={`/admin/course/review/${verificationItem._id}`}
          className={
            verificationItem.is_verified ? "btn-verified" : "btn-not-verified"
          }
        >
          {verificationItem.is_verified ? "Verified" : "Review"}
        </Button>
      </div>
    </div>
  );
};

export default CourseVerificationRequestItem;
