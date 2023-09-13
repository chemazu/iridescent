import React, { useRef } from "react";
import { Link } from "react-router-dom";

import "../ThemePreviewSectionStyles/courselistsection.css";

const CourseListSection = ({
  themeData,
  coursesLoading,
  schoolCourses,
  previewId,
  sectionDetails,
}) => {
  const scroll = (scrollOffset) => {
    courseListContainerRef.current.scrollLeft += scrollOffset;
  };

  const courseListContainerRef = useRef();
  return (
    <>
      <section
        style={{
          backgroundColor:
            sectionDetails.usesecondarycolorscheme === true
              ? themeData.themedefaultstyles.secondarybackgroundcolor
              : themeData.themedefaultstyles.primarybackgroundcolor,
        }}
        className="school-course-list"
      >
        <div className="courselist-container">
          <div className="header-controller__and__controls">
            <h3
              className="header"
              style={{
                color:
                  sectionDetails.usesecondarycolorscheme === true
                    ? themeData.themedefaultstyles.secondarytextcolor
                    : themeData.themedefaultstyles.primarytextcolor,
                fontFamily: themeData.themedefaultstyles.fontfamily,
              }}
            >
              Tuturly Course List
            </h3>
            <div className="controls">
              <div
                onClick={() => scroll(-30)}
                style={{
                  color:
                    sectionDetails.usesecondarycolorscheme === true
                      ? themeData.themedefaultstyles.secondarytextcolor
                      : themeData.themedefaultstyles.primarytextcolor,
                }}
                className="left-arrow-control"
              >
                <i className="fas fa-arrow-left"></i>
              </div>
              <div
                onClick={() => scroll(30)}
                style={{
                  color:
                    sectionDetails.usesecondarycolorscheme === true
                      ? themeData.themedefaultstyles.secondarytextcolor
                      : themeData.themedefaultstyles.primarytextcolor,
                }}
                className="right-arrow-control"
              >
                <i className="fas fa-arrow-right"></i>
              </div>
            </div>
          </div>
          <div
            ref={courseListContainerRef}
            className="course-item-container pl-3"
          >
            {coursesLoading ? (
              <>
                <div
                  style={{
                    width: "50%",
                    margin: "20px auto",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#ffffff",
                  }}
                >
                  <i
                    style={{ fontSize: "22px" }}
                    className="fas fa-circle-notch fa-spin"
                  ></i>
                </div>
              </>
            ) : (
              <>
                {schoolCourses.length === 0 ? (
                  <p
                    style={{
                      textAlign: "center",
                      color:
                        sectionDetails.usesecondarycolorscheme === true
                          ? themeData.themedefaultstyles.secondarytextcolor
                          : themeData.themedefaultstyles.primarytextcolor,
                      width: "100%",
                    }}
                    className="text-center mb-2 mt-2"
                  >
                    School Courses Not Found!
                  </p>
                ) : (
                  <>
                    {schoolCourses.map((courseItem) => {
                      return (
                        <div
                          className="course__item mb-3"
                          key={courseItem._id}
                          style={{
                            boxShadow:
                              themeData.themedefaultstyles
                                .coursecardhasShadow === true
                                ? "0px 7px 29px 0px rgba(100, 100, 111, 0.2)"
                                : "none",
                          }}
                        >
                          <div className="item-img-container">
                            <Link
                              to={`/dashboard/customize/theme/preview/${previewId}`}
                            >
                              <img
                                src={courseItem.thumbnail}
                                alt="thumbnail img"
                              />
                            </Link>
                          </div>
                          <div
                            style={{
                              backgroundColor:
                                themeData.themedefaultstyles
                                  .coursecardbackgroundcolor,
                            }}
                            className="course-item__details-container"
                          >
                            <Link
                              to={`/dashboard/customize/theme/preview/${previewId}`}
                            >
                              <div
                                style={{
                                  color:
                                    themeData.themedefaultstyles
                                      .coursecardtextcolor,
                                  fontFamily:
                                    themeData.themedefaultstyles.fontfamily,
                                }}
                                title={courseItem.title}
                                className="course-item-name"
                              >
                                {courseItem.title}
                              </div>
                            </Link>
                            <div
                              style={{
                                color:
                                  themeData.themedefaultstyles
                                    .coursecardtextcolor,
                                fontFamily:
                                  themeData.themedefaultstyles.fontfamily,
                              }}
                              className="course-item-author-name"
                            >
                              {`${courseItem.author.firstname} ${courseItem.author.lastname}`}
                            </div>
                            <div
                              style={{
                                color:
                                  themeData.themedefaultstyles
                                    .coursecardtextcolor,
                                fontFamily:
                                  themeData.themedefaultstyles.fontfamily,
                                borderColor:
                                  themeData.themedefaultstyles
                                    .coursecardtextcolor,
                              }}
                              className="course-item-level mt-1"
                            >
                              {courseItem.level}
                            </div>
                            <div
                              style={{
                                color:
                                  themeData.themedefaultstyles
                                    .coursecardtextcolor,
                                fontFamily:
                                  themeData.themedefaultstyles.fontfamily,
                              }}
                              className="course-item-price"
                            >
                              &#8358;{courseItem.price}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default CourseListSection;
