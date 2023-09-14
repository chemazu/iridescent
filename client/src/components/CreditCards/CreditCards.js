import React from "react";
// @ts-ignore
import CardCapture from "./CardCapture";
function CreditCards({ last4, expiry, brand }) {
  return <CardCapture last4={last4} expiry={expiry} brand={brand} />;
}

export default CreditCards;
