import React, { useState, useEffect } from "react";
import axios from "axios";
import { FormGroup, Label, Input, Button } from "reactstrap";
import { useAlert } from "react-alert";
import CurrencyFormat from "react-currency-format";
import setAuthToken from "../../../utilities/setAuthToken";
import WithdrawalLoadingModal from "./WithdrawalLoadingModal";

const LocalWithdrawalComponent = ({
  toggleWithdrawModal,
  getPaymentPageContents,
  withdrawableBalance,
  userBankAccounts,
  userAccountLoading,
}) => {
  const [amount, setAmount] = useState("");
  const [amountInNaira, setAmountInNaira] = useState(0);
  const [actualPayout, setActualPayout] = useState(0);
  const [payoutInDollar, setActualPayoutInDollar] = useState(0);
  const [transferCharge, setTransferCharge] = useState(0);
  const [selectedBankForWithdrawal, setSelectedBankForWithdrawal] =
    useState(null);
  const [
    withdrawalTransactionLoadingModal,
    setWithDrawaltransactionLoadingModal,
  ] = useState(false);
  const [nairaTransactionPresentLoading, setNairaTransactionPresetLoading] =
    useState(false);
  const alert = useAlert();

  const handleAmountChangeHandler = (e) => {
    if (!e.target.value || e.target.value.match(/^\d{1,}(\.\d{0,2})?$/)) {
      setAmount(e.target.value);
    }
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
        actualPayoutInDollar: payoutInDollar,
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

  const withdrawClickHandler = () => {
    handleWithdrawalProcess();
  };

  const getAmountInNairaFromExchangeRate = (exchangeRateData, amount) => {
    const naira =
      parseFloat(exchangeRateData.exchangeRateAmountToNaira) *
      parseFloat(amount);
    return naira;
  };

  const getAmountInDollarFromExchangeRate = (exchangeRateData, amount) => {
    const dollar =
      parseFloat(amount) /
      parseFloat(exchangeRateData.exchangeRateAmountToNaira);
    return dollar;
  };

  const determineTransferCharge = (amount) => {
    if (amount > 0) {
      if (parseInt(amount) < 5000) {
        return 10 * 2;
      } else if (parseInt(amount) > 5000 && parseInt(amount) < 49900) {
        return 25 * 2;
      } else if (parseInt(amount) > 50000) {
        return 50 * 2;
      }
    } else {
      return 0;
    }
  };

  const getNairaPaymentsPresent = async (amount, currencyName) => {
    try {
      setNairaTransactionPresetLoading(true);
      const exchangeRateResponse = await axios.get(
        `/api/v1/exchangerate/${currencyName}`
      );
      const amountToWithDrawInNaira = getAmountInNairaFromExchangeRate(
        exchangeRateResponse.data,
        amount
      );
      const transferChargeAPI = determineTransferCharge(
        amountToWithDrawInNaira
      );
      // the transfer fee in dollar
      const withdrawalFeeInDollar = getAmountInDollarFromExchangeRate(
        exchangeRateResponse.data,
        transferCharge
      );
      setTransferCharge(transferChargeAPI);
      setActualPayout(amountToWithDrawInNaira - transferChargeAPI);
      setAmountInNaira(amountInNaira);
      setActualPayoutInDollar(amount - withdrawalFeeInDollar);
      setNairaTransactionPresetLoading(false);
    } catch (error) {
      console.log(error);
      setNairaTransactionPresetLoading(false);
      alert.show(error, {
        type: "error",
      });
    }
  };

  useEffect(() => {
    if (amount.length > 0) {
      getNairaPaymentsPresent(amount, "usd");
    } else {
      getNairaPaymentsPresent(0, "usd");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount]);

  return (
    <>
      <FormGroup className="withdrawal-modal__formgroup">
        <Label>Withdrawal Amount in Dollar(&#x24;)</Label>
        <Input
          value={amount}
          type="text"
          onChange={(e) => handleAmountChangeHandler(e)}
          placeholder="e.g 10"
        ></Input>
        {amount > 0 && (
          <>
            {(amount.length === 0 || parseInt(amount) === 0) && (
              <p className="validation-error-text">invalid withdrawal amount</p>
            )}
            {amount > withdrawableBalance && (
              <p className="validation-error-text">
                withdrawal amount exceeds current available balance.
              </p>
            )}
            {amount <= 1 && (
              <p className="validation-error-text">
                withdrawal amount lower than minimum allowed for withdrawals.
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
                  No Valid Accounts Found. Use The "Bank Details" Tab to Add A
                  New Back Account Detail.
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
                        <p className="account-name">{account.accountname}</p>
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
      <small>Transaction Summary.</small>
      {nairaTransactionPresentLoading ? (
        <div className="spinner-icon text-center mt-2 mb-2">
          <i className="fas fa-sync"></i>
        </div>
      ) : (
        <>
          <FormGroup className="formgroup-label__style">
            <Label>Withdrawal Charge (Naira)</Label>
            <p>
              &#8358;
              <CurrencyFormat
                value={transferCharge}
                displayType="text"
                thousandSeparator={true}
              />
            </p>
          </FormGroup>
          <FormGroup className="formgroup-label__style">
            <Label>Actual Payout (Naira)</Label>
            <p>
              &#8358;
              <CurrencyFormat
                value={actualPayout}
                displayType="text"
                thousandSeparator={true}
              />
            </p>
          </FormGroup>
        </>
      )}
      <br />
      <Button
        onClick={withdrawClickHandler}
        disabled={
          parseInt(amount) === 0 ||
          amount.length === 0 ||
          amount > withdrawableBalance ||
          selectedBankForWithdrawal === null ||
          amount <= 1
        }
        block
        className="modal-btn-style mb-2"
      >
        Withdraw
      </Button>
      <WithdrawalLoadingModal
        withdrawalTransactionLoadingModal={withdrawalTransactionLoadingModal}
        toggleWithdrawalLoadingTransactionModal={
          toggleWithdrawalLoadingTransactionModal
        }
      />
    </>
  );
};

export default LocalWithdrawalComponent;
