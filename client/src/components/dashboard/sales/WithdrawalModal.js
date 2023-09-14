import React, { useState, useEffect } from "react";
import { Modal, Button, FormGroup, Input, Label } from "reactstrap";
import axios from "axios";
import { useAlert } from "react-alert";
import CurrencyFormat from "react-currency-format";
import setAuthToken from "../../../utilities/setAuthToken";
import WithdrawalLoadingModal from "./WithdrawalLoadingModal";

const WithdrawalModal = ({
  displayWithdrawalModal,
  toggleWithdrawModal,
  withdrawableBalance,
  getPaymentPageContents,
  userBankAccounts,
  userAccountLoading,
}) => {
  const [amount, setAmount] = useState("");
  const [actualPayout, setActualPayout] = useState(0);
  const [transferCharge, setTransferCharge] = useState(0);
  const [selectedBankForWithdrawal, setSelectedBankForWithdrawal] =
    useState(null);
  const [
    withdrawalTransactionLoadingModal,
    setWithDrawaltransactionLoadingModal,
  ] = useState(false);
  const alert = useAlert();

  const handleAmountChangeHandler = (e) => {
    if (!e.target.value || e.target.value.match(/^\d{1,}(\.\d{0,2})?$/)) {
      setAmount(e.target.value);
    }
  };

  const withdrawClickHandler = () => {
    handleWithdrawalProcess();
  };

  const toggleWithdrawalLoadingTransactionModal = () =>
    setWithDrawaltransactionLoadingModal(!withdrawalTransactionLoadingModal);

  const handleSelectBankAccountForWithdrawal = (id) => {
    setSelectedBankForWithdrawal(id);
  };

  const handleWithdrawalProcess = async () => {
    try {
      setWithDrawaltransactionLoadingModal(true);
      if (localStorage.getItem("token")) {
        setAuthToken(localStorage.getItem("token"));
      }
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };
      const body = JSON.stringify({
        accountid: selectedBankForWithdrawal,
        amount: amount,
        actualPayout: actualPayout,
      });

      await axios.post("/api/v1/wallet/withdraw", body, config);

      // if(res.data.status === true){
      alert.show(
        "Withdrawal Process completed successfully, Your funds are on the way to your Account!",
        {
          type: "success",
        }
      );
      // // } else {
      //     alert.show('withdrawal process cannot be completed at this time, please try again later', {
      //         type:'error'
      //     })
      // }
      toggleWithdrawModal();
      setAmount("");
      setSelectedBankForWithdrawal(null);
      setWithDrawaltransactionLoadingModal(false);
      // window.location.reload(true)
      getPaymentPageContents();
    } catch (error) {
      setWithDrawaltransactionLoadingModal(false);
      console.log(error);
      if (error.response.data.errors) {
        error?.response?.data?.errors.forEach((err) => {
          alert.show(err.msg, {
            type: "error",
          });
        });
      } else {
        alert.show(error?.response.data.message, {
          type: "error",
        });
      }
    }
  };

  useEffect(() => {
    if (amount.length > 0) {
      if (parseInt(amount) < 5000) {
        setTransferCharge(10 * 2);
      } else if (parseInt(amount) > 5000 && parseInt(amount) < 49900) {
        setTransferCharge(25 * 2);
      } else if (parseInt(amount) > 50000) {
        setTransferCharge(50 * 2);
      }
    } else {
      setTransferCharge(0);
    }
  }, [amount]);

  useEffect(() => {
    setActualPayout(amount - transferCharge);
  }, [transferCharge, amount]);

  return (
    <>
      <Modal
        isOpen={displayWithdrawalModal}
        className="modal-dialog-centered"
        size="md"
      >
        <div className="modal-header payment-modal__header">
          <h3>Complete Withdrawal Process</h3>
          <div onClick={toggleWithdrawModal} className="header-close-icon">
            <i className="fas fa-times"></i>
          </div>
        </div>

        <div className="modal-body">
          <FormGroup className="withdrawal-modal__formgroup">
            <Label>Withdrawal Amount</Label>
            <Input
              value={amount}
              type="text"
              onChange={(e) => handleAmountChangeHandler(e)}
              placeholder="e.g 1,500"
            ></Input>
            {amount > 0 && (
              <>
                {(amount.length === 0 || parseInt(amount) === 0) && (
                  <p className="validation-error-text">
                    invalid withdrawal amount
                  </p>
                )}
                {amount > withdrawableBalance && (
                  <p className="validation-error-text">
                    withdrawal amount exceeds current available balance.
                  </p>
                )}
                {amount <= 100 && (
                  <p className="validation-error-text">
                    withdrawal amount lower than minimum allowed for
                    withdrawals.
                  </p>
                )}
              </>
            )}
          </FormGroup>
          <FormGroup className="withdrawal-modal__formgroup">
            <Label>Select Bank Account To Use!</Label>
            <div className="select-account-list__container">
              {userAccountLoading ? (
                <p className="text-center mt-2 mb-2">Loading...</p>
              ) : (
                <>
                  {userBankAccounts.length === 0 ? (
                    <p className="validation-error-text mb-1 mt-1">
                      No Valid Accounts Found. Use The "Bank Details" Tab to Add
                      A New Back Account Detail.
                    </p>
                  ) : (
                    <>
                      {userBankAccounts.map((account) => (
                        <div
                          onClick={(e) =>
                            handleSelectBankAccountForWithdrawal(account._id)
                          }
                          key={account._id}
                          className="modal-account-item"
                        >
                          <div className="name-indicator">
                            <p className="account-name">
                              {account.accountname}
                            </p>
                            <div
                              className={`${
                                selectedBankForWithdrawal === account._id
                                  ? "account-selected-indicator_on"
                                  : "account-selected-indicator_off"
                              }`}
                            ></div>
                          </div>
                          <div className="account-details">
                            <p className="account-number">
                              {account.accountnumber}
                            </p>
                            <p className="bank-name">{account.bankname}</p>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </>
              )}
            </div>
          </FormGroup>
          <FormGroup className="formgroup-label__style">
            <Label>Withdrawal Charge</Label>
            <p>
              <CurrencyFormat
                value={transferCharge}
                prefix={"#"}
                displayType="text"
                thousandSeparator={true}
              />
            </p>
          </FormGroup>
          <FormGroup className="formgroup-label__style">
            <Label>Actual Payout</Label>
            <p>
              <CurrencyFormat
                value={actualPayout}
                prefix={"#"}
                displayType="text"
                thousandSeparator={true}
              />
            </p>
          </FormGroup>
        </div>

        <div className="modal-footer">
          <Button
            block
            className="modal-btn-style-outline"
            onClick={toggleWithdrawModal}
          >
            Cancel
          </Button>
          <Button
            onClick={withdrawClickHandler}
            disabled={
              parseInt(amount) === 0 ||
              amount.length === 0 ||
              amount > withdrawableBalance ||
              selectedBankForWithdrawal === null ||
              amount <= 100
            }
            block
            className="modal-btn-style mb-2"
          >
            Confirm
          </Button>
        </div>
      </Modal>
      <WithdrawalLoadingModal
        withdrawalTransactionLoadingModal={withdrawalTransactionLoadingModal}
        toggleWithdrawalLoadingTransactionModal={
          toggleWithdrawalLoadingTransactionModal
        }
      />
    </>
  );
};

export default WithdrawalModal;
