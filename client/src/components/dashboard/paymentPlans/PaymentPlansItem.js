import React, { useState } from "react";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { connect } from "react-redux";
import { useHistory } from "react-router-dom";
import CurrencyFormat from "react-currency-format";
import { Col, Button, Modal, Card } from "reactstrap";
import axios from "axios";
import setAuthToken from "../../../utilities/setAuthToken";
import { useAlert } from "react-alert";
import { startLoading, stopLoading } from "../../../actions/appLoading";

// eslint-disable-next-line
const getPlanSizeByPlanName = (planName) => {
  switch (planName.toLowerCase()) {
    case "free":
      return "400 Megabytes Storage space";
    case "basic":
      return "10 Gigabytes Storage space";
    case "enterprise":
      return "25 Gigabytes Storage space";
    default:
      return;
  }
};

const PaymentPlansItem = ({
  plan,
  showLoader,
  removeLoader,
  user,
  currency,
}) => {
  const alert = useAlert();
  const history = useHistory();
  const [confirmModal, setConfirmModal] = useState(false);
  const [planChoiceValidationError, setPlanChoiceValidationError] =
    useState(false);

  const stripe = useStripe();
  const elements = useElements();

  const choseSubscription = async () => {
    // if user is on the free plan
    if (plan._id === user.selectedplan) {
      return alert.show("Plan already selected", {
        type: "info",
      });
    }
    if (currency.countryCode === "NG") {
      handlePaystackSubscriptionPayment();
    } else {
      history.push(
        `/dashboard/plans/subscription/checkout/${plan.stripe_plan_code}`
      );
    }
  };

  const handlePaystackSubscriptionPayment = async () => {
    showLoader();
    if (localStorage.getItem("token")) {
      setAuthToken(localStorage.getItem("token"));
    }

    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    const body = JSON.stringify({
      planid: plan._id,
    });

    try {
      const res = await axios.post("/api/v1/paymentplans/chose", body, config);
      const { data } = res;
      if (data.status === true) {
        window.location.href = data.data.authorization_url;
      } else {
        alert.show("subscription cannot be completed at this time", {
          type: "error",
        });
      }
      removeLoader();
    } catch (error) {
      if (error.response.status === 401) {
        setPlanChoiceValidationError(true);
        setConfirmModal(false);
      }
      const errors = error.response?.data?.errors | [];
      if (errors) {
        errors.forEach((error) => alert.show(error.msg, { type: "error" }));
      }
      alert.show(error.message, {
        type: "error",
      });
      removeLoader();
    }
  };

  const handlePlanContentDisplay = (planName) => {
    const plan = planName.toLowerCase();
    if (plan === "free") {
      return (
        <ul>
          <li>30 mins of Tuturly classsroom</li>
          <li>3 Quiz creation</li>
          <li>3 Polls creation</li>
          <li>2 Digital Products</li>
          <li>Website builder and landing page</li>
          <li>Get paid from anywhere in the world</li>
          <li>Unlimited Students</li>
          <li>Tuturly Classroom</li>
        </ul>
      );
    }
    if (plan === "basic") {
      return (
        <ul>
          <li>Free Plan +</li>
          <li>Unlimited time on tuturly classroom</li>
          <li>Unlimited tests to students</li>
          <li>Unlimited polls</li>
        </ul>
      );
    }
    if (plan === "enterprise") {
      return (
        <ul>
          <li>Basic Plan +</li>
          <li>20 Free gigabytes for Uploading courses and Dgital Products</li>
          <li>Tuturly.com sub link removed (coming soon)</li>
          <li>Banner of (created by tuturly.com) removed</li>
        </ul>
      );
    }
  };

  return (
    <>
      <Col xs="12" sm="12" md="6" lg="4">
        <div className="payment-plan__item">
          <div
            className={`payment-plan__item-header
            ${
              plan.planname.toLowerCase() === "free" &&
              "payment-plan__item-header-color-free"
            }
            ${
              plan.planname.toLowerCase() === "basic" &&
              "payment-plan__item-header-color-basic"
            }
            ${
              plan.planname.toLowerCase() === "enterprise" &&
              "payment-plan__item-header-color-enterprise"
            }
            }`}
          >
            <div className="plan-name">
              Tuturly {plan.planname}
              {user?.selectedplan._id === plan._id && (
                <span
                  style={{
                    fontWeight: "800",
                  }}
                  className="current-plan__text ml-2"
                >
                  (chosen plan)
                </span>
              )}
            </div>
            <div className="plan-cost">
              {plan.planprice === 0 ? (
                "Free"
              ) : (
                <>
                  &#36;
                  <CurrencyFormat
                    value={plan.planprice_usd}
                    displayType="text"
                    thousandSeparator={true}
                    fixedDecimalScale={true}
                  />
                </>
              )}
              {plan.planprice !== 0 && (
                <span className="per-month__text">Per Month</span>
              )}
            </div>
            {/* {
               plan.planname.toLowerCase() === 'enterprise' && <div className='enterprise-plan__more-info'>
               Save 20% When you Pay Per Annum
             </div>
             } */}
          </div>
          <div className="payment-plan__content mt-5">
            {handlePlanContentDisplay(plan.planname)}
          </div>
          <div className="payment-plan__item-footer">
            <Button
              disabled={
                user?.selectedplan._id === plan._id &&
                user?.subscriptionstatus === true
              }
              onClick={() => setConfirmModal(true)}
              block
            >
              Select
            </Button>
          </div>
        </div>
      </Col>
      <Modal isOpen={confirmModal} size="md" centered>
        <div
          style={{
            color: "#242121",
            fontWeight: "530",
          }}
          className="modal-header"
        >
          Confirm Subscription.
        </div>
        <Card
          style={{
            padding: "35px",
          }}
        >
          <p
            style={{
              color: "#242121",
            }}
            className="text-center lead"
          >
            Are you sure, you want to subscribe to the tuturly {plan.planname}{" "}
            plan ?
          </p>
        </Card>
        <div className="modal-footer">
          <Button
            className="modal-btn-style-outline"
            style={{
              boxShadow: "none",
            }}
            block
            onClick={() => setConfirmModal(false)}
          >
            Cancel
          </Button>
          <Button
            className="modal-btn-style"
            style={{
              boxShadow: "none",
            }}
            block
            onClick={choseSubscription}
          >
            Confirm
          </Button>
        </div>
      </Modal>
      <Modal isOpen={planChoiceValidationError} size="md" centered>
        <div className="modal-header plan-upgrade-modal__header">
          <h3>Cannot choose Plan</h3>
          <div
            onClick={() => setPlanChoiceValidationError(false)}
            className="modal-close__btn"
          >
            <i className="fas fa-times"></i>
          </div>
        </div>
        <div className="modal-body plan-upgrade-modal__body">
          <p className="text-center lead">
            You are about to choose a plan that may not be sufficient for your
            current storage needs.
            <br />
            Please subscribe to a higher plan or Contact the administator to
            delete some of your existing data.
          </p>
        </div>
        <div className="modal-footer">
          <Button
            onClick={() => setPlanChoiceValidationError(false)}
            block
            className="modal-btn-style"
          >
            Confirm
          </Button>
        </div>
      </Modal>
    </>
  );
};

const mapStatetoProps = (state) => ({
  user: state.auth.user,
  currency: state.currency,
});

const mapDispatchToProps = (dispatch) => ({
  showLoader: () => dispatch(startLoading()),
  removeLoader: () => dispatch(stopLoading()),
});

export default connect(mapStatetoProps, mapDispatchToProps)(PaymentPlansItem);