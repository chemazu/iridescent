import React from "react";
import { Col } from "reactstrap";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import CurrencyFormat from "react-currency-format";

const WebinarItemInStudentDashboard = ({
  course,
  schoolname,
  idToLinkTo,
  theme,
  currency,
}) => {
  return (
    <>
      <Col xs="12" sm="6" md="6" xl="3">
        <div className="course-item-student-dashboard">
          <div className="course-item-student-dashboard-card-img">
            <Link to={`/livewebinar/watch/${idToLinkTo}`}>
              <img src={course.thumbnail} alt="..." />
            </Link>
          </div>
          <div
            style={{
              backgroundColor: theme?.themestyles?.coursecardbackgroundcolor,
            }}
            className="course-item-student-dashboard-card-info"
          >
            <div title={course.title} className="course-item-title-container">
              <Link
                style={{
                  color: theme?.themestyles?.coursecardtextcolor,
                }}
                to={`/livewebinar/watch/${idToLinkTo}`}
              >
                {course.title}
              </Link>
            </div>

            <p
              style={{
                color: theme.themestyles.coursecardtextcolor,
              }}
              className="course-item-course-author-info"
            >
              {schoolname}
            </p>

            <p
              style={{
                border: `0.4px solid ${theme.themestyles.coursecardtextcolor}`,
                color: theme.themestyles.coursecardtextcolor,
              }}
              className="course-item-course-level-info"
            >
              {course.isRecurring ? "Recurring" : "One Time"}
            </p>

            <p
              style={{
                color: theme.themestyles.coursecardtextcolor,
              }}
              className="course-item-course-price"
            >
              <span
                dangerouslySetInnerHTML={{
                  __html: currency.htmlCurrencySymbol,
                }}
              ></span>
              {
                <CurrencyFormat
                  value={course.fee}
                  displayType="text"
                  thousandSeparator={true}
                  decimalScale={1}
                  fixedDecimalScale={true}
                />
              }
            </p>
          </div>
        </div>
      </Col>
    </>
  );
};

const mapStateToProps = (state) => ({
  currency: state.currency,
});
export default connect(mapStateToProps)(WebinarItemInStudentDashboard);
