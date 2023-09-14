import React, { useState, useEffect } from "react";
import { connect, useDispatch } from "react-redux";
import axios from "axios";
import { Link, useHistory } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  TabContent,
  TabPane,
  NavItem,
  NavLink,
  Nav,
  Card,
  CardBody,
  Button,
} from "reactstrap";
import { useAlert } from "react-alert";
import PageNavbar from "./PageNavbar";
import CurrencyFormat from "react-currency-format";
import ModuleItem from "./ModuleItem";
import CourseItemDisplayMoreInfo from "./CourseItemDisplayMoreInfo";
import CourseUnitVideoPreviewModal from "./CourseUnitVideoPreviewModal";
import setDocumentTitle from "../../utilities/setDocumentTitle";
import getUserIpAddress from "../../utilities/getUserIpAddress";
import { addToCart } from "../../actions/cart";

import "../../custom-styles/pages/courseitemdisplaypage.css";

export const CourseItemDisplayPage = ({
  match,
  cart,
  schoolname,
  displayPreviewModal,
}) => {
  const [school, setSchool] = useState(null);
  const [theme, setTheme] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);

  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  // const [ loading, setLoading ] = useState(true)

  const [courseDuration, setCourseDuration] = useState(null);
  const [episodes, setEpisodes] = useState(null);

  const alert = useAlert();
  const history = useHistory();
  const dispatch = useDispatch();

  const getCourseDetails = async (schoolName, courseId) => {
    try {
      const res = await axios.get(`/api/v1/school/${schoolName}/${courseId}`);
      setCourse(res.data.course);
      setCourseDuration(res.data.courseduration);
      setEpisodes(res.data.episodes);
      // setLoading(false)
    } catch (error) {
      if (error.response.status === 404) {
        setCourse(null);
        // setLoading(false)
      }
      // setLoading(false)
      console.log(error);
    }
  };

  const getCourseModules = async (courseId) => {
    try {
      const res = await axios.get(`/api/v1/school/course/module/${courseId}`);
      setModules(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const [tabs, setTabs] = useState(1);
  const toggleNavs = (e, index) => {
    e.preventDefault();
    setTabs(index);
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
    }
    setPageLoading(false);
  };

  const addCourseToCart = () => {
    const cartItemDetails = {
      duration: courseDuration,
      episodes: episodes,
    };
    const courseInfo = {
      ...cartItemDetails,
      ...course,
    };
    dispatch(addToCart(courseInfo));
  };

  const handleGetCourseClick = () => {
    if (cart.find((item) => item.itemId === course._id) !== undefined) {
      return alert.show("Course Already in Cart", {
        type: "error",
      });
    }
    addCourseToCart();
    history.push(`/cart`);
  };

  const recordSchoolLandingPageVisit = async (schoolname) => {
    try {
      const userIp = await getUserIpAddress();
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };
      const body = JSON.stringify({
        ipaddress: userIp,
        schoolname: schoolname,
      });
      await axios.post("/api/v1/pagevisit", body, config);
    } catch (error) {
      const errors = error?.response?.data?.errors;
      if (errors) {
        errors.forEach((error) => {
          alert.show(error.msg, {
            type: "error",
          });
        });
      }
    }
  };

  function secondsToTime(e) {
    var h = Math.floor(e / 3600)
        .toString()
        .padStart(2, "0"),
      m = Math.floor((e % 3600) / 60)
        .toString()
        .padStart(2, "0"),
      s = Math.floor(e % 60)
        .toString()
        .padStart(2, "0");

    return h + ":" + m + ":" + s;
  }

  useEffect(() => {
    getCourseDetails(schoolname, match.params.courseItemId);
  }, [schoolname, match.params.courseItemId]);

  useEffect(() => {
    if (course) {
      getCourseModules(course?._id);
    }
  }, [course]);

  useEffect(() => {
    if (schoolname?.length > 0) {
      getSchoolLandingPageContents(schoolname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schoolname]);

  useEffect(() => {
    if (school) {
      setDocumentTitle(school);
    }
  }, [school]);

  useEffect(() => {
    recordSchoolLandingPageVisit(schoolname);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          {!pageLoading &&
          school === null &&
          theme === null &&
          course === null ? (
            <p className="text-center lead">Course not found</p>
          ) : (
            <>
              <PageNavbar theme={theme} pageName={schoolname} />
              <div
                style={{
                  backgroundColor:
                    theme?.themestyles.secondarypagebackgroundcolor,
                }}
                className="course-item-basic-info"
              >
                <Container
                  fluid
                  style={{
                    width: "95%",
                  }}
                >
                  <Row>
                    <Col xs="12" sm="12" md="12" lg="8">
                      <div
                        style={{
                          backgroundColor:
                            theme?.themestyles.coursecardbackgroundcolor,
                        }}
                        className="course-item-details mt-4"
                      >
                        <Row>
                          <Col md="6" sm="6" xs="12">
                            <div className="course-item-details-img-contain">
                              <img
                                src={course?.thumbnail}
                                alt="course thumbnail previewer"
                              />
                            </div>
                          </Col>
                          <Col md="6" sm="6" xs="12">
                            <div className="course-item-about">
                              <h3
                                style={{
                                  color: theme?.themestyles.coursecardtextcolor,
                                }}
                              >
                                {course?.title}
                              </h3>
                              <div
                                style={{
                                  color: theme?.themestyles.coursecardtextcolor,
                                }}
                                className="course-item-summary"
                              >
                                <div className="published-year">
                                  {new Date(course?.createdAt).getFullYear()}
                                </div>
                                <div className="number-of-episodes">
                                  {episodes}{" "}
                                  {/* {course?.coursechapters.length}  */}
                                  Episodes
                                </div>
                                <div className="course-total-time">
                                  {secondsToTime(courseDuration)}
                                </div>
                              </div>
                              <p
                                style={{
                                  color: theme?.themestyles.coursecardtextcolor,
                                }}
                                className="course-item-details-text"
                              >
                                {course?.description}.
                              </p>
                            </div>
                          </Col>
                        </Row>
                      </div>
                    </Col>
                    <Col xs="12" sm="12" md="12" lg="4">
                      <div
                        style={{
                          backgroundColor:
                            theme?.themestyles.coursecardbackgroundcolor,
                        }}
                        className="course-item-cart-info mt-4"
                      >
                        <h3
                          style={{
                            color: theme?.themestyles.coursecardtextcolor,
                          }}
                        >
                          Shopping Cart
                        </h3>
                        <div className="cart-info-cart-item__container mt-3">
                          {cart.length === 0 ? (
                            <p
                              style={{
                                color: theme?.themestyles.coursecardtextcolor,
                              }}
                              className="text-center mt-3"
                            >
                              No Items in Cart.
                            </p>
                          ) : (
                            <>
                              {cart.map((cartItem) => (
                                <div
                                  className="cart-info-cart-item mb-2"
                                  key={cartItem.itemId}
                                >
                                  <div className="item-img__container">
                                    <img src={cartItem.itemImg} alt="..." />
                                  </div>
                                  <p
                                    style={{
                                      color:
                                        theme?.themestyles.coursecardtextcolor,
                                    }}
                                  >
                                    {cartItem.itemName}
                                  </p>
                                </div>
                              ))}
                            </>
                          )}
                        </div>
                        <div className="cart-info-actions mt-4 mb-1">
                          <Button
                            style={{
                              backgroundColor:
                                theme?.themestyles.buttonbackgroundcolor,
                              color: theme?.themestyles.buttontextcolor,
                              border: "none",
                            }}
                            tag={Link}
                            to={`/cart`}
                            block
                          >
                            Proceed To Checkout
                          </Button>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </Container>
              </div>
              <div
                style={{
                  backgroundColor:
                    theme?.themestyles.secondarypagebackgroundcolor,
                }}
                className="course-item-secondary-info"
              >
                <Container
                  fluid
                  style={{
                    width: "95%",
                  }}
                >
                  <Row>
                    <Col xs="12" sm="12" md="8" lg="8">
                      <div
                        style={{
                          borderBottom: `1px solid ${theme?.themestyles.primarytextcolor}`,
                        }}
                        className="tabs-container"
                      >
                        <Nav
                          className="flex-column flex-md-row"
                          id="tabs-icons-text"
                          pills
                          role="tablist"
                        >
                          <NavItem>
                            <NavLink
                              aria-selected={tabs === 1}
                              className={`"mb-sm-3 mb-md-0" ${
                                tabs === 1 && "active"
                              }`}
                              onClick={(e) => toggleNavs(e, 1)}
                              href="#pablo"
                              role="tab"
                              style={{
                                backgroundColor:
                                  theme?.themestyles
                                    .secondarypagebackgroundcolor,
                                color: theme?.themestyles.primarytextcolor,
                              }}
                            >
                              Lectures
                            </NavLink>
                          </NavItem>
                          <NavItem>
                            <NavLink
                              aria-selected={tabs === 2}
                              className={`"mb-sm-3 mb-md-0" ${
                                tabs === 2 && "active"
                              }`}
                              onClick={(e) => toggleNavs(e, 2)}
                              href="#pablo"
                              role="tab"
                              style={{
                                backgroundColor:
                                  theme?.themestyles
                                    .secondarypagebackgroundcolor,
                                color: theme?.themestyles.primarytextcolor,
                              }}
                            >
                              More
                            </NavLink>
                          </NavItem>
                        </Nav>
                      </div>
                    </Col>
                    <Col xs="12" sm="12" md="4" lg="4"></Col>
                  </Row>
                </Container>

                <Container
                  fluid
                  style={{
                    width: "95%",
                  }}
                >
                  <Row>
                    <Col xs="12" sm="12" md="8" lg="8">
                      <Card
                        style={{
                          backgroundColor:
                            theme?.themestyles.secondarypagebackgroundcolor,
                        }}
                        className="mt-2"
                      >
                        <CardBody>
                          <TabContent activeTab={"tabs" + tabs}>
                            <TabPane tabId="tabs1">
                              {modules.length === 0 ? (
                                <p
                                  style={{
                                    color: theme?.themestyles.primarytextcolor,
                                  }}
                                >
                                  No Course Modules Found
                                </p>
                              ) : (
                                <>
                                  {modules.map((module) => (
                                    <ModuleItem
                                      key={module._id}
                                      module={module}
                                      theme={theme}
                                    />
                                  ))}
                                </>
                              )}
                            </TabPane>
                            <TabPane tabId="tabs2">
                              <CourseItemDisplayMoreInfo
                                course={course}
                                theme={theme}
                              />
                            </TabPane>
                          </TabContent>
                        </CardBody>
                      </Card>
                    </Col>
                    <Col xs="12" sm="12" md="4" lg="4"></Col>
                  </Row>
                </Container>
              </div>

              <div
                style={{
                  backgroundColor: theme?.themestyles.buttonaltbackgroundcolor,
                  color: theme?.themestyles.buttonalttextcolor,
                }}
                className="add-to-cart-cta"
              >
                <Container
                  fluid
                  style={{
                    width: "90%",
                  }}
                >
                  <Row>
                    <Col className="mb-3" md="4" sm="4" xs="12">
                      <div className="course-name-and-price">
                        <p title={course?.title} className="course-name">
                          {course?.title}
                        </p>
                        <div className="course-price-and-rating">
                          <p className="course-price">
                            &#8358;
                            {
                              <CurrencyFormat
                                value={course?.price}
                                displayType="text"
                                thousandSeparator={true}
                                decimalScale={2}
                                fixedDecimalScale={true}
                              />
                            }
                          </p>
                        </div>
                      </div>
                    </Col>
                    <Col className="mb-3" md="4" sm="4" xs="12">
                      <div className="action-container">
                        {cart.find((item) => item.itemId === course?._id) !==
                        undefined ? (
                          <Button
                            style={{
                              color: theme?.themestyles.buttonalttextcolor,
                              backgroundColor:
                                theme?.themestyles.buttonaltbackgroundcolor,
                              border: `1px solid ${theme?.themestyles.buttonalttextcolor}`,
                            }}
                            tag={Link}
                            to={`/cart`}
                            className="action-btn add-to-cart-btn"
                          >
                            Go To Cart
                          </Button>
                        ) : (
                          <Button
                            style={{
                              color: theme?.themestyles.buttonalttextcolor,
                              backgroundColor:
                                theme?.themestyles.buttonaltbackgroundcolor,
                              border: `1px solid ${theme?.themestyles.buttonalttextcolor}`,
                            }}
                            onClick={addCourseToCart}
                            className="action-btn add-to-cart-btn"
                          >
                            Add to cart
                          </Button>
                        )}
                      </div>
                    </Col>
                    <Col className="mb-3" md="4" sm="4" xs="12">
                      <div className="action-container">
                        <Button
                          style={{
                            color: theme?.themestyles.buttontextcolor,
                            backgroundColor:
                              theme?.themestyles.buttonbackgroundcolor,
                            border: "none",
                          }}
                          onClick={handleGetCourseClick}
                          className="action-btn get-course-btn"
                        >
                          Get Course
                        </Button>
                      </div>
                    </Col>
                  </Row>
                </Container>
              </div>
              <div
                style={{
                  backgroundColor: theme?.themestyles.footerbackgroundcolor,
                  color: theme?.themestyles.footertextcolor,
                }}
                className="footer"
              >
                <p className="text-center copy mt-6 pt-5">
                  Copyright {new Date().getFullYear()} {schoolname}
                </p>
              </div>
              {displayPreviewModal === true && (
                <CourseUnitVideoPreviewModal theme={theme} />
              )}
            </>
          )}
        </>
      )}
    </>
  );
};

const mapStateToProps = (state) => ({
  cart: state.cart,
  schoolname: state.subdomain,
  displayPreviewModal: state.preview.displayPlayer,
});

export default connect(mapStateToProps)(CourseItemDisplayPage);
