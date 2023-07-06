import React, { useState, useEffect } from "react";
import { connect, useDispatch } from "react-redux";
import axios from "axios";
import { Link, useHistory } from "react-router-dom";
import { Container, Row, Col, Button } from "reactstrap";
import { useAlert } from "react-alert";
import PageNavbar from ".././PageNavbar";
import CurrencyFormat from "react-currency-format";
import setDocumentTitle from "../../../utilities/setDocumentTitle";
import getUserIpAddress from "../../../utilities/getUserIpAddress";
import { addToCart } from "../../../actions/cart";
import liveWebImg from "../../../images/live-web-image.jpg";

import "../../../custom-styles/pages/productitemdisplaypage.css";

const LiveWebinarPreview = ({ schoolname, match, cart }) => {
  const dispatch = useDispatch();
  const alert = useAlert();
  const history = useHistory();
  const [school, setSchool] = useState(null);
  const [theme, setTheme] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);

  const [liveWebinar, setLiveWebinar] = useState(null);
  const getLiveDetails = async (schoolName, liveItemId) => {
    try {
      const res = await axios.get(
        `/api/v1/livewebinar/streamdetails/${liveItemId}`
      );

      setLiveWebinar({ ...res.data, price: res.data.fee, type: "webinar" });
    } catch (error) {
      if (error.response.status === 404) {
        setLiveWebinar(null);
      }
      console.log(error);
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
      setDocumentTitle(school);
      await getSchoolThemeBySchoolId(school._id);
    }
    setPageLoading(false);
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

  const addProductToCart = () => {
    dispatch(addToCart(liveWebinar));
  };

  const handleGetProductClick = () => {
    if (cart.find((item) => item.itemId === liveWebinar._id) !== undefined) {
      return alert.show("Webinar Already in Cart", {
        type: "error",
      });
    }
    addProductToCart();
    history.push(`/cart`);
  };

  const dateOptions = {
    day: "numeric",
    month: "long",
    year: "numeric",
  };
  const timeOptions = {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
    timeZone: "Africa/Lagos",
  };
  useEffect(() => {
    getLiveDetails(schoolname, match.params.liveItemId);
  }, [schoolname, match.params.liveItemId]);

  useEffect(() => {
    if (schoolname?.length > 0) {
      getSchoolLandingPageContents(schoolname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schoolname]);

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
          liveWebinar === null ? (
            <p className="text-center lead">Webinar not found</p>
          ) : (
            <>
              <PageNavbar theme={theme} pageName={schoolname} />
              <div
                style={{
                  backgroundColor:
                    theme?.themestyles.secondarypagebackgroundcolor,
                }}
                className="product-item-basic-info"
              >
                <Container
                  fluid
                  style={{
                    width: "95%",
                  }}
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
                          className="product-item-details mt-4"
                        >
                          <Row>
                            <Col md="6" sm="6" xs="12">
                              <div className="product-item-details-img-contain">
                                <img
                                  src={liveWebinar?.thumbnail}
                                  alt="product thumbnail previewer"
                                />
                              </div>
                            </Col>
                            <Col md="6" sm="6" xs="12">
                              <div className="product-item-about">
                                <h3
                                  style={{
                                    color:
                                      theme?.themestyles.coursecardtextcolor,
                                  }}
                                >
                                  {liveWebinar?.title}
                                </h3>
                                <div
                                  style={{
                                    color:
                                      theme?.themestyles.coursecardtextcolor,
                                  }}
                                  className="file-type__info"
                                ></div>
                                <div
                                  style={{
                                    color:
                                      theme?.themestyles.coursecardtextcolor,
                                    borderColor:
                                      theme?.themestyles.coursecardtextcolor,
                                    borderWidth: "1px",
                                    borderStyle: "solid",
                                  }}
                                  className="product-category"
                                >
                                  {liveWebinar?.category}
                                </div>
                                <p
                                  style={{
                                    color:
                                      theme?.themestyles.coursecardtextcolor,
                                  }}
                                  className="product-item-details-text"
                                >
                                  {liveWebinar?.description}.
                                </p>
                                <p
                                  style={{
                                    color:
                                      theme?.themestyles.coursecardtextcolor,
                                  }}
                                  className="product-item-details-text"
                                >
                                  {liveWebinar?.isLive ? (
                                    <p className="islive">Live</p>
                                  ) : (
                                    ""
                                  )}
                                </p>
                                <p
                                  style={{
                                    color:
                                      theme?.themestyles.coursecardtextcolor,
                                  }}
                                  className="product-item-details-text"
                                >
                                  <p>
                                    {new Date(
                                      liveWebinar?.startTime
                                    ).toLocaleString("en-US", dateOptions)}
                                    {"  "}
                                    {new Date(
                                      liveWebinar?.startTime
                                    ).toLocaleString("en-US", timeOptions)}
                                  </p>

                                  <div>
                                    {liveWebinar?.isRecurring ? (
                                      <span>
                                        <i className="recurring-icon">ICON</i>
                                        Repeats{" "}
                                        {liveWebinar?.recurringFrequency}
                                        till
                                        {liveWebinar?.recurringEndDate}
                                      </span>
                                    ) : (
                                      <span>One-time Webinar</span>
                                    )}
                                  </div>
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
                          className="product-item-cart-info mt-4"
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
                                          theme?.themestyles
                                            .coursecardtextcolor,
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
                              to={
                                liveWebinar.price === 0
                                  ? `/livewebinar/watch/${liveWebinar.streamKey}`
                                  : `/cart`
                              }
                              block
                            >
                              {liveWebinar.price === 0
                                ? "Free Webinar"
                                : "Proceed To Checkout"}
                            </Button>
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </Container>
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
                      <div className="product-name-and-price">
                        <p title={liveWebinar?.title} className="product-name">
                          {liveWebinar?.title}
                        </p>
                        <div className="product-price-and-rating">
                          <p className="product-price">
                            {liveWebinar?.currency === "USD" && "$"}
                            {liveWebinar?.currency === "NGN" && "₦"}{" "}
                            {
                              <CurrencyFormat
                                value={liveWebinar?.price}
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
                        {cart.find(
                          (item) => item.itemId === liveWebinar?._id
                        ) !== undefined ? (
                          <Button
                            style={{
                              color: theme?.themestyles.buttonalttextcolor,
                              backgroundColor:
                                theme?.themestyles.buttonaltbackgroundcolor,
                              border: `1px solid ${theme?.themestyles.buttonalttextcolor}`,
                            }}
                            tag={Link}
                            to={
                              liveWebinar.price === 0
                                ? `/livewebinar/watch/${liveWebinar.streamKey}`
                                : `/cart`
                            }
                            className="action-btn add-to-cart-btn"
                          >
                            {liveWebinar.price === 0
                              ? "Free Webinar"
                              : "Go To Cart"}
                          </Button>
                        ) : liveWebinar.price === 0 ? (
                          <Link
                            style={{ width: "100%" }}
                            to={`/livewebinar/watch/${liveWebinar.streamKey}`}
                          >
                            {" "}
                            <Button
                              style={{
                                color: theme?.themestyles.buttonalttextcolor,
                                backgroundColor:
                                  theme?.themestyles.buttonaltbackgroundcolor,
                                border: `1px solid ${theme?.themestyles.buttonalttextcolor}`,
                              }}
                              // onClick={addProductToCart}
                              to={`/livewebinar/watch/${liveWebinar.streamKey}`}
                              className="action-btn add-to-cart-btn"
                            >
                              Free Webinar
                            </Button>
                          </Link>
                        ) : (
                          <Button
                            style={{
                              color: theme?.themestyles.buttonalttextcolor,
                              backgroundColor:
                                theme?.themestyles.buttonaltbackgroundcolor,
                              border: `1px solid ${theme?.themestyles.buttonalttextcolor}`,
                            }}
                            // onClick={addProductToCart}
                            onClick={addProductToCart}
                            className="action-btn add-to-cart-btn"
                          >
                            Add to cart
                          </Button>
                        )}
                      </div>
                    </Col>
                    <Col className="mb-3" md="4" sm="4" xs="12">
                      <div className="action-container">
                        {liveWebinar.price === 0 ? (
                          <Link
                            style={{ width: "100%" }}
                            to={`/livewebinar/watch/${liveWebinar.streamKey}`}
                          >
                            <Button
                              style={{
                                color: theme?.themestyles.buttontextcolor,
                                backgroundColor:
                                  theme?.themestyles.buttonbackgroundcolor,
                                border: "none",
                              }}
                              to={`/livewebinar/watch/${liveWebinar.streamKey}`}
                              className="action-btn get-course-btn"
                            >
                              Free Webinar
                            </Button>
                          </Link>
                        ) : (
                          <Button
                            style={{
                              color: theme?.themestyles.buttontextcolor,
                              backgroundColor:
                                theme?.themestyles.buttonbackgroundcolor,
                              border: "none",
                            }}
                            onClick={handleGetProductClick}
                            className="action-btn get-course-btn"
                          >
                            Get Access
                          </Button>
                        )}
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
});

export default connect(mapStateToProps)(LiveWebinarPreview);
