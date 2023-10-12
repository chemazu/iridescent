import React, { useState } from "react";
import {
  Modal,
  Button,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
} from "reactstrap";
import LocalWithdrawalComponent from "./LocalWithdrawalComponent";
import InternationalWithdrawComponent from "./InternationalWithdrawComponent";

const WithdrawalModal = ({
  displayWithdrawalModal,
  toggleWithdrawModal,
  withdrawableBalance,
  getPaymentPageContents,
  userBankAccounts,
  userAccountLoading,
  userInternationalBankAccount,
  userInternationalAccountLoading,
}) => {
  const [tabs, setTabs] = useState(1);
  const toggleNavs = (e, index) => {
    e.preventDefault();
    setTabs(index);
  };

  return (
    <>
      <Modal
        isOpen={displayWithdrawalModal}
        className="modal-dialog-centered"
        size="md"
      >
        <div className="withdraw-modal-content-container">
          <div className="modal-header payment-modal__header">
            <h3>Complete Withdrawal Process</h3>
            <div onClick={toggleWithdrawModal} className="header-close-icon">
              <i className="fas fa-times"></i>
            </div>
          </div>
          <div className="modal-body">
            <div className="withraw-tabs-switcher">
              <Nav
                className="flex-column flex-md-row withdrawal-nav"
                id="tabs-icons-text"
                pills
                role="tablist"
              >
                <NavItem>
                  <NavLink
                    aria-selected={tabs === 1}
                    className={`"mb-sm-3 mb-md-0" ${
                      tabs === 1 && "active-tab"
                    }`}
                    onClick={(e) => toggleNavs(e, 1)}
                    href="#pablo"
                    role="tab"
                  >
                    Local Withdrawals
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    aria-selected={tabs === 2}
                    className={`"mb-sm-3 mb-md-0" ${
                      tabs === 2 && "active-tab"
                    }`}
                    onClick={(e) => toggleNavs(e, 2)}
                    href="#pablo"
                    role="tab"
                  >
                    International Withdrawals
                  </NavLink>
                </NavItem>
              </Nav>
            </div>
            <TabContent activeTab={"tabs" + tabs}>
              <TabPane tabId="tabs1">
                <LocalWithdrawalComponent
                  toggleWithdrawModal={toggleWithdrawModal}
                  getPaymentPageContents={getPaymentPageContents}
                  withdrawableBalance={withdrawableBalance}
                  userBankAccounts={userBankAccounts}
                  userAccountLoading={userAccountLoading}
                />
              </TabPane>
              <TabPane tabId="tabs2">
                <InternationalWithdrawComponent
                  tabs={tabs}
                  toggleWithdrawModal={toggleWithdrawModal}
                  getPaymentPageContents={getPaymentPageContents}
                  withdrawableBalance={withdrawableBalance}
                  userInternationalBankAccount={userInternationalBankAccount}
                  userInternationalAccountLoading={
                    userInternationalAccountLoading
                  }
                />
              </TabPane>
            </TabContent>
          </div>
          <div className="modal-footer">
            <Button
              block
              className="modal-btn-style-outline"
              onClick={toggleWithdrawModal}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default WithdrawalModal;
