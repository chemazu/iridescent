import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAlert } from "react-alert";
import setAuthToken from "../../../utilities/setAuthToken";
import { Container, Button } from "reactstrap";
import AccountDetailsItem from "./AcoountDetailsItem";
import AddBankAccountModal from "./AddBankAccountModal";
import AccountLoaderSkeleton from "./AccountLoaderSkeleton";

const BankDetailsComponent = ({
  userBankAccounts,
  userAccountLoading,
  updateUserBankAccountList,
  deleteItemFromUserBankAccountList,
}) => {
  const [bankList, setBankList] = useState([]);
  const [addAccountModal, setAddAccountModal] = useState(false);
  const alert = useAlert();

  const toggleModal = () => setAddAccountModal(!addAccountModal);

  const getListOfSupportedBanks = async () => {
    try {
      if (localStorage.getItem("token")) {
        setAuthToken(localStorage.getItem("token"));
      }
      const res = await axios.get(`/api/v1/bank/banklist`);
      setBankList(res.data);
    } catch (error) {
      alert.show(error.message, {
        type: "error",
      });
      console.log(error);
    }
  };

  useEffect(() => {
    getListOfSupportedBanks();
    // eslint-disable-next-line
  }, []);

  return (
    <>
      <div className="bank-details__contents mt-4">
        <Container
          fluid
          style={{
            width: "85%",
          }}
        >
          <div className="bank-details-title mt-4">Your Account Details.</div>
          <div className="account-details-container mt-3">
            {userAccountLoading ? (
              <>
                <AccountLoaderSkeleton />
              </>
            ) : (
              <>
                {userBankAccounts.length === 0 ? (
                  <p className="text-center mt-5 mb-5">
                    Bank Accounts Not Found.
                  </p>
                ) : (
                  <>
                    {userBankAccounts.map((account) => (
                      <AccountDetailsItem
                        key={account._id}
                        account={account}
                        deleteItemFromUserBankAccountList={
                          deleteItemFromUserBankAccountList
                        }
                      />
                    ))}
                  </>
                )}
              </>
            )}
          </div>
          <div className="add-account-details-button mt-5 mb-4">
            <Button onClick={toggleModal} block>
              Add Bank Account.
            </Button>
          </div>
        </Container>
      </div>
      <AddBankAccountModal
        toggleModal={toggleModal}
        openModal={addAccountModal}
        bankList={bankList}
        updateUserBankAccountList={updateUserBankAccountList}
      />
    </>
  );
};

export default BankDetailsComponent;
