import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { Button, Container, Row } from "reactstrap";
import { Link } from "react-router-dom";
import { useAlert } from "react-alert";
import PublicPageNavbar from "./layout/PublicPageNavbar";
import CoursePageCategoryListItem from "./CoursePageCategoryListItem";
import ExploreCourseItem from "./ExploreCourseItem";

import "../custom-styles/publicpages/explorecoursespage.css";

const CoursesPage = () => {
  const [categoryListing, setCategoryListing] = useState([]);
  const [courses, setCourses] = useState([]);
  const [displayTutorCta, setDisplayTutorCta] = useState(true);
  const alert = useAlert();
  const [loadingCategoryListing, setLoadingCategoryListing] = useState(true);
  const [categoryListDropdown, setCategoryListDropdown] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [inputQuery, setInputQuery] = useState("");
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const observer = useRef();
  const lastBookElementRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((page) => {
            return page + 1;
          });
        }
      });
      if (node) observer.current.observe(node);
    },
    // eslint-disable-next-line
    [loading]
  );

  const getCategoryList = async (query = "") => {
    try {
      const res = await axios.get(
        `/api/v1/coursetype/coursetitle?data=${query}`
      );
      setCategoryListing(res.data);
      setLoadingCategoryListing(false);
    } catch (error) {
      setCategoryListing([]);
      setLoadingCategoryListing(false);
      alert.show(error, {
        type: "error",
      });
      console.log(error);
    }
  };

  const getExplorePageCourse = async (inputQuery, selectedCategory) => {
    try {
      const res = await axios.get(
        `/api/v1/course/courses/explore?page=${page}&size=10&titleQuery=${inputQuery.toLowerCase()}&categoryQuery=${selectedCategory.toLowerCase()}`
      );

      // setCourses(res.data);
      setCourses((prevCourses) => {
        return [...new Set([...prevCourses, ...res.data])];
      });
      setHasMore(res.data.length > 0);
      setLoading(false);
    } catch (error) {
      setCourses([]);
      setLoading(false);
      alert.show(error, {
        type: "error",
      });
      console.log(error);
    }
  };

  const handleUpdateInputQuery = (e) => {
    setInputQuery(e.target.value);
  };

  const toggleCategoryListDropdown = () =>
    setCategoryListDropdown(!categoryListDropdown);

  const categoryListItemClickHandler = (categoryTitle) => {
    if (categoryTitle.toLowerCase() === "all") {
      setSelectedCategory("");
    } else {
      setSelectedCategory(categoryTitle);
    }
    setCategoryListDropdown(false);
  };

  const closeTutorCtaContainer = () => setDisplayTutorCta(false);
  const uniquebyID = (array) => {
    return [...new Map(array.map((item) => [item["_id"], item])).values()];
  };
 

  const courseFilterSearch = (array, category, title) => {
    return array.filter((item) => {
      if (category && title) {
        return (
          item.category.toLowerCase() === category &&
          item.title.toLowerCase().includes(title.toLowerCase())
        );
      } else if (category) {
        return item.category.toLowerCase() === category.toLowerCase();
      } else if (title) {
        return item.title.toLowerCase().includes(title.toLowerCase());
      } else {
        return array;
      }
    });
  };
  // const arrayUniqueByKey = [...new Map(courses.filter(
  //   (item) =>
  //     item.category.toLowerCase() === selectedCategory.toLowerCase()
  // ).map(item =>
  //   [item["_id"], item])).values()];
  useEffect(() => {
    getCategoryList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    getExplorePageCourse(inputQuery, selectedCategory);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputQuery, selectedCategory, page]);

  return (
    <>
      <div className="explore-page-wrapper">
        {displayTutorCta && (
          <div className="explore-page-tutor-cta__container">
            <Container fluid className="explore-cta-container">
              <div className="explore-page-cta__content">
                <p className="mr-4">Do you have knowledge to share?</p>
                <Button
                  tag={Link}
                  to="/signup"
                  className="explore-page-btn ml-2"
                >
                  Become a Tutor
                </Button>
              </div>
              <div
                onClick={closeTutorCtaContainer}
                className="explore-page-close__cta"
              >
                <i className="fas fa-times"></i>
              </div>
            </Container>
          </div>
        )}
        <PublicPageNavbar />
        <Container fluid className="explore-course-page__container">
          <div className="course-filter-controls__container">
            <div
              onClick={toggleCategoryListDropdown}
              className="category-listing-dropdown__container mr-2"
            >
              <i className="fas fa-filter"></i>
            </div>
            <div className="title-input-search__container">
              <div className="input-icon__container">
                <input
                  type="text"
                  value={inputQuery}
                  onChange={(e) => handleUpdateInputQuery(e)}
                  placeholder="search courses"
                />
                <div className="search-icon__container">
                  <i className="fas fa-search"></i>
                </div>
              </div>
            </div>
          </div>
          <div className="category-picker-display__container">
            {categoryListDropdown && (
              <>
                <div className="category-list__container">
                  {loadingCategoryListing ? (
                    <div
                      style={{
                        width: "60%",
                        margin: "20px auto",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <i
                        style={{ fontSize: "22px" }}
                        className="fas fa-circle-notch fa-spin"
                      ></i>
                    </div>
                  ) : (
                    <>
                      {categoryListing.length === 0 ? (
                        <p className="text-center">
                          Category listing cannot be displayed at this time.
                        </p>
                      ) : (
                        <>
                          {[
                            {
                              _id: "67348743878jffjfjkf",
                              title: "all",
                              __v: 0,
                            },
                          ]
                            .concat(categoryListing)
                            .map((category) => (
                              <CoursePageCategoryListItem
                                key={category._id}
                                category={category}
                                categoryListItemClickHandler={
                                  categoryListItemClickHandler
                                }
                              />
                            ))}
                        </>
                      )}
                    </>
                  )}
                </div>
              </>
            )}
          </div>
          <div
            style={{
              marginBottom: displayTutorCta === true && "7.5rem",
            }}
            className="explore-courses-display__container"
          >
            {/* {selectedCategory} */}
            <Container fluid className="explore-course-display-item__container">
              {loading === true ? (
                <div
                  style={{
                    width: "60%",
                    margin: "20px auto",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <i
                    style={{ fontSize: "22px" }}
                    className="fas fa-circle-notch fa-spin"
                  ></i>
                </div>
              ) : (
                <>
                  {courses.length === 0 ? (
                    <p className="text-center">courses not found!</p>
                  ) : (
                    <>
                      <Row>
                        {uniquebyID(
                          courseFilterSearch(
                            courses,
                            selectedCategory,
                            inputQuery
                          )
                        ).map((course, index) => {
                          console.log(course)
                          if (courses.length === index + 1) {
                            return (
                              <ExploreCourseItem
                                refVariable={lastBookElementRef}
                                key={course._id}
                                course={course}
                              />
                            );
                          } else {
                            return (
                              <ExploreCourseItem
                                key={course._id}
                                course={course}
                              />
                            );
                          }
                        })}
                      </Row>
                    </>
                  )}
                </>
              )}
            </Container>
          </div>
        </Container>
      </div>
    </>
  );
};

export default CoursesPage;
