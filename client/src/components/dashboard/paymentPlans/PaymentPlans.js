import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { Row, Col, Container } from "reactstrap";
import axios from "axios";
import { useAlert } from "react-alert";
import NotificationNavbar from "../NotificationNavbar";
import DashboardNavbarCopyForBillingsPage from "../DashboardNavbarCopyForBillingsPage";
import PaymentPlansLoadingSkeleton from "./PaymentPlansLoadingSkeleton";
import PaymentPlansItem from "./PaymentPlansItem";
import { UPDATE_DASHBOARD_PAGE_COUNTER } from "../../../actions/types";

import "../../../custom-styles/dashboard/dashboardlayout.css";
import "../../../custom-styles/dashboard/paymentplans.css";

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

const PaymentPlans = () => {
  const alert = useAlert();
  const [paymentPlans, setPaymentPlans] = useState([]);
  const [paymentPlansLoading, setPaymentPlansLoading] = useState(true);
  const dispatch = useDispatch();

  const getPaymentPlans = async () => {
    try {
      const res = await axios.get("/api/v1/paymentplans");
      setPaymentPlans(res.data);
      setPaymentPlansLoading(false);
    } catch (error) {
      alert.show(error.message, {
        type: "error",
      });
    }
  };

  // list reflects the order we want our plans to display in.
  const sortedPlanList = ["free", "basic", "enterprise"];

  const sorderPlans = sortedPlanList.map((planName) =>
    paymentPlans.find((item) => item?.planname?.toLowerCase() === planName)
  );

  useEffect(() => {
    getPaymentPlans();
    dispatch({
      type: UPDATE_DASHBOARD_PAGE_COUNTER,
      payload: 20,
    });
    // eslint-disable-next-line
  }, []);

  return (
    <>
      <Elements stripe={stripePromise}>
        <div className="dashboard-layout">
          <Container fluid>
            <Row>
              <DashboardNavbarCopyForBillingsPage />
              <Col className="page-actions__col">
                <div className="page-actions">
                  <NotificationNavbar />
                  <div className="payment-plans__content mt-6">
                    <h1 className="mb-5">Select A Tuturly Plan.</h1>
                    {paymentPlansLoading ? (
                      <>
                        <PaymentPlansLoadingSkeleton />
                      </>
                    ) : (
                      <>
                        <div className="paymemnt-plans__container">
                          <Container
                            style={{
                              width: "90%",
                            }}
                            fluid
                          >
                            <Row className="mb-4">
                              {paymentPlans.length === 0 ? (
                                <p className="text-center lead">
                                  Payment plans not found!
                                </p>
                              ) : (
                                <>
                                  {sorderPlans.map((planItem) => (
                                    <PaymentPlansItem
                                      key={planItem._id}
                                      plan={planItem}
                                    />
                                  ))}
                                </>
                              )}
                            </Row>
                          </Container>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </Col>
            </Row>
          </Container>
        </div>
      </Elements>
    </>
  );
};

export default PaymentPlans;