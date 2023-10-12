import React from "react";
import { CardElement } from "@stripe/react-stripe-js";

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: "#476EFA",
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: "antialiased",
      fontSize: "16px",
      "::placeholder": {
        color: "#aab7c4",
      },
    },
    invalid: {
      color: "#fa755a",
      iconColor: "#fa755a",
    },
  },
};

const CardInput = () => {
  return (
    <>
      <label
        className="mb-3"
        style={{
          fontSize: "16px",
          color: "#FF3100",
          textTransform: "capitalize",
          fontWeight: "600",
        }}
      >
        Card Details
      </label>
      <CardElement options={CARD_ELEMENT_OPTIONS} />
    </>
  );
};

export default CardInput;
