import React, { useState, useEffect } from "react";
import axios from "axios";
import { useDispatch, useStore } from "react-redux";
import { Link } from "react-router-dom";
import { useAlert } from "react-alert";
import { Container, Row } from "reactstrap";
import setDocumentTitle from "../../../../utilities/setDocumentTitle";
import { studentAuth } from "../../../../actions/student";
import setAuthToken from "../../../../utilities/setAuthToken";
import SecondaryPagesNavbar from "../SecondaryPagesNavbar";
import CourseItem from "./CourseItem";
import ProductItem from "./ProductItem";

import "../../../../custom-styles/dashboard/tuturly-courses/dashboard-page.css";

const DashboardPage = () => {
  const [purchasedCourses, setPurchasedCourses] = useState([]);
  const [purchasedProducts, setPurchasedProducts] = useState([]);
  const [savedCourses, setSavedCourses] = useState([]);
  const [purchasedCoursesLoading, setPurchasedCoursesLoading] = useState(true);
  const [purchasedProductLoading, setPuchasedProductLoading] = useState(true);
  const [savedCoursesLoading, setSavedCoursesLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(false);
  const alert = useAlert();
  const dispatch = useDispatch();

  const store = useStore();
  const state = store.getState();
  const schoolname = state.subdomain;

  const getPurchasedCourses = async () => {
    try {
      if (localStorage.getItem("studentToken")) {
        setAuthToken(localStorage.getItem("studentToken"));
      }
      const res = await axios.get(`/api/v1/studentcourse/${schoolname}`);
      setPurchasedCourses(res.data);
      setPurchasedCoursesLoading(false);
    } catch (error) {
      // eslint-disable-next-line
      if (error.response.status == "400") {
        const errors = error.response.data.errors;
        errors.forEach((err) => {
          alert.show(err.msg, {
            type: "error",
          });
        });
      }
    }
  };

  const getPurchasedProducts = async () => {
    try {
      if (localStorage.getItem("studentToken")) {
        setAuthToken(localStorage.getItem("studentToken"));
      }
      const res = await axios.get(`/api/v1/studentproduct/${schoolname}`);
      setPurchasedProducts(res.data);
      setPuchasedProductLoading(false);
    } catch (error) {
      // eslint-disable-next-line
      if (error.response.status == "400") {
        const errors = error.response.data.errors;
        errors.forEach((err) => {
          alert.show(err.msg, {
            type: "error",
          });
        });
      }
    }
  };

  const getSavedCourses = async () => {
    try {
      if (localStorage.getItem("studentToken")) {
        setAuthToken(localStorage.getItem("studentToken"));
      }
      const res = await axios.get(`/api/v1/savedcourse/${schoolname}`);
      setSavedCourses(res.data);
      setSavedCoursesLoading(false);
    } catch (error) {
      // eslint-disable-next-line
      if (error.response.status == "400") {
        const errors = error.response.data.errors;
        errors.forEach((err) => {
          alert.show(err.msg, {
            type: "error",
          });
        });
      }
    }
  };

  const getSchoolLandingPageContents = async (schoolName) => {
    setPageLoading(true);
    await getPurchasedCourses();
    await getPurchasedProducts();
    await getSavedCourses();
    setPageLoading(false);
  };

  useEffect(() => {
    if (schoolname.length > 0) {
      getSchoolLandingPageContents(schoolname);
      dispatch(studentAuth());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schoolname]);

  useEffect(() => {
    const data = {
      name: schoolname,
    };
    setDocumentTitle(data);
  }, [schoolname]);

  return (
    <>
      {pageLoading === true ? (
        <div
          style={{
            width: "50%",
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
          <SecondaryPagesNavbar />
          <div className="tutor-student-dashboard-page__contents">
            <br />
            <br />
            <Container fluid>
              <div className="tutor-paid-courses-section">
                <Container
                  fluid
                  style={{
                    width: "85%",
                  }}
                >
                  <h2 className="tutor-section-title">My Paid Course</h2>
                  <Row className="p-4">
                    {purchasedCoursesLoading === true ? (
                      <div
                        style={{
                          width: "50%",
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
                        {purchasedCourses.length === 0 ? (
                          <p
                            style={{
                              width: "100%",
                            }}
                            className="text-center"
                          >
                            No purchased course yet!. Click{" "}
                            <Link to={`/`}>Here</Link> to purchase course
                          </p>
                        ) : (
                          <>
                            {purchasedCourses.map((course) => (
                              <CourseItem
                                key={course._id}
                                course={course.coursebought}
                                idToLinkTo={course._id}
                              />
                            ))}
                          </>
                        )}
                      </>
                    )}
                  </Row>
                </Container>
              </div>
              <div className="tutor-paid-products__section">
                <Container
                  fluid
                  style={{
                    width: "85%",
                  }}
                >
                  <h2 className="tutor-section-title">My Purchased Products</h2>
                </Container>
                <Container
                  fluid
                  style={{
                    width: "85%",
                  }}
                >
                  <Row className="p-4">
                    {purchasedProductLoading === true ? (
                      <div
                        style={{
                          width: "50%",
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
                        {purchasedProducts.length === 0 ? (
                          <p
                            style={{
                              width: "100%",
                            }}
                            className="text-center"
                          >
                            No purchased Product yet!.
                          </p>
                        ) : (
                          <>
                            {purchasedProducts.map((product) => (
                              <ProductItem
                                key={product._id}
                                product={product.productBought}
                                schoolname={schoolname}
                              />
                            ))}
                          </>
                        )}
                      </>
                    )}
                  </Row>
                </Container>
              </div>
              <div className="tutor-saved-courses__section">
                <Container
                  fluid
                  style={{
                    width: "85%",
                  }}
                >
                  <h2 className="tutor-section-title">Saved</h2>
                  <Row className="p-4">
                    {savedCoursesLoading === true ? (
                      <div
                        style={{
                          width: "50%",
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
                        {savedCourses.length === 0 ? (
                          <p
                            style={{
                              width: "100%",
                            }}
                            className="text-center"
                          >
                            No saved course yet!
                          </p>
                        ) : (
                          <>
                            {savedCourses.map((course) => (
                              <CourseItem
                                key={course._id}
                                course={course.course}
                              />
                            ))}
                          </>
                        )}
                      </>
                    )}
                  </Row>
                </Container>
              </div>
            </Container>
          </div>
        </>
      )}
    </>
  );
};

export default DashboardPage;
