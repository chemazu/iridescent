import React, { useState, useEffect } from "react";
import { connect, useDispatch } from "react-redux";
import axios from "axios";
import { Link, useHistory } from "react-router-dom";
import { Container, Row, Col, Button } from "reactstrap";
import { useAlert } from "react-alert";
import CurrencyFormat from "react-currency-format";
import setDocumentTitle from "../../../utilities/setDocumentTitle";
import getUserIpAddress from "../../../utilities/getUserIpAddress";
import { addToCart } from "../../../actions/cart";

import SecondaryPagesNavbar from "./SecondaryPagesNavbar";

const ProductPreviewPage = ({ schoolname, match, cart }) => {
  const dispatch = useDispatch();
  const alert = useAlert();
  const history = useHistory();
  const [school, setSchool] = useState(null);
  const [theme, setTheme] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  let tuturlyTheme = {
    themestyles: {
      primarytextcolor: "#000",
      coursecardbackgroundcolor: "rgb(71,110,250)",
      coursecardtextcolor: "#fff",
      buttonbackgroundcolor: "rgb(71,110,250)",
      buttontextcolor: "#fff",
      buttonalttextcolor: "#000",
      buttonaltbackgroundcolor: "#fff",
    },
  };
  const [product, setProduct] = useState(null);

  const getProductDetails = async (item) => {
    try {
      const res = await axios.get(
        // `/api/v1/tutor/product/${match.params.productId}`
        `/api/v1/tutor/product/${item}`
      );
      console.log(res);
      setProduct(res.data);
    } catch (error) {
      if (error.response.status === 404) {
        setProduct(null);
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
    dispatch(addToCart(product));
  };

  const handleGetProductClick = () => {
    if (cart.find((item) => item.itemId === product._id) !== undefined) {
      return alert.show("Course Already in Cart", {
        type: "error",
      });
    }
    addProductToCart();
    history.push(`/cart`);
  };

  useEffect(() => {
    getProductDetails(match.params.productId);
  }, [match.params.productId]);

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
          product === null ? (
            <p className="text-center lead">Product not found</p>
          ) : (
            <>
              <SecondaryPagesNavbar />
              <div
                style={{
                  backgroundColor:
                    tuturlyTheme.themestyles.secondarypagebackgroundcolor,
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
                              tuturlyTheme.themestyles
                                .coursecardbackgroundcolor,
                          }}
                          className="product-item-details mt-4"
                        >
                          <Row>
                            <Col md="6" sm="6" xs="12">
                              <div className="product-item-details-img-contain">
                                <img
                                  src={product?.thumbnail}
                                  alt="product thumbnail previewer"
                                />
                              </div>
                            </Col>
                            <Col md="6" sm="6" xs="12">
                              <div className="product-item-about">
                                <h3
                                  style={{
                                    color:
                                      tuturlyTheme.themestyles
                                        .coursecardtextcolor,
                                  }}
                                >
                                  {product?.title}
                                </h3>
                                <div
                                  style={{
                                    color:
                                      tuturlyTheme.themestyles
                                        .coursecardtextcolor,
                                  }}
                                  className="file-type__info"
                                >
                                  <span>
                                    {product?.file_type?.substring(1)}
                                  </span>{" "}
                                  File
                                </div>
                                <div
                                  style={{
                                    color:
                                      tuturlyTheme.themestyles
                                        .coursecardtextcolor,
                                    borderColor:
                                      tuturlyTheme.themestyles
                                        .coursecardtextcolor,
                                    borderWidth: "1px",
                                    borderStyle: "solid",
                                  }}
                                  className="product-category"
                                >
                                  {product?.category}
                                </div>
                                <p
                                  style={{
                                    color:
                                      tuturlyTheme.themestyles
                                        .coursecardtextcolor,
                                  }}
                                  className="product-item-details-text"
                                >
                                  {product?.description}.
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
                              tuturlyTheme.themestyles
                                .coursecardbackgroundcolor,
                          }}
                          className="product-item-cart-info mt-4"
                        >
                          <h3
                            style={{
                              color:
                                tuturlyTheme.themestyles.coursecardtextcolor,
                            }}
                          >
                            Shopping Cart
                          </h3>
                          <div className="cart-info-cart-item__container mt-3">
                            {cart.length === 0 ? (
                              <p
                                style={{
                                  color:
                                    tuturlyTheme.themestyles
                                      .coursecardtextcolor,
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
                                          tuturlyTheme.themestyles
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
                                  tuturlyTheme.themestyles
                                    .buttonbackgroundcolor,
                                color: tuturlyTheme.themestyles.buttontextcolor,
                                border: "1px solid #fff",
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
                </Container>
              </div>

              <div
                style={{
                  backgroundColor:
                    tuturlyTheme.themestyles.buttonaltbackgroundcolor,
                  color: tuturlyTheme.themestyles.buttonalttextcolor,
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
                        <p title={product?.title} className="product-name">
                          {product?.title}
                        </p>
                        <div className="product-price-and-rating">
                          <p className="product-price">
                            &#8358;
                            {
                              <CurrencyFormat
                                value={product?.price}
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
                        {cart.find((item) => item.itemId === product?._id) !==
                        undefined ? (
                          <Button
                            style={{
                              color:
                                tuturlyTheme.themestyles.buttonalttextcolor,
                              backgroundColor:
                                tuturlyTheme.themestyles
                                  .buttonaltbackgroundcolor,
                              border: `1px solid ${tuturlyTheme.themestyles.buttonalttextcolor}`,
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
                              color:
                                tuturlyTheme.themestyles.buttonalttextcolor,
                              backgroundColor:
                                tuturlyTheme.themestyles
                                  .buttonaltbackgroundcolor,
                              border: `1px solid ${tuturlyTheme.themestyles.buttonalttextcolor}`,
                            }}
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
                        <Button
                          style={{
                            color: tuturlyTheme.themestyles.buttontextcolor,
                            backgroundColor:
                              tuturlyTheme.themestyles.buttonbackgroundcolor,
                            border: "none",
                          }}
                          onClick={handleGetProductClick}
                          className="action-btn get-course-btn"
                        >
                          Get Product
                        </Button>
                      </div>
                    </Col>
                  </Row>
                </Container>
              </div>
              <div
                style={{
                  backgroundColor:
                    tuturlyTheme.themestyles.footerbackgroundcolor,
                  color: tuturlyTheme.themestyles.footertextcolor,
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

export default connect(mapStateToProps)(ProductPreviewPage);
