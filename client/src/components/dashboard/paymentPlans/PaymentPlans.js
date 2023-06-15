import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
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
                          <Row>
                            {paymentPlans.length === 0 ? (
                              <p className="text-center lead">
                                Payment plans not found!
                              </p>
                            ) : (
                              <>
                                {paymentPlans.map((planItem) => (
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
    </>
  );
};

export default PaymentPlans;
