import React, { useState } from "react";
import { Button, Container } from "reactstrap";
import AccountLoaderSkeleton from "./AccountLoaderSkeleton";
import InternationalBankAccountItem from "./InternationalBankAccountItem";
import AddInternationalBankAccountModal from "./AddInternationalBankAccountModal";

const InternationalBankDetails = ({
  userInternationalBankAccount,
  userInternationalAccountLoading,
  updateUserInternationalBankAccountList,
  deleteUserInternationalBankAccountItem,
}) => {
  const [addAccountModal, setAddAccountModal] = useState(false);
  const toggleModal = () => setAddAccountModal(!addAccountModal);

  return (
    <>
      <div className="international-bank-details__contents mt-4">
        <Container
          fluid
          style={{
            width: "85%",
          }}
        >
          {userInternationalAccountLoading ? (
            <>
              <AccountLoaderSkeleton />
            </>
          ) : (
            <>
              {userInternationalBankAccount.length === 0 ? (
                <p className="text-center mt-5 mb-5">
                  Back Accounts Not Found.
                </p>
              ) : (
                <>
                  <div className="internation-bank-details-title mt-4">
                    Your International Account Details.
                  </div>
                  <div className="international-account-details__container mt-4">
                    {userInternationalBankAccount.map((account) => (
                      <InternationalBankAccountItem
                        key={account._id}
                        account={account}
                        deleteUserInternationalBankAccountItem={
                          deleteUserInternationalBankAccountItem
                        }
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          )}
          <div className="add-international-account-details-btn__container">
            <Button block onClick={toggleModal}>
              Add Account Account
            </Button>
          </div>
        </Container>
      </div>
      <AddInternationalBankAccountModal
        toggleModal={toggleModal}
        openModal={addAccountModal}
        updateUserInternationalBankAccountList={
          updateUserInternationalBankAccountList
        }
      />
    </>
  );
};

export default InternationalBankDetails;
