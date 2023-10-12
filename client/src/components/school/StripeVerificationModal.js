import React, { useEffect } from "react";
import { useStripe } from "@stripe/react-stripe-js";
import { Modal } from "reactstrap";
import { useAlert } from "react-alert";
import { useHistory } from "react-router-dom";

const StripeVerificationModal = ({
  isOpen,
  clientSecret,
  closeModalDialogForStripeTrannsactionVerification,
  handlePostSuccessfullTransactionFeedback,
}) => {
  const stripe = useStripe();
  const alert = useAlert();
  const history = useHistory();

  const handlePaymentIntentVerification = () => {
    if (!stripe) {
      return;
    }

    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      // Inspect the PaymentIntent `status` to indicate the status of the payment
      // to your customer.
      //
      // Some payment methods will [immediately succeed or fail][0] upon
      // confirmation, while others will first enter a `processing` state.
      //
      // [0]: https://stripe.com/docs/payments/payment-methods#payment-notification
      switch (paymentIntent.status) {
        case "succeeded":
          alert.show("Success! Payment received.", {
            type: "success",
          });
          closeModalDialogForStripeTrannsactionVerification();
          history.push("/cart");
          handlePostSuccessfullTransactionFeedback();
          break;

        case "processing":
          alert.show(
            "Payment processing. We'll update you when payment is received.",
            {
              type: "info",
            }
          );
          closeModalDialogForStripeTrannsactionVerification();
          break;
        default:
          alert.show("Something went wrong.", {
            type: "info",
          });
          closeModalDialogForStripeTrannsactionVerification();
          break;
      }
    });
  };

  useEffect(() => {
    handlePaymentIntentVerification();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stripe]);

  return (
    <>
      <Modal centered isOpen={isOpen}>
        <div className="modal-header">
          <h3 className="modal-header-title">Verifying Transaction</h3>
        </div>
        <div className="modal-body">
          <div className="transaction-loading-container">
            <p className="text-center lead">Please Wait...</p>
            <div
              className="spinner-icon"
              style={{
                float: "right",
                marginRight: "5px",
                marginTop: "5px",
              }}
            >
              <i className="fas fa-sync"></i>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default StripeVerificationModal;
