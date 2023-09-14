import React from "react";
import { Modal, Button } from "reactstrap";
import { Link } from "react-router-dom";

export const TransactionSuccessModal = ({
  isTransactionModalOpen,
  toggleTransactionModal,
  schoolName,
  purchasedCourses,
  theme,
  successUrlRedirect,
}) => {
  return (
    <>
      <Modal
        className="modal-dialog-centered"
        contentClassName="transaction-success-custom-modal"
        size="md"
        isOpen={isTransactionModalOpen}
        toggle={toggleTransactionModal}
      >
        <div
          style={{
            background: theme.themestyles.primarybackgroundcolor,
            height: "650px",
            textAlign: "center",
            borderRadius: "30px",
          }}
          className="modal-body"
        >
          <div className="modal-success-body-contents">
            <div className="success-icon">
              <i className="far fa-check-circle"></i>
            </div>
            <h3
              style={{
                color: theme.themestyles.primarytextcolor,
                fontSize: "20px",
              }}
              className="modal-success-message"
            >
              You Have Successfully bought the following Course(s) or Product(s)
            </h3>
            <div className="bought-courses-container">
              {purchasedCourses.map((item) => {
                return (
                  <div key={item.itemId} className="purchased-course-item">
                    <div className="purchased-course-item-img-contain">
                      <img
                        src={item.itemImg}
                        alt="purchased course illustrator"
                      />
                    </div>
                    <p
                      style={{
                        color: theme.themestyles.primarytextcolor,
                      }}
                      className="purchased-course-item-name"
                    >
                      {item.itemName}
                    </p>
                  </div>
                );
              })}
            </div>
            <Button
              style={{
                backgroundColor: theme.themestyles.buttonbackgroundcolor,
                color: theme.themestyles.buttontextcolor,
              }}
              className="continue-button"
              block
              tag={Link}
              to={successUrlRedirect}
            >
              Continue
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default TransactionSuccessModal;
