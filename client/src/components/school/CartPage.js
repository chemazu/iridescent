import React, { useState, useEffect } from "react";
import axios from "axios";
import { useHistory } from "react-router-dom";
import { studentAuth } from "../../actions/student";
import { connect } from "react-redux";
import CurrencyFormat from "react-currency-format";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Container, Row, Col, Button } from "reactstrap";
import { clearCart } from "../../actions/cart";
import { useAlert } from "react-alert";
import { startLoading, stopLoading } from "../../actions/appLoading";
import AuthenticationModal from "./AuthenticationModal";
import TransactionSuccessModal from "./TransactionSuccessModal";
import PaystackPop from "@paystack/inline-js";
import PageNavbar from "./PageNavbar";
import setAuthToken from "../../utilities/setAuthToken";
import CartItem from "./CartItem";
import setDocumentTitle from "../../utilities/setDocumentTitle";
import SubdomainNotFoundPage from "../dashboard/Subdomain404";
import delay from "../../utilities/delay";

// function used to calculate actual cost/price if course has discount
import calculateDiscountForCourseCart from "../../utilities/calculateDiscountForCourseCart";

import "../../custom-styles/pages/cartpage.css";

export const CartPage = ({
  match,
  cart,
  student,
  displayLoader,
  removeLoader,
  clearCartAfterCheckOut,
  schoolname,
}) => {
  const [school, setSchool] = useState(null);
  const [theme, setTheme] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const dispatch = useDispatch();
  const history = useHistory();

  // eslint-disable-next-line
  const [paymentMethodToUse, setPaymentMethodToUse] = useState({
    name: "paystack",
  });
  // const [dropdownOpen, setOpen] = useState(false); // used to control the checkout options dropdown
  const [authModal, setAuthModal] = useState(false);
  const [transactionSuccessModal, setTransactionSuccessModal] = useState(false);
  const [purchasedCourses, setPurchasedCourses] = useState([]);
  const alert = useAlert();

  const toggleAuthModal = () => setAuthModal(!authModal);
  const toggleTransactionModal = () =>
    setTransactionSuccessModal(!transactionSuccessModal);

  const cartItemSumWithDiscount = cart?.reduce((prev, curr) => {
    if (curr.itemDiscount) {
      return (
        prev + calculateDiscountForCourseCart(curr.itemPrice, curr.itemDiscount)
      );
    } else {
      return prev + curr.itemPrice;
    }
  }, 0);

  const actualCostWithoutDiscount = cart?.reduce((prev, curr) => {
    return prev + curr.itemPrice;
  }, 0);

  const getCourseTotalSavingFromDiscount = () => {
    return actualCostWithoutDiscount - cartItemSumWithDiscount;
  };

  const calculateSavingsInPercentage = () => {
    if (cart.length === 0) return 0;
    const differenceInCost =
      actualCostWithoutDiscount - cartItemSumWithDiscount;
    const percentDifference =
      (differenceInCost / actualCostWithoutDiscount) * 100;
    return Math.round(percentDifference);
  };

  const checkOut = async () => {
    // check state to ensure user is authenticated before
    if (student.authenticated === false || !student.studentDetails) {
      return setAuthModal(true);
    }

    const validateResult = await validateCourseBeforePurchase();
    if (validateResult.validation_result === true) {
      return alert.show("An Item in Cart is Already Purchased By Student.", {
        type: "error",
      });
    }

    switch (paymentMethodToUse.name) {
      case "paystack":
        payStackPaymentHandler(paymentMethodToUse);
        break;
      case "stripe":
        alert("call the stripe payment gateway method");
        break;
      default:
        break;
    }
  };

  const payStackPaymentHandler = (paymentMethodInfo) => {
    const payStack = new PaystackPop();
    payStack.newTransaction({
      key:
        process.env.NODE_ENV === "production"
          ? process.env.REACT_APP_PAYSTACK_PUBLIC_KEY
          : process.env.REACT_APP_PAYSTACK_TEST_PUBLIC_KEY,
      email: student.studentDetails.email,
      amount: cartItemSumWithDiscount * 100,
      currency: "NGN",
      channels: ["card", "bank", "ussd", "bank_transfer"],
      metadata: {
        studentToken: localStorage.getItem("studentToken"),
        cart: cart,
        schoolname: schoolname,
      },
      onSuccess: async (transaction) => {
      
        try {
          if (localStorage.getItem("studentToken")) {
            setAuthToken(localStorage.getItem("studentToken"));
          }
          displayLoader();
          await delay(4000);
          const config = {
            headers: {
              "Content-Type": "application/json",
            },
          };
          const body = JSON.stringify({
            transaction_reference: transaction.reference,
            schoolname: schoolname,
            payment_method_name: paymentMethodToUse.name,
            purchased_course: cart,
            amount: cartItemSumWithDiscount,
          });
console.log(body)
          const res = await axios.post(
            "/api/v1/school/course/verify/purchase",
            body,
            config
          );
          console.log(res)
          if (res.data.status) {
            toggleTransactionModal();
            setPurchasedCourses(cart);
            clearCartAfterCheckOut();
          }
          removeLoader();
        } catch (error) {
          console.log(error)
          removeLoader();
          if (error.response.status === 400) {
            const errors = error.response?.data?.errors;
            if (errors) {
              errors.forEach((err) => {
                alert.show(err.msg, {
                  type: "error",
                });
              });
            }
          }
          if (error.response.status === 401) {
            // redirect to dashbaord
            history.push("/dashboard/courses");
          }
        }
      },
      onCancel: () => {
        alert.show("are you sure u wanna do that!");
      },
    });
  };
 
  const validateCourseBeforePurchase = async () => {
    try {
      if (localStorage.getItem("studentToken")) {
        setAuthToken(localStorage.getItem("studentToken"));
      }
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };
      const body = JSON.stringify({
        purchased_course: cart,
      });
      const res = await axios.post(
        "/api/v1/school/purchase/validate",
        body,
        config
      );
      return res.data;
    } catch (error) {
      console.log(JSON.stringify(error));
      if (error.response.status === 400) {
        const errors = error.response.body.errors;
        errors.forEach((err) => {
          alert.show(err.msg, {
            type: "error",
          });
        });
      }
    }
  };

  const addCourseToStudentSaveCourses = async (courseId) => {
    if (student.authenticated === false || !student.studentDetails) {
      return setAuthModal(true);
    }
    try {
      if (localStorage.getItem("studentToken")) {
        setAuthToken(localStorage.getItem("studentToken"));
      }
      displayLoader();
      await axios.post(`/api/v1/savedcourse/${schoolname}/${courseId}`);
      alert.show("course saved successfully", {
        type: "success",
      });
      removeLoader();
    } catch (error) {
      removeLoader();
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
            <SubdomainNotFoundPage schoolName={schoolname} school={school} />
          ) : (
            <>
              <PageNavbar theme={theme} pageName={schoolname} />
              <div
                style={{
                  backgroundColor:
                    theme.themestyles.secondarypagebackgroundcolor,
                }}
                className="cart-page-contents"
              >
                <div
                  style={{
                    borderBottom: `1px solid ${theme.themestyles.primarytextcolor}`,
                  }}
                  className="cart-title"
                >
                  <Container
                    fluid
                    style={{
                      width: "90%",
                    }}
                  >
                    <h3
                      style={{
                        color: theme.themestyles.primarytextcolor,
                      }}
                    >
                      Shopping Cart
                    </h3>
                  </Container>
                </div>
                <div className="cart-container">
                  <Container
                    fluid
                    style={{
                      width: "90%",
                    }}
                  >
                    <Row>
                      <Col xs="12" sm="12" md="12" lg="8" xl="9">
                        <div className="cart-list">
                          {cart.length === 0 ? (
                            <p
                              style={{
                                color: theme.themestyles.primarytextcolor,
                                fontWeight: "400",
                              }}
                            >
                              You have no course in your cart. Click{" "}
                              <Link to={`/`}>Here</Link> to See course and to
                              cart
                            </p>
                          ) : (
                            <>
                              {cart.map((cartItem) => (
                                <CartItem
                                  key={cartItem.itemId}
                                  cartItem={cartItem}
                                  theme={theme}
                                  addCourseToStudentSaveCourses={
                                    addCourseToStudentSaveCourses
                                  }
                                />
                              ))}
                            </>
                          )}
                        </div>
                      </Col>
                      <Col
                        className="cart-sum"
                        xs="12"
                        sm="12"
                        md="12"
                        lg="4"
                        xl="3"
                      >
                        <div
                          style={{
                            backgroundColor:
                              theme.themestyles.coursecardbackgroundcolor,
                          }}
                          className="cart-summary mb-3"
                        >
                          <div
                            style={{
                              color: theme.themestyles.coursecardtextcolor,
                            }}
                            className="cart-subtotal"
                          >
                            <p>Subtotal:</p>{" "}
                            <h4
                              style={{
                                color: theme.themestyles.coursecardtextcolor,
                              }}
                            >
                              <span className="actual-price-span">
                                &#8358;
                                <CurrencyFormat
                                  value={actualCostWithoutDiscount}
                                  displayType="text"
                                  thousandSeparator={true}
                                  decimalScale={1}
                                  fixedDecimalScale={true}
                                />
                              </span>
                              &#8358;
                              <CurrencyFormat
                                value={cartItemSumWithDiscount}
                                displayType="text"
                                thousandSeparator={true}
                                decimalScale={1}
                                fixedDecimalScale={true}
                              />
                            </h4>
                          </div>
                          <div
                            style={{
                              color: theme.themestyles.coursecardtextcolor,
                            }}
                            className="cart-tax"
                          >
                            <p>
                              Total Savings(%{calculateSavingsInPercentage()}):
                            </p>{" "}
                            <p>
                              &#8358;
                              {
                                <CurrencyFormat
                                  value={getCourseTotalSavingFromDiscount()}
                                  displayType="text"
                                  thousandSeparator={true}
                                  decimalScale={1}
                                  fixedDecimalScale={true}
                                />
                              }
                            </p>
                          </div>
                          <div
                            style={{
                              color: theme.themestyles.coursecardtextcolor,
                            }}
                            className="cart-total"
                          >
                            <p>Total</p>{" "}
                            <p>
                              &#8358;
                              {
                                <CurrencyFormat
                                  value={cartItemSumWithDiscount}
                                  displayType="text"
                                  thousandSeparator={true}
                                  decimalScale={1}
                                  fixedDecimalScale={true}
                                />
                              }
                            </p>
                          </div>

                          <Button
                            style={{
                              color: theme.themestyles.buttontextcolor,
                              backgroundColor:
                                theme.themestyles.buttonbackgroundcolor,
                            }}
                            onClick={checkOut}
                            block
                            className="checkout-btn"
                            id="caret"
                          >
                            Checkout with {paymentMethodToUse?.name}
                          </Button>
                        </div>
                      </Col>
                    </Row>
                  </Container>
                </div>
              </div>
              <div
                style={{
                  backgroundColor: theme.themestyles.footerbackgroundcolor,
                  color: theme.themestyles.footertextcolor,
                  borderTop: `1px solid ${theme.themestyles.primarytextcolor}`,
                }}
                className="cart-page-footer"
              >
                Copyright {new Date().getFullYear()} - {schoolname}
              </div>
              <AuthenticationModal
                schoolName={schoolname}
                authModal={authModal}
                toggleAuthModal={toggleAuthModal}
                theme={theme}
              />
              <TransactionSuccessModal
                isTransactionModalOpen={transactionSuccessModal}
                toggleTransactionModal={toggleTransactionModal}
                schoolName={schoolname}
                purchasedCourses={purchasedCourses}
                theme={theme}
                successUrlRedirect="/dashboard/courses"
              />
            </>
          )}
        </>
      )}
    </>
  );
};

const mapStateToProps = (state) => ({
  cart: state.cart,
  student: state.student,
  schoolname: state.subdomain,
});

const mapDispatchToProps = (dispatch) => ({
  displayLoader: () => dispatch(startLoading()),
  removeLoader: () => dispatch(stopLoading()),
  clearCartAfterCheckOut: () => dispatch(clearCart()),
});

export default connect(mapStateToProps, mapDispatchToProps)(CartPage);
