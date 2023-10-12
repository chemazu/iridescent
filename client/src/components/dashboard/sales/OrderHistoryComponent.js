import React, { useState, useEffect } from "react";
import {
  Container,
  //  UncontrolledDropdown,
  // DropdownToggle, DropdownMenu,
  //  DropdownItem
} from "reactstrap";
import axios from "axios";
import BarchatContainer from "./BarchatContainer";
import OrderHistoryTable from "./OrderHistoryTable";
import setAuthToken from "../../../utilities/setAuthToken";
import { useAlert } from "react-alert";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import DashboardGraphLoader from "../index/DashboardGraphLoader";

const OrderHistoryComponent = () => {
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [purchaseHistoryLoading, setPurchaseHistoryLoading] = useState(true);
  const [salesChartData, setSalesChartData] = useState(null);

  const alert = useAlert();

  const getCoursePurchaseHistory = async () => {
    if (localStorage.getItem("token")) {
      setAuthToken(localStorage.getItem("token"));
    }
    try {
      const res = await axios.get("/api/v1/order/history");
      setPurchaseHistory(res.data);
      setPurchaseHistoryLoading(false);
    } catch (error) {
      alert.show(error.msg, {
        type: "error",
      });
      setPurchaseHistory([]);
    }
  };

  const getUserSalesAnalySisForChartDisplay = async () => {
    if (localStorage.getItem("token")) {
      setAuthToken(localStorage.getItem("token"));
    }
    try {
      const res = await axios.get("/api/v1/order/sales/report/backdate");
      setSalesChartData(res.data);
    } catch (error) {
      console.log(error);
      alert.show(error.message, {
        type: "error",
      });
    }
  };

  useEffect(() => {
    getCoursePurchaseHistory();
    getUserSalesAnalySisForChartDisplay();
    // eslint-disable-next-line
  }, []);

  return (
    <>
      <div className="history__content mt-3">
        <Container>
          <div className="content__header">
            <h2 className="order-page__title">Your Payment History</h2>
            {/* <div className="sort-dropdown">
                <UncontrolledDropdown>
                    <DropdownToggle
                    color="secondary"
                    id="dropdownMenuButton"
                    type="button"
                    className="dropdown-btn-style"
                    >
                    <i className="fas fa-filter"></i>
                    </DropdownToggle>
                    <DropdownMenu
                     aria-labelledby="dropdownMenuButton"
                     className="dropdown-menu__style"
                     >
                    <DropdownItem
                    className="dropdown-item__style"
                    >
                        View based on time
                    </DropdownItem>
                    <DropdownItem 
                    className="dropdown-item__style">
                        View based on course
                    </DropdownItem>
                    </DropdownMenu>
                </UncontrolledDropdown>
                </div> */}
          </div>
          {purchaseHistoryLoading ? (
            <>
              <div
                className="mt-3 mb-3"
                style={{
                  height: "400px",
                }}
              >
                <SkeletonTheme color="#f2f2f2" highlightColor="#fff">
                  <Skeleton duration={2.4} height="400px" width="100%" />
                </SkeletonTheme>
              </div>
            </>
          ) : (
            <>
              <OrderHistoryTable purchaseHistory={purchaseHistory} />
            </>
          )}

          {salesChartData === null ? (
            <DashboardGraphLoader />
          ) : (
            <BarchatContainer
              labels={salesChartData.labels}
              datas={salesChartData.datas}
            />
          )}
        </Container>
      </div>
    </>
  );
};

export default OrderHistoryComponent;
