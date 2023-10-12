import React, { useState } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
import { useAlert } from "react-alert";
import {
  Form,
  Modal,
  ModalBody,
  FormGroup,
  Label,
  Input,
  ButtonGroup,
  Button,
} from "reactstrap";
import formCoutries from "./countriesList";
import formStates from "./unitedStatesListOfStates";
import setAuthToken from "../../../utilities/setAuthToken";
import { startLoading, stopLoading } from "../../../actions/appLoading";

const AddInternationalBankAccountModal = ({
  openModal,
  toggleModal,
  updateUserInternationalBankAccountList,
}) => {
  // account type where 1 stands for ACH and 2 stands for Swift
  const [accountTypeSwitcher, setAccountTypeSwitcher] = useState(1);
  const alert = useAlert();
  const dispatch = useDispatch();
  const [addAccountFormInput, setAddAccountFormInput] = useState({
    accountHolderName: "",
    accountNumber: "",
    legalType: "",
    swiftCode: "",
    routingNumber: "",
    accountType: "",
    country: "",
    state: "",
    city: "",
    postCode: "",
    firstLine: "",
  });

  const routingNumberRegex = new RegExp("^\\d{9}$");
  const swiftCodeRegex = new RegExp(
    "^[a-zA-Z]{6}(([a-zA-Z0-9]{2})|([a-zA-Z0-9]{5}))$"
  );

  const {
    accountHolderName,
    accountNumber,
    legalType,
    swiftCode,
    routingNumber,
    accountType,
    country,
    city,
    state,
    postCode,
    firstLine,
  } = addAccountFormInput;

  const updateFormInputValue = (e) => {
    setAddAccountFormInput({
      ...addAccountFormInput,
      [e.target.name]: e.target.value,
    });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (accountTypeSwitcher === 1) {
      // if account type is routingNumber
      // call function to add routingNumber account
      handleAddRoutingNumberTypeAccount();
    } else {
      // else call function to add swiftcode account
      handleAddSwiftCodeTypeAccount();
    }
  };

  const resetForm = () =>
    setAddAccountFormInput({
      accountHolderName: "",
      accountNumber: "",
      legalType: "",
      swiftCode: "",
      accountType: "",
      routingNumber: "",
      country: "",
      city: "",
      state: "",
      firstLine: "",
      postCode: "",
    });

  const handleAddRoutingNumberTypeAccount = async () => {
    try {
      if (localStorage.getItem("token")) {
        setAuthToken(localStorage.getItem("token"));
      }
      dispatch(startLoading());

      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };
      const data = {
        accountHolderName: accountHolderName,
        accountNumber: accountNumber,
        legalType: legalType,
        routingNumber: routingNumber,
        accountType: accountType,
        country: country,
        city: city,
        state: state,
        postCode: postCode,
        firstLine: firstLine,
      };

      if (data.country.toLocaleLowerCase() !== "us") {
        data["state"] = "";
      }

      const body = JSON.stringify(data);
      const res = await axios.post(
        "/api/v1/bank/international/usd/within",
        body,
        config
      );
      alert.show("Account details saved successfully", {
        type: "success",
      });
      updateUserInternationalBankAccountList(res.data);
      dispatch(stopLoading());
      resetForm();
      toggleModal();
    } catch (error) {
      dispatch(stopLoading());
      alert.show("error adding account", { type: "error" });
      console.log(error);
    }
  };

  const handleAddSwiftCodeTypeAccount = async () => {
    try {
      if (localStorage.getItem("token")) {
        setAuthToken(localStorage.getItem("token"));
      }
      dispatch(startLoading());

      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };
      const data = {
        accountHolderName: accountHolderName,
        accountNumber: accountNumber,
        legalType: legalType,
        swiftCode: swiftCode,
        country: country,
        state: state,
        city: city,
        postCode: postCode,
        firstLine: firstLine,
      };

      if (data.country.toLocaleLowerCase() !== "us") {
        data["state"] = "";
      }

      const body = JSON.stringify(data);
      const res = await axios.post(
        "/api/v1/bank/international/usd/outside",
        body,
        config
      );
      alert.show("Account details saved successfully", {
        type: "success",
      });
      updateUserInternationalBankAccountList(res.data);
      dispatch(stopLoading());
      resetForm();
      toggleModal();
    } catch (error) {
      dispatch(stopLoading());
      alert.show("error adding account", { type: "error" });
      console.log(error);
    }
  };

  const countrySelect = (countries) => {
    return (
      <>
        {countries.map((country, index) => (
          <option key={index} value={country.key}>
            {country.name}
          </option>
        ))}
      </>
    );
  };

  const stateSelect = (states) => {
    return (
      <>
        {states.map((state, index) => (
          <option key={index} value={state.key}>
            {state.name}
          </option>
        ))}
      </>
    );
  };

  return (
    <>
      <Modal isOpen={openModal} centered size="md">
        <div className="add-bank-account-modal__content">
          <div
            className="modal-header"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignContent: "baseline",
            }}
          >
            <h5 className="add-account-modal__header">
              Add A New Bank Account.
            </h5>
            <div onClick={toggleModal} className="header-modal-clsoe-btn">
              <i className="fas fa-times"></i>
            </div>
          </div>
          <ModalBody>
            <p>
              Enter your account details. This enables us to send out payments
              to you when ever you request payments.
            </p>
            <small className="account-caution-text mb-3">
              <span className="mr-1">Caution</span>Please Ensure the Account
              Details Added Here are Accurate and correct. Tuturly would not be
              help resposible for transfering funds to a wrong account.
            </small>{" "}
            <br /> <br />
            <div className="bank-account-input-form-container">
              <Form onSubmit={handleFormSubmit}>
                <FormGroup>
                  <Label>Account Holder Name*</Label>
                  <Input
                    placeholder="John Doe"
                    type="text"
                    name="accountHolderName"
                    required
                    value={accountHolderName}
                    onChange={(e) => updateFormInputValue(e)}
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Account Number*</Label>
                  <Input
                    placeholder="1122334455"
                    type="text"
                    name="accountNumber"
                    required
                    value={accountNumber}
                    onChange={(e) => updateFormInputValue(e)}
                    pattern="^[a-zA-Z0-9\\s]{4,34}$"
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Legal Type*</Label>
                  <Input
                    name="legalType"
                    required
                    value={legalType}
                    onChange={(e) => updateFormInputValue(e)}
                    type="select"
                  >
                    <option value="">Select Option</option>
                    <option value="PRIVATE">Person</option>
                    <option value="BUSINESS">Business</option>
                  </Input>
                </FormGroup>
                <FormGroup>
                  <Label>Country*</Label>
                  <Input
                    type="select"
                    required
                    value={country}
                    onChange={(e) => updateFormInputValue(e)}
                    name="country"
                  >
                    <option value="">Select Country</option>
                    {countrySelect(formCoutries)}
                  </Input>
                </FormGroup>
                {addAccountFormInput.country.toLocaleLowerCase() === "us" && (
                  <>
                    <FormGroup>
                      <Label>State*</Label>
                      <Input
                        type="select"
                        placeholder="state"
                        value={state}
                        onChange={(e) => updateFormInputValue(e)}
                        name="state"
                      >
                        <option value="">Select State</option>
                        {stateSelect(formStates)}
                      </Input>
                    </FormGroup>
                  </>
                )}
                <FormGroup>
                  <Label>City*</Label>
                  <Input
                    type="text"
                    placeholder="city"
                    value={city}
                    onChange={(e) => updateFormInputValue(e)}
                    required
                    name="city"
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Address*</Label>
                  <Input
                    type="text"
                    placeholder="address"
                    value={firstLine}
                    onChange={(e) => updateFormInputValue(e)}
                    required
                    name="firstLine"
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Postcode*</Label>
                  <Input
                    type="text"
                    placeholder="postcode"
                    value={postCode}
                    onChange={(e) => updateFormInputValue(e)}
                    required
                    name="postCode"
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Account Type</Label>
                  <div>
                    <ButtonGroup className="btn-switcher__container">
                      <Button
                        className={`account-switcher-btn ${
                          accountTypeSwitcher === 1 &&
                          "account-switch-btn__active"
                        }`}
                        outline
                        onClick={() => setAccountTypeSwitcher(1)}
                        active={accountTypeSwitcher === 1}
                      >
                        ACH
                      </Button>
                      <Button
                        className={`account-switcher-btn ${
                          accountTypeSwitcher === 2 &&
                          "account-switch-btn__active"
                        }`}
                        outline
                        onClick={() => setAccountTypeSwitcher(2)}
                        active={accountTypeSwitcher === 2}
                      >
                        Swift
                      </Button>
                    </ButtonGroup>
                  </div>
                </FormGroup>
                {
                  // if account type is 1 display the
                  // ACH form inputs info or display the Swift info
                  accountTypeSwitcher === 1 ? (
                    <>
                      <FormGroup>
                        <Label>Routing Number*</Label>
                        <Input
                          type="text"
                          placeholder="020123456"
                          name="routingNumber"
                          value={routingNumber}
                          onChange={(e) => updateFormInputValue(e)}
                        />
                        {routingNumberRegex.test(routingNumber) === false && (
                          <small className="account-warning-text">
                            Routing Number not valid
                          </small>
                        )}
                      </FormGroup>
                      <FormGroup>
                        <Label>Account Type*</Label>
                        <Input
                          name="accountType"
                          onChange={(e) => updateFormInputValue(e)}
                          type="select"
                          value={accountType}
                        >
                          <option value="">Select Type</option>
                          <option value="CHECKING">Checking</option>
                          <option value="SAVINGS">Savings</option>
                        </Input>
                      </FormGroup>
                    </>
                  ) : (
                    <>
                      <small>
                        To send USD outside the US, we need to use SWIFT. This
                        means your transfer will cost $2.90 more and it may take
                        2-5 days longer. Other banks involved may also charge
                        fees.
                      </small>
                      <FormGroup className="mt-3">
                        <Label>Swift Code*</Label>
                        <Input
                          type="text"
                          name="swiftCode"
                          placeholder="BUKBGB22"
                          value={swiftCode}
                          onChange={(e) => updateFormInputValue(e)}
                        />
                        {swiftCodeRegex.test(swiftCode) === false && (
                          <small className="account-warning-text">
                            Swift code not valid
                          </small>
                        )}
                      </FormGroup>
                    </>
                  )
                }
                <FormGroup className="mt-2">
                  <Button
                    type="submit"
                    disabled={
                      (accountTypeSwitcher === 1 &&
                        routingNumberRegex.test(routingNumber) === false) ||
                      (accountTypeSwitcher === 2 &&
                        swiftCodeRegex.test(swiftCode) === false)
                    }
                    block
                    className="modal-btn-style"
                  >
                    Save Details
                  </Button>
                </FormGroup>
              </Form>
            </div>
          </ModalBody>
        </div>
      </Modal>
    </>
  );
};

export default AddInternationalBankAccountModal;
