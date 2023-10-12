import React, { useState } from "react";
import { Nav, NavItem, NavLink, TabContent, TabPane } from "reactstrap";
import BankDetailsComponent from "./BankDetailsComponent";
import InternationalBankDetails from "./InternationalBankDetails";

const BankDetailsBaseComponent = ({
  userBankAccounts,
  userAccountLoading,
  updateUserBankAccountList,
  deleteItemFromUserBankAccountList,
  userInternationalBankAccount,
  userInternationalAccountLoading,
  updateUserInternationalBankAccountList,
  deleteUserInternationalBankAccountItem,
}) => {
  const [tabs, setTabs] = useState(1);
  const toggleNavs = (e, index) => {
    e.preventDefault();
    setTabs(index);
  };

  return (
    <>
      <div className="bank-details-swticher__container">
        <Nav
          className="flex-column flex-md-row"
          id="tabs-icons-text"
          pills
          role="tablist"
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <NavItem>
            <NavLink
              aria-selected={tabs === 1}
              className={`"mb-sm-3 mb-md-0" ${tabs === 1 && "active-tab"}`}
              onClick={(e) => toggleNavs(e, 1)}
              href="#pablo"
              role="tab"
            >
              Local Bank Accounts
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              aria-selected={tabs === 2}
              className={`"mb-sm-3 mb-md-0" ${tabs === 2 && "active-tab"}`}
              onClick={(e) => toggleNavs(e, 2)}
              href="#pablo"
              role="tab"
            >
              International Bank Account
            </NavLink>
          </NavItem>
        </Nav>
      </div>
      <div className="bank-details-content__container">
        <TabContent activeTab={"tabs" + tabs}>
          <TabPane tabId="tabs1">
            <BankDetailsComponent
              userBankAccounts={userBankAccounts}
              userAccountLoading={userAccountLoading}
              updateUserBankAccountList={updateUserBankAccountList}
              deleteItemFromUserBankAccountList={
                deleteItemFromUserBankAccountList
              }
            />
          </TabPane>
          <TabPane tabId="tabs2">
            <InternationalBankDetails
              userInternationalBankAccount={userInternationalBankAccount}
              userInternationalAccountLoading={userInternationalAccountLoading}
              updateUserInternationalBankAccountList={
                updateUserInternationalBankAccountList
              }
              deleteUserInternationalBankAccountItem={
                deleteUserInternationalBankAccountItem
              }
            />
          </TabPane>
        </TabContent>
      </div>
    </>
  );
};

export default BankDetailsBaseComponent;
