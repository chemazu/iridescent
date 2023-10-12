import React from "react";
import { Container, Row, Col } from "reactstrap";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import DashboardNavbarCopyForBillingsPage from "../DashboardNavbarCopyForBillingsPage";
import NotificationNavbar from "../NotificationNavbar";
import StripeCheckoutIntergrationComponent from "./StripeCheckoutIntergrationComponent";

import "../../../custom-styles/dashboard/dashboardlayout.css";

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

const StripeSubscriptionCheckoutPage = ({ match }) => {
  const { stripeCodePlanId } = match.params;

  return (
    <div className="dashboard-layout">
      <Container fluid>
        <Row>
          <DashboardNavbarCopyForBillingsPage />
          <Col className="page-actions__col">
            <div className="page-actions">
              <NotificationNavbar />
              <div className="stripe-checkout__content flex mt-6">
                <Elements stripe={stripePromise}>
                  <StripeCheckoutIntergrationComponent
                    stripeCodePlanId={stripeCodePlanId}
                  />
                </Elements>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default StripeSubscriptionCheckoutPage;
