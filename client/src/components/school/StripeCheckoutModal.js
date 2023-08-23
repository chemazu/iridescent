import React, { useState } from "react";
import { Modal, Button } from "reactstrap";
import { useStripe, useElements } from "@stripe/react-stripe-js";
import { PaymentElement } from "@stripe/react-stripe-js";
import { useAlert } from "react-alert";

const StripeCheckoutModal = ({
  isOpen,
  closeStripeCheckoutModal,
  theme,
  handlePostSuccessfullTransactionFeedback,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const stripe = useStripe();
  const elements = useElements();
  const alert = useAlert();

  const handlePaymentClickHandler = async () => {
    if (!stripe || !elements) {
      return;
    }
    setIsProcessing(true);
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
      confirmParams: {
        return_url: `${window.location.href}`,
      },
    });
    if (error) {
      console.log(error);
      setIsProcessing();
      return alert.show(error.message, {
        type: "error",
      });
    } else if (paymentIntent && paymentIntent.status === "succeeded") {
      alert.show("Payment status" + paymentIntent.status, {
        type: paymentIntent.status === "succeeded" ? "success" : "info",
      });
      handlePostSuccessfullTransactionFeedback();
    } else {
      alert.show("Unexpected Error.");
    }
    setIsProcessing(false);
    closeStripeCheckoutModal();
  };

  return (
    <Modal centered isOpen={isOpen}>
      <div className="modal-header">
        <h3 className="modal-header-title">Complete your Payments</h3>
        <div
          className="modal-header-close__btn"
          onClick={closeStripeCheckoutModal}
        >
          <i className="fas fa-times"></i>
        </div>
      </div>
      <div className="modal-body">
        <PaymentElement />
      </div>
      <div className="modal-footer">
        <Button
          onClick={handlePaymentClickHandler}
          disabled={isProcessing}
          style={{
            backgroundColor: theme.themestyles.buttonbackgroundcolor,
            color: theme.themestyles.buttontextcolor,
          }}
          block
        >
          {isProcessing ? "Processing" : "Pay now"}
        </Button>
      </div>
    </Modal>
  );
};

export default StripeCheckoutModal;