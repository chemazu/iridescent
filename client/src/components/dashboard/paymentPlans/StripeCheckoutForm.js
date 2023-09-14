import React from "react";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";

const StripeCheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();

  return <div></div>;
};

export default StripeCheckoutForm;