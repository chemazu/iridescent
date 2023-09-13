import React from "react";
// @ts-ignore
import classes from "./CreditCards.module.css";
function CardCapture({ last4, expiry, brand }) {
  return (
    <div
      className={[
        classes["credit-card"],
        classes[brand],
        classes["selectable"],
      ].join(" ")}
    >
      <div className={classes["credit-card-last4"]}>{last4}</div>
      <div className={classes["credit-card-expiry"]}>{expiry}</div>
    </div>
  );
}

export default CardCapture;
