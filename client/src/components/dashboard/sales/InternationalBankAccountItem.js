import React, { useState } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
import { startLoading, stopLoading } from "../../../actions/appLoading";
import { Modal, Button } from "reactstrap";
import { useAlert } from "react-alert";
import USDFlagIcon from "../../../images/usd-flag.svg";
import setAuthToken from "../../../utilities/setAuthToken";

const InternationalBankAccountItem = ({
  account,
  deleteUserInternationalBankAccountItem,
}) => {
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const dispatch = useDispatch();
  const alert = useAlert();

  const handleAccountDeleteClick = async (id) => {
    if (localStorage.getItem("token")) {
      setAuthToken(localStorage.getItem("token"));
    }
    try {
      dispatch(startLoading());
      const response = await axios.delete(`/api/v1/bank/international/${id}`);
      alert.show(response.data.msg, {
        type: "success",
      });
      deleteUserInternationalBankAccountItem(id);
      dispatch(stopLoading());
    } catch (error) {
      dispatch(stopLoading());
      alert.show("Error Deleting Account", {
        type: "error",
      });
      console.log(error);
    }
  };

  return (
    <>
      <div className="international-bank-details__item">
        <div className="account-name__summary">
          {`${account.accountholdername
            .split(" ")[0]
            .substr(0, 1)} ${account.accountholdername
            .split(" ")[1]
            .substr(0, 1)}`}
          <img src={USDFlagIcon} alt="..." className="account-item-img-type" />
        </div>
        <div className="account-details__delete-controls">
          <div className="account-details-info">
            <p className="account-name">{account.accountholdername}</p>
            <p className="account-summary">{`${
              account.accountCurrencyType
            } accound ending in ${account.accountnumber.substr(
              account.accountnumber.length - 4
            )}`}</p>
          </div>
          <div
            onClick={() => setShowDeleteConfirmation(true)}
            className="account-item-delete__btn"
          >
            <i className="fas fa-trash-alt"></i>
          </div>
        </div>
      </div>
      <Modal centered isOpen={showDeleteConfirmation}>
        <div className="modal-header delete-account-header">
          <h3>Delete Account</h3>
          <div
            onClick={() => setShowDeleteConfirmation(false)}
            className="close-icon"
          >
            <i className="fas fa-times"></i>
          </div>
        </div>
        <div className="modal-body">
          <p className="text-center">
            Are you sure you want to delete this account?
          </p>
        </div>
        <div className="modal-footer">
          <Button
            onClick={() => setShowDeleteConfirmation(false)}
            className="modal-btn-style-outline"
          >
            Cancel
          </Button>
          <Button
            onClick={() => handleAccountDeleteClick(account._id)}
            className="modal-btn-style"
          >
            Confirm
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default InternationalBankAccountItem;
