import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalBody,
  ModalFooter,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
} from "reactstrap";
import { connect } from "react-redux";
import { useAlert } from "react-alert";
import { startLoading, stopLoading } from "../../../actions/appLoading";
import axios from "axios";
import setAuthToken from "../../../utilities/setAuthToken";
import VerifyAccountModal from "./VerifyAccountModal";

const AddBankAccountModal = ({
  openModal,
  toggleModal,
  bankList,
  showLoader,
  removeLoader,
  updateUserBankAccountList,
}) => {
  const [bankcode, setBankCode] = useState("");
  const [accountnumber, setAccountNumber] = useState("");

  const [verifyAccountLoading, setVerifyAccountLoading] = useState(false);
  const [chosenBankName, setChosenBankName] = useState("");

  const [verifiedAccountName, setVerifiedAccountName] = useState("");

  const [accountVerified, setAccountVerified] = useState(false);

  const alert = useAlert();

  const verifyAccountDetails = async () => {
    try {
      setVerifyAccountLoading(true);
      setVerifiedAccountName("");
      if (localStorage.getItem("token")) {
        setAuthToken(localStorage.getItem("token"));
      }
      const res = await axios.get(
        `/api/v1/bank/verify/${bankcode}/${accountnumber}`
      );
      setVerifiedAccountName(res.data.account_name);
      // setVerifyAccountLoading(false)
      setAccountVerified(true);
      alert.show("Account Details Save Successfully", {
        type: "success",
      });
    } catch (error) {
      alert.show("Please check Your Input And Try Again", {
        type: "error",
      });
      setVerifyAccountLoading(false);
      setAccountVerified(false);
    }
  };

  const toggleVerifyAccountLoading = () =>
    setVerifyAccountLoading(!verifyAccountLoading);

  const handleChoseBank = (e) => {
    if (accountVerified === true) {
      // this code keeps track of when the user changes the input
      setAccountVerified(false); // after a verification has being sucessful
    }
    setBankCode(e.target.value);
  };

  const accountNumberInputChangeHandler = (e) => {
    if (accountVerified === true) {
      // this code keeps track of when the user changes the input
      setAccountVerified(false); // after a verification has being sucessful
    }
    setAccountNumber(e.target.value);
  };

  const handleAccountSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      showLoader();
      if (localStorage.getItem("token")) {
        setAuthToken(localStorage.getItem("token"));
      }

      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };

      const body = JSON.stringify({
        bankcode: bankcode,
        accountnumber: accountnumber,
        bankname: chosenBankName.toLowerCase(),
        accountname: verifiedAccountName.toLowerCase(),
      });
      const res = await axios.post("/api/v1/bank/", body, config);
      alert.show("Account Details Save Successfully", {
        type: "success",
      });
      updateUserBankAccountList(res.data);
      setBankCode("");
      setAccountNumber("");
      setAccountVerified(false);
      setVerifiedAccountName("");

      removeLoader();
      toggleModal();
    } catch (error) {
      const errors = error.response.data.errors;
      if (errors) {
        errors.forEach((element) => {
          alert.show(element.msg, {
            type: "error",
          });
        });
      }
      alert.show(error?.message, {
        type: "error",
      });
      removeLoader();
    }
  };

  useEffect(() => {
    if (
      bankcode.length > 0 &&
      accountnumber.length > 9 &&
      accountnumber.length < 11
    ) {
      verifyAccountDetails();
    }
    // eslint-disable-next-line
  }, [bankcode, accountnumber]);

  useEffect(() => {
    if (bankcode.length > 0) {
      // code to get bank name from choosen bank from dropdown list
      const chosenBank = bankList.find((bank) => bank.code === bankcode);
      setChosenBankName(chosenBank.name);
    }
    // eslint-disable-next-line
  }, [bankcode]);

  return (
    <>
      <Modal isOpen={openModal} toggle={toggleModal} centered size="md">
        <div
          className="modal-header"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignContent: "baseline",
          }}
        >
          <h5 className="add-account-modal__header">Add A New Bank Account.</h5>
          <div onClick={toggleModal} className="header-modal-clsoe-btn">
            <i className="fas fa-times"></i>
          </div>
        </div>
        <ModalBody>
          <p>
            Enter your account details. This enables us to send out payments to
            you when ever you request payments
          </p>

          <div className="bank-account-input-form-container">
            <Form onSubmit={(e) => handleAccountSubmitHandler(e)}>
              <FormGroup>
                <Label>Bank Name*</Label>
                <Input
                  placeholder="Bank Details"
                  onChange={(e) => handleChoseBank(e)}
                  type="select"
                  name="bankListOptions"
                >
                  <option value="">Select Bank</option>
                  {bankList.map((bank) => (
                    <option key={bank.code} value={bank.code}>
                      {bank.name}
                    </option>
                  ))}
                </Input>
              </FormGroup>
              <FormGroup>
                <Label>Account Number*</Label>
                <Input
                  placeholder="Account Number"
                  name="account number"
                  value={accountnumber}
                  onChange={(e) => accountNumberInputChangeHandler(e)}
                ></Input>
              </FormGroup>
              {/* {
            verifyAccountLoading && <p className='small ml-3 account-verifying-text'>verifying...</p>
            }
            {
            verifiedAccountName.length > 0 && <p className='small ml-3 account-verified-text' >{verifiedAccountName.toLowerCase()}</p>
            } */}
              <FormGroup className="mt-3">
                <Button
                  type="submit"
                  block
                  disabled={!accountVerified}
                  className="modal-btn-style"
                >
                  Save Details
                </Button>
              </FormGroup>
            </Form>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            onClick={toggleModal}
            className="modal-btn-style-outline"
            block
          >
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
      <VerifyAccountModal
        loading={verifyAccountLoading}
        toggleVerifyAccountLoading={toggleVerifyAccountLoading}
        verifiedAccountName={verifiedAccountName}
      />
    </>
  );
};

const mapDispatchToProps = (dispatch) => ({
  showLoader: () => dispatch(startLoading()),
  removeLoader: () => dispatch(stopLoading()),
});

export default connect(null, mapDispatchToProps)(AddBankAccountModal);
