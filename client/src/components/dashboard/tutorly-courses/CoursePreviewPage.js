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
import ModuleItem from "../../school/ModuleItem";
import CourseItemDisplayMoreInfo from "../../school/CourseItemDisplayMoreInfo";
import { addToCart } from "../../../actions/cart";
import CurrencyFormat from "react-currency-format";
import SecondaryPagesNavbar from "./SecondaryPagesNavbar";
import CoursesPreviewModal from "./CoursesPreviewModal";
import { useAlert } from "react-alert";

import "../../../custom-styles/dashboard/tuturly-courses/TuturlyCoursePreviewPage.css";

function CoursePreviewPage({ match, cart, schoolname, displayPreviewModal }) {
  const tuturlyTheme = {
    themestyles: {
      coursecardbackgroundcolor: "rgb(70,110,250)",
      coursecardtextcolor: "#fff",
      buttonalttextcolor: "#fff",
      buttonaltbackgroundcolor: "rgb(70,110,250)",
      buttonbackgroundcolor: "rgb(70,110,250)",
    },
  };
  const [course, setCourse] = useState(null);
  const [courseDuration, setCourseDuration] = useState(null);
  const [episodes, setEpisodes] = useState(null);
  const [tabs, setTabs] = useState(1);
  const [pageLoading, setPageLoading] = useState(true);
  const alert = useAlert();
  const [courseModulesLoading, setCourseModulesLoading] = useState(false);

  const [modules, setModules] = useState([]);
  const history = useHistory();
  const dispatch = useDispatch();
  //
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

  const toggleNavs = (e, index) => {
    e.preventDefault();
    setTabs(index);
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

  const getCourseDetails = async (courseId) => {
    try {
      const res = await axios.get(`/api/v1/tutor/course/${courseId}`);

      console.log(res);
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
      setCourseModulesLoading(true);
      const res = await axios.get(`/api/v1/school/course/module/${courseId}`);
      setModules(res.data);
      setCourseModulesLoading(false);
    } catch (error) {
      setCourseModulesLoading(false);
      console.log(error);
    }
  };

  const getCoursePageContents = async () => {
    await getCourseDetails(match.params.courseId);
    await getCourseModules(match.params.courseId);
    setPageLoading(false);
  };

  useEffect(() => {
    getCoursePageContents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [match.params.courseId]);

  return pageLoading && course === null ? (
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
      <div style={{ background: "#FAFAFA" }} className="course-item-basic-info">
        <Container
          fluid
          style={{
            width: "95%",
          }}
        >
          <Row>
            <Col xs="12" sm="12" md="12" lg="8">
              <div style={{}} className="courses-course-item-details mt-4">
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
                      <div className="course-item-summary">
                        <div className="published-year">
                          {new Date(course?.createdAt).getFullYear()}
                        </div>
                        <div className="number-of-episodes">
                          {episodes} {/* {course?.coursechapters.length}  */}
                          Episodes
                        </div>
                        <div className="course-total-time">
                          {secondsToTime(courseDuration)}
                        </div>
                      </div>
                      <p style={{}} className="course-item-details-text">
                        {course?.description}.
                      </p>
                    </div>
                  </Col>
                </Row>
              </div>
            </Col>
            <Col xs="12" sm="12" md="12" lg="4">
              <div className="courses-course-item-cart-info mt-4">
                <h3>Shopping Cart</h3>
                <div className="cart-info-cart-item__container mt-3">
                  {cart.length === 0 ? (
                    <p className="text-center mt-3">No Items in Cart.</p>
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
                          <p>{cartItem.itemName}</p>
                        </div>
                      ))}
                    </>
                  )}
                </div>
                <div className="cart-info-actions mt-4 mb-1">
                  <Button
                    style={{
                      border: "1px solid #fff",
                      background: "transparent",
                      color: "#fff",
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
        style={{ background: "#FAFAFA" }}
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
                  borderBottom: `1px solid #fff`,
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
                      className={`"mb-sm-3 mb-md-0 courses-select" ${
                        tabs === 1 && "active"
                      }`}
                      onClick={(e) => toggleNavs(e, 1)}
                      href="#pablo"
                      role="tab"
                      style={{
                        background: "rgb(250, 250, 250)",
                        color: "#000",
                        borderBottom: tabs === 1 && "5px solid #000",
                      }}
                    >
                      Lectures
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      aria-selected={tabs === 2}
                      className={`"mb-sm-3 mb-md-0 courses-select" ${
                        tabs === 2 && "active"
                      }`}
                      onClick={(e) => toggleNavs(e, 2)}
                      href="#pablo"
                      role="tab"
                      style={{
                        background: "rgb(250, 250, 250)",
                        color: "#000",
                        borderBottom: tabs === 2 && "5px solid #000",
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
              <Card className="mt-2 tuturly-courses-module-wrapper">
                <CardBody>
                  <TabContent activeTab={"tabs" + tabs}>
                    <TabPane tabId="tabs1">
                      {courseModulesLoading === true ? (
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
                          {modules.length === 0 ? (
                            <p style={{ color: "#fff" }}>
                              No Course Modules Found
                            </p>
                          ) : (
                            <>
                              {modules.map((module) => (
                                <ModuleItem
                                  key={module._id}
                                  module={module}
                                  theme={{
                                    themestyles: {
                                      primarytextcolor: "#000",
                                      coursecardtextcolor: "#fff",
                                      coursecardbackgroundcolor:
                                        "rgb(71,110,250)",
                                    },
                                  }}
                                />
                              ))}
                            </>
                          )}
                        </>
                      )}
                    </TabPane>
                    <TabPane tabId="tabs2">
                      <CourseItemDisplayMoreInfo
                        course={course}
                        theme={{ themestyles: { primarytextcolor: "#000" } }}
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
      <div className="add-to-cart-cta">
        <Container
          fluid
          style={{
            width: "90%",
          }}
        >
          <Row>
            <Col className="mb-3" md="4" sm="4" xs="12">
              <div className="course-name-and-price">
                <p
                  title={course?.title}
                  className="course-name"
                  style={{ color: "#000" }}
                >
                  {course?.title}
                </p>
                <div className="course-price-and-rating">
                  <p className="course-price" style={{ color: "#000" }}>
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
                      color: "#000",
                      backgroundColor: "transparent",
                      border: `1px solid #000`,
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
                      // color: theme?.themestyles.buttonalttextcolor,
                      backgroundColor: "transparent",
                      //   theme?.themestyles.buttonaltbackgroundcolor,
                      border: "1px solid #000",
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
                    color: "#fff",
                    backgroundColor: "rgb(70,110,250)",
                    // border: "none",
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
      {displayPreviewModal === true && (
        <CoursesPreviewModal theme={tuturlyTheme} />
      )}
    </>
  );
}

const mapStateToProps = (state) => ({
  cart: state.cart,
  schoolname: state.subdomain,
  displayPreviewModal: state.preview.displayPlayer,
});

export default connect(mapStateToProps)(CoursePreviewPage);
