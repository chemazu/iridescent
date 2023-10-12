import React from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { Modal, Button } from "reactstrap";
import { REMOVE_PAYMENT_MODAL } from "../../actions/types";
import "../../custom-styles/paymentmodal.css";

import TuturlyLogo from "../../images/tuturlyPNG.png";
// import DiamondImage from "../../images/green-diamond.png";

const PaymentModal = ({ loading, closeModal, history }) => {
  const goToPaymentPage = () => {
    closeModal();
    history.push("/dashboard/plans/payment");
  };

  return (
    <>
      <div className="payment-modal">
        <Modal className="modal-dialog-centered app-loader" isOpen={loading}>
          <div className="modal-close-btn__container" onClick={closeModal}>
            <div className="modal-btn-close">
              <i
                style={{
                  fontSize: "25px",
                }}
                className="fas fa-times"
              ></i>
            </div>
          </div>
          <div className="modal-content__container">
            <div className="logo-container">
              <img src={TuturlyLogo} alt="..." className="img-fluid" />
            </div>
            <h5 className="title-text">Exclusive Plans</h5>
          </div>
          <br />
          <div className="payment-message">
            <p>
              Your current plan does not allow you to use this resource, Please
              click on upgrade plan to continue using Tuturly's features
            </p>
          </div>
          <div
            style={{
              margin: "30px",
            }}
            className="upgrade-plan-container"
          >
            <Button
              className="modal-btn-style"
              style={{
                fontWeight: "650",
                padding: "12px 0",
              }}
              onClick={goToPaymentPage}
              block
            >
              Ugrade Plan
            </Button>
          </div>
        </Modal>
      </div>
    </>
  );
};

const mapStateToProps = (state) => ({
  loading: state.paymentmodal.isLoading,
});

const mapDispatchToProps = (dispatch) => ({
  closeModal: () => dispatch({ type: REMOVE_PAYMENT_MODAL }),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(PaymentModal));
