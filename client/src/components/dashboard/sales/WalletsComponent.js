import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import axios from "axios";
import { useAlert } from "react-alert";
import { Row, Col, Button, UncontrolledTooltip } from "reactstrap";
import setAuthToken from "../../../utilities/setAuthToken";
import PaymentPageCardSkeleton from "./PaymentPageCardSkeleton";
import CurrencyFormat from "react-currency-format";
import WithdrawalModal from "./WithdrawalModal";

import monthlySalesIcon from "../../../images/payment-page-icons/monthly-sales.svg";
import totalSalesImg from "../../../images/payment-page-icons/total-Sales.svg";
import totalWithdrawal from "../../../images/payment-page-icons/total-withdrawal.svg";
import withdrawalCountImg from "../../../images/payment-page-icons/withdrawal-count.svg";
import bankIcon from "../../../images/bank.png";
import escrowIcon from "../../../images/escrow.png";

const WalletsComponent = ({
  user,
  userBankAccounts,
  userAccountLoading,
  userInternationalBankAccount,
  userInternationalAccountLoading,
}) => {
  const alert = useAlert();
  const [pageContentsLoading, setPageContentsLoading] = useState(true);
  const [totalSales, setTotalSales] = useState(null);
  const [pendingSalesTotal, setPendingSalesTotal] = useState(null);
  const [monthBasedSales, setMonthBasedSales] = useState(null);
  const [withdrawalCount, setWithdrawalCount] = useState(null);
  const [withdrawalSum, setWithdrawalSum] = useState(null);
  const [displayWithdrawalModal, setDisplayWithdrawalModal] = useState(false);

  const getTotalSales = async () => {
    try {
      if (localStorage.getItem("token")) {
        setAuthToken(localStorage.getItem("token"));
      }
      const salesTotalResponse = await axios.get("/api/v1/order/ordersum");
      if (salesTotalResponse.data.length === 0) {
        setTotalSales(0);
      } else {
        setTotalSales(salesTotalResponse.data[0].salesTotal);
      }
    } catch (error) {
      console.log(error);
      alert.show(error?.msg, {
        type: "error",
      });
    }
  };

  const getPendingBalanceTotalSales = async () => {
    try {
      if (localStorage.getItem("token")) {
        setAuthToken(localStorage.getItem("token"));
      }
      const pendingSalesTotalResponse = await axios.get(
        "/api/v1/order/ordersum/pending"
      );
      if (pendingSalesTotalResponse.data.length === 0) {
        setPendingSalesTotal(0);
      } else {
        setPendingSalesTotal(
          pendingSalesTotalResponse.data[0].pendingBalanceSalesTotal
        );
      }
    } catch (error) {
      console.log(error, "line 68 error");
      alert.show(error?.msg, {
        type: "error",
      });
    }
  };

  const getMonthBasedTotal = async () => {
    try {
      if (localStorage.getItem("token")) {
        setAuthToken(localStorage.getItem("token"));
      }
      const monthTotalResponse = await axios.get(
        "/api/v1/order/ordersum/monthly"
      );
      if (monthTotalResponse.data.length === 0) {
        setMonthBasedSales(0);
      } else {
        setMonthBasedSales(monthTotalResponse.data[0].salesTotal);
      }
    } catch (error) {
      console.log(error);
      alert.show(error?.msg, {
        type: "error",
      });
    }
  };

  const getWithdrawalCount = async () => {
    try {
      if (localStorage.getItem("token")) {
        setAuthToken(localStorage.getItem("token"));
      }
      const withdrawalCountResponse = await axios.get(
        "/api/v1/wallet/withraw/count"
      );
      setWithdrawalCount(withdrawalCountResponse.data);
    } catch (error) {
      console.log(error);
      alert.show(error?.msg, {
        type: "error",
      });
    }
  };

  const getWithdrawalSum = async () => {
    try {
      if (localStorage.getItem("token")) {
        setAuthToken(localStorage.getItem("token"));
      }
      const withdrawalCountResponse = await axios.get(
        "/api/v1/wallet/withraw/sum"
      );
      if (withdrawalCountResponse.data.length === 0) {
        setWithdrawalSum(0);
      } else {
        setWithdrawalSum(withdrawalCountResponse.data[0].withdrawalsumTotal);
      }
    } catch (error) {
      console.log(error);
      alert.show(error?.msg, {
        type: "error",
      });
    }
  };

  const getPaymentPageContents = async () => {
    setPageContentsLoading(true);
    await getTotalSales();
    await getMonthBasedTotal();
    await getPendingBalanceTotalSales();
    await getWithdrawalCount();
    await getWithdrawalSum();
    setPageContentsLoading(false);
  };

  const toggleWithdrawModal = () =>
    setDisplayWithdrawalModal(!displayWithdrawalModal);

  useEffect(() => {
    getPaymentPageContents();

    // eslint-disable-next-line
  }, []);

  return (
    <>
      <div className="wallets-content mt-3 mr-1">
        <Row>
          <Col sm="12" md="12" lg="8">
            <h2 className="user-welcome">
              Welcome {user?.firstname}{" "}
              {user?.lastname?.substring(0, 1).toUpperCase()}.
            </h2>
            {pageContentsLoading ? (
              <PaymentPageCardSkeleton />
            ) : (
              <>
                <div className="current-balance-container">
                  <div className="balance-item available-balance">
                    <div className="balance-icon__image-container">
                      <img src={bankIcon} alt="..." className="img-fluid" />
                    </div>
                    <p className="small">Available Balance</p>
                    <h2 className="current-balance-amount">
                      &#x24;
                      <CurrencyFormat
                        value={totalSales - withdrawalSum}
                        displayType="text"
                        thousandSeparator={true}
                        decimalScale={2}
                        fixedDecimalScale={true}
                      />
                    </h2>
                  </div>
                  <div className="balance-item pending-balance">
                    <div className="balance-icon__image-container">
                      <img src={escrowIcon} alt="..." className="img-fluid" />
                    </div>
                    <div className="balance-info-text">
                      <p className="small">Pending Balance </p>
                      <span
                        className="more-infor__icon"
                        id="UncontrolledTooltipExample"
                      >
                        <i className="fas fa-info-circle"></i>
                      </span>
                      <UncontrolledTooltip
                        placement="top"
                        target="UncontrolledTooltipExample"
                      >
                        The Pending Balance represents the total amount of
                        earnings from completed purchases on your school that
                        are yet to be transfered to your Balance. It Typically
                        takes 5 - 7 days to complete.
                      </UncontrolledTooltip>
                    </div>
                    <h2 className="current-balance-amount">
                      &#x24;
                      <CurrencyFormat
                        value={pendingSalesTotal}
                        displayType="text"
                        thousandSeparator={true}
                        decimalScale={2}
                        fixedDecimalScale={true}
                      />
                    </h2>
                  </div>
                </div>
              </>
            )}
            <div className="withdrawal-button mt-6">
              <Button block onClick={toggleWithdrawModal}>
                Withdraw My Earnings.
              </Button>
            </div>
            <div className="wallet-info mt-4">
              <p>
                <span className="note-highlighted">NOTE: </span>
                In order to make a withdawal you must have registered your Bank
                Details, You can do that on the{" "}
                <span className="bank-details__highlighted">
                  Bank Details
                </span>{" "}
                Tab.
              </p>
            </div>
          </Col>
          <Col sm="12" md="12" lg="4">
            <div className="wallet-card-container">
              {pageContentsLoading ? (
                <PaymentPageCardSkeleton />
              ) : (
                <>
                  <div className="wallet-info-card">
                    <div className="wallet-card-info-img__container">
                      <img src={totalWithdrawal} alt="..." />
                    </div>

                    <p>Total Withdrawal</p>
                    <h3>
                      &#x24;
                      {
                        <CurrencyFormat
                          value={withdrawalSum}
                          displayType="text"
                          thousandSeparator={true}
                          decimalScale={2}
                          fixedDecimalScale={true}
                        />
                      }
                    </h3>
                  </div>
                </>
              )}
              {pageContentsLoading ? (
                <PaymentPageCardSkeleton />
              ) : (
                <>
                  <div className="wallet-info-card">
                    <div className="wallet-card-info-img__container">
                      <img src={withdrawalCountImg} alt="..." />
                    </div>

                    <p>Number of withdrawal</p>
                    <h3>{withdrawalCount}</h3>
                  </div>
                </>
              )}
              {pageContentsLoading ? (
                <PaymentPageCardSkeleton />
              ) : (
                <>
                  <div className="wallet-info-card">
                    <div className="wallet-card-info-img__container">
                      <img src={monthlySalesIcon} alt="..." />
                    </div>

                    <p>Sales this month</p>
                    <h3>
                      &#x24;
                      {
                        <CurrencyFormat
                          value={monthBasedSales}
                          displayType="text"
                          thousandSeparator={true}
                          decimalScale={2}
                          fixedDecimalScale={true}
                        />
                      }
                    </h3>
                  </div>
                </>
              )}
              {pageContentsLoading ? (
                <PaymentPageCardSkeleton />
              ) : (
                <>
                  <div className="wallet-info-card">
                    <div className="wallet-card-info-img__container">
                      <img src={totalSalesImg} alt="..." />
                    </div>

                    <p>Total Sales</p>
                    <h3>
                      &#x24;
                      {
                        <CurrencyFormat
                          value={totalSales}
                          displayType="text"
                          thousandSeparator={true}
                          decimalScale={2}
                          fixedDecimalScale={true}
                        />
                      }
                    </h3>
                  </div>
                </>
              )}
            </div>
          </Col>
        </Row>
      </div>
      <WithdrawalModal
        displayWithdrawalModal={displayWithdrawalModal}
        toggleWithdrawModal={toggleWithdrawModal}
        withdrawableBalance={totalSales - withdrawalSum}
        getPaymentPageContents={getPaymentPageContents}
        userBankAccounts={userBankAccounts}
        userAccountLoading={userAccountLoading}
        userInternationalBankAccount={userInternationalBankAccount}
        userInternationalAccountLoading={userInternationalAccountLoading}
      />
    </>
  );
};

const mapStateToProps = (state) => ({
  user: state.auth.user,
});

export default connect(mapStateToProps)(WalletsComponent);
