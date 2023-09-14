import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAlert } from "react-alert";
import { useDispatch, useStore } from "react-redux";
import { Link } from "react-router-dom";
import setAuthToken from "../../utilities/setAuthToken";
import { Container, Row } from "reactstrap";
import { studentAuth } from "../../actions/student";
import PageNavbar from "./PageNavbar";
import CourseItemInStudentDashboard from "./CourseItemInStudentDashboard";
import ProductItemInStudentDashboard from "./ProductItemInStudentDashboard";
import setDocumentTitle from "../../utilities/setDocumentTitle";

import "../../custom-styles/pages/studentvideopage.css";
import WebinarItemInStudentDashboard from "./WebinarItemInStudentDashboard";

const StudentVideosPage = ({ match }) => {
  const [school, setSchool] = useState(null);
  const [theme, setTheme] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const dispatch = useDispatch();

  const [purchasedCourses, setPurchasedCourses] = useState([]);
  const [purchasedProducts, setPurchasedProducts] = useState([]);
  const [purchasedWebinar, setPurchasedWebinar] = useState([]);

  const [savedCourses, setSavedCourses] = useState([]);
  const [purchasedCoursesLoading, setPurchasedCoursesLoading] = useState(true);
  const [purchasedWebinarLoading, setPurchasedWebinarLoading] = useState(true);

  const [purchasedProductLoading, setPuchasedProductLoading] = useState(true);
  const [savedCoursesLoading, setSavedCoursesLoading] = useState(true);
  const alert = useAlert();

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
  const getPurchasedWebinars = async () => {
    try {
      if (localStorage.getItem("studentToken")) {
        setAuthToken(localStorage.getItem("studentToken"));
      }
      const res = await axios.get(`/api/v1/studentwebinar/${schoolname}`);
      setPurchasedWebinar(res.data);
      setPurchasedWebinarLoading(false);
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

  const getSchoolBySchoolName = async (schoolname) => {
    try {
      const res = await axios.get(`/api/v1/school/${schoolname}`);
      setSchool(res.data);
      return res.data;
    } catch (error) {
      if (error.response.status === 404) {
        setSchool(null);
        setPageLoading(false);
      }
      console.log(error.response.data.errors[0].msg);
      return null;
    }
  };
  console.log(purchasedWebinar)

  const getSchoolThemeBySchoolId = async (schoolId) => {
    try {
      const res = await axios.get(`/api/v1/theme/${schoolId}`);
      setTheme(res.data);
    } catch (error) {
      if (error.response.status === 404) {
        setTheme(null);
        setPageLoading(false);
      }
      console.log(error.response.data.errors[0].msg);
      return null;
    }
  };

  const getSchoolLandingPageContents = async (schoolName) => {
    setPageLoading(true);
    const school = await getSchoolBySchoolName(schoolName);
    if (school) {
      await getSchoolThemeBySchoolId(school._id);
      await getPurchasedCourses();
      await getPurchasedProducts();
      await getSavedCourses();
      await getPurchasedWebinars()
    }
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
    if (school) {
      setDocumentTitle(school);
    }
  }, [school]);

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
          {!pageLoading && school === null && theme === null ? (
            <p className="text-center lead">School Not Found</p>
          ) : (
            <>
              <PageNavbar theme={theme} pageName={schoolname} />
              <div
                style={{
                  backgroundColor:
                    theme.themestyles.secondarypagebackgroundcolor,
                }}
                className="studentdashboard-page-contents"
              >
                <br />
                <br />
                <Container fluid>
                  {/* <Row>
                    <Col xs="12" sm="12" md="10" lg="10"> */}
                  <div className="paid-courses-section">
                    <Container
                      fluid
                      style={{
                        width: "85%",
                      }}
                    >
                      <h2
                        style={{
                          color: theme.themestyles.primarytextcolor,
                        }}
                        className="section-title"
                      >
                        My Paid Course
                      </h2>
                      <Row className="p-4">
                        {purchasedCoursesLoading === true ? (
                          <div
                            style={{
                              width: "50%",
                              margin: "20px auto",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: theme.themestyles.primarytextcolor,
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
                                  color: theme.themestyles.primarytextcolor,
                                  width: "100%",
                                }}
                                className="text-center"
                              >
                                No purchased course yet!. Click{" "}
                                <Link to={`/`}>Here</Link> to purchase course
                              </p>
                            ) : (
                              <>
                                {purchasedCourses.map((courseItem) => (
                                  <CourseItemInStudentDashboard
                                    schoolname={schoolname}
                                    key={courseItem._id}
                                    course={courseItem.coursebought}
                                    idToLinkTo={courseItem._id}
                                    theme={theme}
                                  />
                                ))}
                              </>
                            )}
                          </>
                        )}
                      </Row>
                    </Container>
                  </div>
                  <div className="purchased-courses__section">
                    <Container
                      fluid
                      style={{
                        width: "85%",
                      }}
                    >
                      <h2
                        style={{
                          color: theme.themestyles.primarytextcolor,
                        }}
                        className="section-title"
                      >
                        My Purchased Products
                      </h2>
                      <Row className="p-4">
                        {purchasedProductLoading === true ? (
                          <div
                            style={{
                              width: "50%",
                              margin: "20px auto",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: theme.themestyles.primarytextcolor,
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
                                  color: theme.themestyles.primarytextcolor,
                                  width: "100%",
                                }}
                                className="text-center"
                              >
                                No purchased Product yet!.
                              </p>
                            ) : (
                              <>
                                {purchasedProducts.map((productItem) => (
                                  <ProductItemInStudentDashboard
                                    key={productItem._id}
                                    product={productItem.productBought}
                                    theme={theme}
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

                  <div className="paid-courses-section">
                    <Container
                      fluid
                      style={{
                        width: "85%",
                      }}
                    >
                      <h2
                        style={{
                          color: theme.themestyles.primarytextcolor,
                        }}
                        className="section-title"
                      >
                        My Paid Webinar
                      </h2>
                      <Row className="p-4">
                        {purchasedWebinarLoading === true ? (
                          <div
                            style={{
                              width: "50%",
                              margin: "20px auto",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: theme.themestyles.primarytextcolor,
                            }}
                          >
                            <i
                              style={{ fontSize: "22px" }}
                              className="fas fa-circle-notch fa-spin"
                            ></i>
                          </div>
                        ) : (
                          <>
                            {purchasedWebinar.length === 0 ? (
                              <p
                                style={{
                                  color: theme.themestyles.primarytextcolor,
                                  width: "100%",
                                }}
                                className="text-center"
                              >
                                No purchased course yet!. Click{" "}
                                <Link to={`/`}>Here</Link> to purchase course
                              </p>
                            ) : (
                              <>
                                {purchasedWebinar.map((webinarItem) => (
                                  <WebinarItemInStudentDashboard
                                    schoolname={schoolname}
                                    key={webinarItem._id}
                                    course={webinarItem.webinarBought}
                                    idToLinkTo={webinarItem.webinarBought.streamKey}
                                    theme={theme}
                                  />
                         
                                ))}
                              </>
                            )}
                          </>
                        )}
                      </Row>
                    </Container>
                  </div>
                  <div className="saved-courses-section">
                    <Container
                      fluid
                      style={{
                        width: "85%",
                      }}
                    >
                      <h2
                        style={{
                          color: theme.themestyles.primarytextcolor,
                        }}
                        className="section-title"
                      >
                        Saved
                      </h2>
                      <Row className="p-4">
                        {savedCoursesLoading === true ? (
                          <div
                            style={{
                              width: "50%",
                              margin: "20px auto",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: theme.themestyles.primarytextcolor,
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
                                  color: theme.themestyles.primarytextcolor,
                                  width: "100%",
                                }}
                                className="text-center"
                              >
                                No saved course yet!
                              </p>
                            ) : (
                              <>
                                {savedCourses.map((courseItem) => (
                                  <CourseItemInStudentDashboard
                                    theme={theme}
                                    key={courseItem._id}
                                    course={courseItem.course}
                                  />
                                ))}
                              </>
                            )}
                          </>
                        )}
                      </Row>
                    </Container>
                  </div>
                  {/* </Col>
                  </Row> */}
                </Container>
              </div>
              <div
                style={{
                  backgroundColor: theme.themestyles.footerbackgroundcolor,
                  color: theme.themestyles.footertextcolor,
                  borderTop: `0.000000234px solid ${theme.themestyles.footertextcolor}`,
                  fontSize: "14px",
                }}
                className="studentdashboard-page-footer"
              >
                Copyright {new Date().getFullYear()} - {schoolname}
              </div>
            </>
          )}
        </>
      )}
    </>
  );
};

export default StudentVideosPage;
