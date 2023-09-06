import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { Button } from "reactstrap";
import PaystackPop from "@paystack/inline-js";
import roundToTwoDecimalPlaces from "../../../utilities/roundToTwoDecimalPlaces";

import CurrencyFormat from "react-currency-format";
import axios from "axios";
import setAuthToken from "../../../utilities/setAuthToken";
import { Elements } from "@stripe/react-stripe-js";
import StripeCheckoutModal from "../../school/StripeCheckoutModal";
import { startLoading, stopLoading } from "../../../actions/appLoading";
import { loadStripe } from "@stripe/stripe-js";
import { Link, useHistory } from "react-router-dom";

function PaymentModal({
  currency,
  roomId,
  setFreeTimer,
  type,
  close,
  updateCount,
  displayLoader,
  removeLoader,
}) {
  const userDetails = {
    email: "chukwuemekachemazu@gmail.com",
    purchaseType: "more time",
    schoolname: "chemazu",
  };

  const [paymentMethodToUse, setPaymentMethodToUse] = useState({
    name: "",
  });
  const [amountToPay, setAmountToPay] = useState(1);
  const [stripeClientSecret, setStripeClientSecret] = useState("");
  const [school, setSchool] = useState(null);
  const [addedResource, setAddedResource] = useState(0);

  const [theme, setTheme] = useState(null);
  const [stripeCheckoutModalDialog, setStripeCheckoutModalDialog] =
    useState(false);
  const [transactionSuccessModal, setTransactionSuccessModal] = useState(false);

  const closeStripeCheckoutModal = () => setStripeCheckoutModalDialog(false);
  const [stripePromise, setStripePromise] = useState(null);
  const toggleTransactionModal = () =>
    setTransactionSuccessModal(!transactionSuccessModal);

  const handlePostSuccessfullTransactionFeedback = () => {
    toggleTransactionModal();
    handleSuccess();
    setStripeCheckoutModalDialog(false);
    setStripePromise(null);
    setStripeClientSecret("");
    // show course purchase success modal.
    // setPurchasedCourses(cart); // show list of purchased items from cart
    // clearCartAfterCheckOut(); // clear cart after purchase verification.
  };
  const getSchoolBySchoolName = async (schoolname) => {
    try {
      const res = await axios.get(`/api/v1/school/${schoolname}`);
      setSchool(res.data);
      return res.data;
    } catch (error) {
      if (error.response.status === 404) {
        setSchool(null);
      }
      console.log(error.response.data.errors[0].msg);
      return null;
    }
  };
  const history = useHistory();
  useEffect(() => {
    getSchoolLandingPageContents(userDetails.schoolname);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const getSchoolThemeBySchoolId = async (schoolId) => {
    try {
      const res = await axios.get(`/api/v1/theme/${schoolId}`);
      setTheme(res.data);
    } catch (error) {
      if (error.response.status === 404) {
        setTheme(null);
      }
      console.log(error.response.data.errors[0].msg);
      return null;
    }
  };

  const getSchoolLandingPageContents = async (schoolName) => {
    const school = await getSchoolBySchoolName(schoolName);
    if (school) {
      await getSchoolThemeBySchoolId(school._id);
    }
  };
  const handleStripeMakePaymentIntent = async (currency, amount) => {
    try {
      displayLoader();
      if (localStorage.getItem("studentToken")) {
        setAuthToken(localStorage.getItem("studentToken"));
      }
      const currencyInfo = currency.currency;
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };
      const body = JSON.stringify({
        currency: currencyInfo.toLowerCase(),

        amount: amountToPay,
        metadata: {
          schoolname: userDetails.schoolname,
        },
      });
      const res = await axios.post(
        "/api/v1/stripe/create-payment-intent",
        body,
        config
      );

      setStripeClientSecret(res.data.clientSecret);
      setStripeCheckoutModalDialog(true);
      removeLoader();
    } catch (error) {
      console.log(error);
    }
  };

  const updateEndTime = async (transaction, newResource) => {
    const body = {
      streamKey: roomId,
      added: newResource,
      orderType: type,
      ...transaction,
      amount: amountToPay,
    };
    let res = await axios.put("/api/v1/livewebinar/addTime", body);
    console.log(res.data.newTime);
    localStorage.setItem(roomId, res.data.newTime);
    setFreeTimer(res.data.newTime);
    close();
    // make the api call

    // get the updated data
    // update the localstorage
  };
  const updateResourceCount = async (transaction, newResource) => {
    const body = {
      streamKey: roomId,
      orderType: type,
      added: newResource,

      ...transaction,
      amount: amountToPay,
    };
    console.log("dsdsd");
    let res = await axios.post("/api/v1/classroomresource/add-resource", body);
    console.log(res.data);
    close();
    updateCount(2);

    // make the api call
    // get the updated data
    // update the localstorage
  };
  const handleSuccess = (data, newResource) => {
    if (type === "time") {
      updateEndTime(data, newResource);
    } else {
      updateResourceCount(data, newResource);
    }
  };
  const payStackPaymentHandler = (paymentMethodInfo, value, newResource) => {
    const payStack = new PaystackPop();
    payStack.newTransaction({
      key:
        process.env.NODE_ENV === "production"
          ? process.env.REACT_APP_PAYSTACK_PUBLIC_KEY
          : process.env.REACT_APP_PAYSTACK_TEST_PUBLIC_KEY,
      email: userDetails.email,
      amount: roundToTwoDecimalPlaces(value * currency.exchangeRate * 100),
      currency: "NGN",
      channels: ["card", "bank", "ussd", "bank_transfer"],

      onSuccess: async (transaction) => {
        console.log("first", transaction);
        let data = { amount: value, ...transaction };
        handleSuccess(data, newResource);
        //   console.log(type)
        //   if(type==="poll"||type==="quiz"){
        //     console.log(type,"lego")
        // updateResourceCount(data);

        //   }
        //   if (type === "time") {
        //     updateEndTime(data);
        //   }

        // make an api call to update the endTime by hr
        // update the state for the number of resources
        // find a way to show how many more resources can be done
      },
      onCancel: () => {
        alert.show("are you sure u wanna do that!");
      },
    });
  };
  const checkOut = async (value, newResource) => {
    switch (paymentMethodToUse.name) {
      case "paystack":
        payStackPaymentHandler(paymentMethodToUse, value, newResource);

        break;
      case "stripe":
        handleStripeMakePaymentIntent(currency, value * currency.exchangeRate);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    // code to use to determine payment infrastructure.
    if (currency.countryCode === "NG") {
      setPaymentMethodToUse({
        ...paymentMethodToUse,
        name: "paystack",
      });
    } else {
      setPaymentMethodToUse({
        ...paymentMethodToUse,
        name: "stripe",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currency]);

  useEffect(() => {
    setStripePromise(loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY));
  }, []);
  return (
    <div className="more-time-payment-modal">
      {type === "poll" && (
        <>
          <Button
            onClick={() => {
              checkOut(1, 2);
            }}
            block
            className="more-time"
            id="caret"
          >
            Add 2 more Polls for{" "}
            <span
              dangerouslySetInnerHTML={{
                __html: currency.htmlCurrencySymbol,
              }}
            ></span>
            <CurrencyFormat
              value={roundToTwoDecimalPlaces(1 * currency.exchangeRate)}
              displayType="text"
              thousandSeparator={true}
              decimalScale={1}
              fixedDecimalScale={true}
            />
          </Button>{" "}
          <Button
            onClick={() => {
              setAmountToPay(2);
              checkOut(2, 4);
            }}
            block
            className="more-time"
            id="caret"
          >
            Add 4 more Polls for{" "}
            <span
              dangerouslySetInnerHTML={{
                __html: currency.htmlCurrencySymbol,
              }}
            ></span>
            <CurrencyFormat
              value={roundToTwoDecimalPlaces(2 * currency.exchangeRate)}
              displayType="text"
              thousandSeparator={true}
              decimalScale={1}
              fixedDecimalScale={true}
            />
          </Button>{" "}
        </>
      )}
      {type === "quiz" && (
        <>
          <Button
            onClick={() => {
              checkOut(1, 2);
            }}
            block
            className="more-time"
            id="caret"
          >
            Add 2 more Quizzes for{" "}
            <span
              dangerouslySetInnerHTML={{
                __html: currency.htmlCurrencySymbol,
              }}
            ></span>
            <CurrencyFormat
              value={roundToTwoDecimalPlaces(1 * currency.exchangeRate)}
              displayType="text"
              thousandSeparator={true}
              decimalScale={1}
              fixedDecimalScale={true}
            />
          </Button>{" "}
          <Button
            onClick={() => {
              checkOut(2, 4);
            }}
            block
            className="more-time"
            id="caret"
          >
            Add 4 more Quizzess for{" "}
            <span
              dangerouslySetInnerHTML={{
                __html: currency.htmlCurrencySymbol,
              }}
            ></span>
            <CurrencyFormat
              value={roundToTwoDecimalPlaces(2 * currency.exchangeRate)}
              displayType="text"
              thousandSeparator={true}
              decimalScale={1}
              fixedDecimalScale={true}
            />
          </Button>{" "}
        </>
      )}
      {type === "time" && (
        <>
          <Button
            onClick={() => {
              checkOut(2, 30);
            }}
            block
            className="more-time"
            id="caret"
          >
            Extend your time by 30 Mins for{" "}
            <span
              dangerouslySetInnerHTML={{
                __html: currency.htmlCurrencySymbol,
              }}
            ></span>
            <CurrencyFormat
              value={roundToTwoDecimalPlaces(2 * currency.exchangeRate)}
              displayType="text"
              thousandSeparator={true}
              decimalScale={1}
              fixedDecimalScale={true}
            />
          </Button>
          <Button
            onClick={() => {
              checkOut(3, 60);
            }}
            block
            className="more-time"
            id="caret"
          >
            Extend your time by 1 hour for{" "}
            <span
              dangerouslySetInnerHTML={{
                __html: currency.htmlCurrencySymbol,
              }}
            ></span>
            <CurrencyFormat
              value={roundToTwoDecimalPlaces(3 * currency.exchangeRate)}
              displayType="text"
              thousandSeparator={true}
              decimalScale={1}
              fixedDecimalScale={true}
            />
          </Button>
        </>
      )}
      <Button
        block
        className="more-time-sec"
        onClick={() => {
          history.push("/dashboard/plans/payment");
        }}
      >
        Upgrade your Tuturly plan for Unlimited time
      </Button>

      <>
        {stripePromise && stripeClientSecret && (
          <Elements
            stripe={stripePromise}
            options={{ clientSecret: stripeClientSecret }}
          >
            <StripeCheckoutModal
              isOpen={
                stripeCheckoutModalDialog &&
                stripePromise !== null &&
                stripeClientSecret.length > 0
              }
              closeStripeCheckoutModal={closeStripeCheckoutModal}
              handlePostSuccessfullTransactionFeedback={
                handlePostSuccessfullTransactionFeedback
              }
              theme={theme}
            />
          </Elements>
        )}
      </>
    </div>
  );
}

const mapStateToProps = (state) => ({
  currency: state.currency,
});

const mapDispatchToProps = (dispatch) => ({
  displayLoader: () => dispatch(startLoading()),
  removeLoader: () => dispatch(stopLoading()),
});

export default connect(mapStateToProps, mapDispatchToProps)(PaymentModal);
