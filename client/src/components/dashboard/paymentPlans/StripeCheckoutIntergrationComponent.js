import React from "react";
import { connect } from "react-redux";
import axios from "axios";
import { useAlert } from "react-alert";
import { useHistory } from "react-router-dom";
import setAuthToken from "../../../utilities/setAuthToken";
import { Card, Row, Container, Col, CardBody, Button } from "reactstrap";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { startLoading, stopLoading } from "../../../actions/appLoading";
import CardInput from "./CardInput";

const StripeCheckoutIntergrationComponent = ({
  stripeCodePlanId,
  showLoader,
  removeLoader,
  user,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const alert = useAlert();
  const history = useHistory();

  const handleSubscibeButtonClick = async () => {
    if (!stripe || !elements) {
      return;
    }

    showLoader();

    const result = await stripe.createPaymentMethod({
      type: "card",
      card: elements.getElement(CardElement),
      billing_details: {
        name: `${user.firstname} ${user.lastname}`,
        email: user?.email,
      },
    });

    if (result.error) {
      removeLoader();
      alert.show(result.error.message, {
        type: "error",
      });
    } else {
      try {
        if (localStorage.getItem("token")) {
          setAuthToken(localStorage.getItem("token"));
        }
        const config = {
          headers: {
            "Content-Type": "application/json",
          },
        };
        const body = JSON.stringify({
          stripe_product_code: stripeCodePlanId,
          payment_method: result.paymentMethod.id,
        });
        const response = await axios.post(
          "/api/v1/stripe/create-subscription",
          body,
          config
        );
        const { data } = response;
        const confirmPayment = await stripe?.confirmCardPayment(
          data.clientsecret
        );
        if (confirmPayment?.error) {
          alert.show(confirmPayment.error.message, { type: "error" });
        } else {
          alert.show("Subscription completed Successfully", {
            type: "success",
          });
        }
        removeLoader();
        history.push("/dashboard/plans/payment");
      } catch (error) {
        removeLoader();
        console.log(error);
        alert.show(error.message, {
          type: "error",
        });
      }
    }
  };

  return (
    <Container>
      <Row>
        <Col md="3"></Col>
        <Col md="6">
          <Card className="shadow card-style">
            <h3 className="payment-header">Complete Your Subscription</h3>
            <p className="payment-text">
              Enter Your Payment Details to checkout and complete your
              subscription.
            </p>
            <CardBody>
              <CardInput />
              <Button
                onClick={handleSubscibeButtonClick}
                block
                className="mt-4 modal-btn-style"
              >
                Subscribe
              </Button>
            </CardBody>
          </Card>
        </Col>
        <Col md="3"></Col>
      </Row>
    </Container>
  );
};

const mapStateToProps = (state) => ({
  user: state.auth.user,
});

const mapDispatchToProps = (dispatch) => ({
  showLoader: () => dispatch(startLoading()),
  removeLoader: () => dispatch(stopLoading()),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(StripeCheckoutIntergrationComponent);
