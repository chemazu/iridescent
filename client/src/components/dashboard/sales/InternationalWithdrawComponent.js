import React, { useEffect, useState } from "react";
import axios from "axios";
import { FormGroup, Input, Label, Button } from "reactstrap";
import { useAlert } from "react-alert";
import CurrencyFormat from "react-currency-format";
import flagIcon from "../../../images/usd-flag.svg";
import setAuthToken from "../../../utilities/setAuthToken";
import WithdrawalLoadingModal from "./WithdrawalLoadingModal";
import roundToTwoDecimalPlaces from "../../../utilities/roundToTwoDecimalPlaces";

const InternationalWithdrawComponent = ({
  tabs,
  toggleWithdrawModal,
  getPaymentPageContents,
  withdrawableBalance,
  userInternationalBankAccount,
  userInternationalAccountLoading,
}) => {
  const tuturlyTransactionFee = 2.4;
  const alert = useAlert();
  const [amount, setAmount] = useState("");
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [actualPayout, setActualPayout] = useState(0);
  const [withdrawalCharge, setWithdrawalCharge] = useState(0);
  const [quoteBodyData, setQuoteBodyData] = useState(null);
  const [quoteDetails, setQuoteDetails] = useState(null);
  const [generatingQuoteLoad, setGeneratingQuoteLoad] = useState(false);
  const [amountUsedToGenerateQuote, setAmountUsedToGenerateQuote] =
    useState("");
  const [accountIdUsedToGenerateQuote, setAccountIdUsedToGenerateQuote] =
    useState(null);
  const [
    withdrawalTransactionLoadingModal,
    setWithDrawaltransactionLoadingModal,
  ] = useState(false);

  // prettier-ignore
  const handleFeeRegerationMessageDisplay = () => {
    if((quoteDetails !== null && amount.length > 0 && selectedAccount !== null) && (parseFloat(amount) !== parseFloat(amountUsedToGenerateQuote) || selectedAccount._id !== accountIdUsedToGenerateQuote)){
      return true
    }
  }
  // prettier-ignore

  const handleAmountChangeHandler = (e) => {
    if (!e.target.value || e.target.value.match(/^\d{1,}(\.\d{0,2})?$/)) {
      setAmount(e.target.value);
    }
  };

  const resetWithrawalInputsToDefault = () => {
    setAmount("");
    setSelectedAccount(null);
    setActualPayout(0);
    setWithdrawalCharge(0);
    setQuoteBodyData(null);
    setQuoteDetails(null);
    setAmountUsedToGenerateQuote("");
    setAccountIdUsedToGenerateQuote(null);
  };

  const toggleWithdrawalLoadingTransactionModal = () =>
    setWithDrawaltransactionLoadingModal(!withdrawalTransactionLoadingModal);

  const getTransactionQuote = async () => {
    if (localStorage.getItem("token")) {
      setAuthToken(localStorage.getItem("token"));
    }
    if (amount.length === 0) {
      return alert.show("amount not specified");
    }
    if (selectedAccount === null) {
      return alert.show("Please select an account to continue");
    }
    try {
      setGeneratingQuoteLoad(true);
      const amountToPay = parseFloat(amount) - tuturlyTransactionFee;
      const url = `/api/v1/bank/international/transfer/quote/${selectedAccount._id}?amount=${amountToPay}`;
      const res = await axios.get(url);
      setQuoteDetails(res.data.paymentOptions[0]);
      setQuoteBodyData(res.data);
      setGeneratingQuoteLoad(false);
      setAmountUsedToGenerateQuote(amount);
      setAccountIdUsedToGenerateQuote(selectedAccount._id);
    } catch (error) {
      setGeneratingQuoteLoad(false);
      alert.show("Error generating quote", {
        type: "error",
      });
      console.error(error);
    }
  };

  const handleDollarAccountWithdraw = async () => {
    setWithDrawaltransactionLoadingModal(true);
    if (localStorage.getItem("token")) {
      setAuthToken(localStorage.getItem("token"));
    }
    try {
      const url = `/api/v1/bank/international/transfer/${quoteBodyData.id}/${selectedAccount._id}`;
      // eslint-disable-next-line no-unused-vars
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };
      const body = JSON.stringify({
        amount: amount,
        payout: actualPayout,
      });
      const res = await axios.post(url, body, config);
      alert.show(res.data.msg, {
        type: "success",
      });
      resetWithrawalInputsToDefault();
      setWithDrawaltransactionLoadingModal(false);
      toggleWithdrawModal();
      getPaymentPageContents();
    } catch (error) {
      setWithDrawaltransactionLoadingModal(false);
      if (error.response.data.error) {
        resetWithrawalInputsToDefault();
        toggleWithdrawModal();
        alert.show(
          "Your withdrawal cannot be completed at this time, Please Try Later.",
          {
            type: "error",
          }
        );
      } else if (error.response.data.errors) {
        alert.show(
          `${error.response.data.errors[0].message}, Please Refresh.`,
          {
            type: "error",
          }
        );
      }
    }
  };

  useEffect(() => {
    if (quoteDetails) {
      const transactionFee = quoteDetails?.fee?.total;
      setActualPayout(
        parseFloat(amount) - (transactionFee + tuturlyTransactionFee)
      );
      setWithdrawalCharge(transactionFee + tuturlyTransactionFee);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quoteDetails]);

  return (
    <>
      <FormGroup className="withdrawal-modal__formgroup">
        <Label>Withdrawal Amount in USD(&#36;)</Label>
        <Input
          value={amount}
          type="text"
          onChange={(e) => handleAmountChangeHandler(e)}
          placeholder="e.g 1,500"
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
        <Label>Select Bank Account To Pay Into!</Label>
        <div className="select-account-list__container">
          {userInternationalAccountLoading ? (
            <p className="text-center mt-2 mb-2">Loading...</p>
          ) : (
            <>
              {userInternationalBankAccount?.length === 0 ? (
                <p className="validation-error-text mb-1 mt-1">
                  No Valid Accounts Found. Use The "Bank Details" Tab to Add A
                  New Back Account Detail.
                </p>
              ) : (
                <>
                  {userInternationalBankAccount?.map((account) => (
                    <div
                      onClick={() => setSelectedAccount(account)}
                      key={account?._id}
                      className="international-account-modal-item"
                    >
                      <div className="account-name__selector-indicator">
                        <p className="account-item-name">
                          {account.accountholdername}
                        </p>
                        <div
                          className={`account-selector-indicator ${
                            selectedAccount !== null &&
                            selectedAccount._id === account._id &&
                            "account-active"
                          }`}
                        ></div>
                      </div>

                      <div className="account-more__details">
                        <p className="account-item-number">
                          {account.accountnumber}
                        </p>
                        <div className="account-label">
                          <p className="account-item-type">
                            {account.accountspecificationtype === "aba"
                              ? "routing number"
                              : "swift code"}{" "}
                            :
                          </p>
                          <p className="account-item-code">
                            {account.accountspecificationtype === "aba"
                              ? account.routingcode
                              : account.swiftcode}
                          </p>
                          <div className="account-item_icon">
                            <img src={flagIcon} alt="..." />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </>
          )}
        </div>
      </FormGroup>
      <FormGroup>
        <Label>Withdrawal Quote Must Be Generated</Label>
        <Button
          onClick={getTransactionQuote}
          disabled={generatingQuoteLoad}
          block
          className="modal-btn-style-outline mt-1"
        >
          Get Quote
        </Button>
      </FormGroup>
      <FormGroup className="withdrawal-modal__formgroup">
        <Label>Transfer Fess</Label> <br />
        <small>
          To complete your withdrawal, Specify the amount you wish to withdraw
          and choose the recipient bank.
          <span
            className={`${generatingQuoteLoad && "spinner-icon"}`}
            style={{
              float: "right",
              marginRight: "5px",
              cursor: "pointer",
              marginTop: "5px",
            }}
          >
            <i className="fas fa-sync"></i>
          </span>
        </small>
        {handleFeeRegerationMessageDisplay() && (
          <>
            {" "}
            <br />
            <small className="modal-error-color">
              You seem to have updated your recipient account or amount since
              you last generated a Transaction Fee. Please Click the Button
              above to generate the corresponding withdrawal fee
            </small>
          </>
        )}
      </FormGroup>
      <FormGroup className="formgroup-label__style">
        <Label>Withdrawal Charge</Label>
        <p>
          <CurrencyFormat
            value={roundToTwoDecimalPlaces(withdrawalCharge)}
            prefix={"$"}
            displayType="text"
            thousandSeparator={true}
          />
        </p>
      </FormGroup>
      <FormGroup className="formgroup-label__style">
        <Label>Actual Payout</Label>
        <p>
          <CurrencyFormat
            value={roundToTwoDecimalPlaces(actualPayout)}
            prefix={"$"}
            displayType="text"
            thousandSeparator={true}
          />
        </p>
      </FormGroup>
      {quoteDetails !== null && (
        <FormGroup className="formgroup-label__style">
          <Label>Estimated date of arrival: </Label>
          <p>
            <small style={{ textTransform: "capitalize" }}>
              {quoteDetails.formattedEstimatedDelivery}
            </small>
          </p>
        </FormGroup>
      )}
      <Button
        onClick={handleDollarAccountWithdraw}
        disabled={
          parseInt(amount) === 0 ||
          amount.length === 0 ||
          amount > withdrawableBalance ||
          amount <= 1 ||
          quoteDetails === null ||
          handleFeeRegerationMessageDisplay()
        }
        block
        className="modal-btn-style mb-2"
      >
        Withdraw
      </Button>
      <WithdrawalLoadingModal
        withdrawalTransactionLoadingModal={withdrawalTransactionLoadingModal}
        toggleWithdrawalTransactionModal={
          toggleWithdrawalLoadingTransactionModal
        }
      />
    </>
  );
};

export default InternationalWithdrawComponent;
