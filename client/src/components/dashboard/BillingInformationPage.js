import React, { useEffect } from "react";
import { connect, useDispatch } from "react-redux";
import axios from "axios";
import { Link } from "react-router-dom";
import { Container, Row, Col, Card, CardBody, Button } from "reactstrap";
import { useAlert } from "react-alert";
import { startLoading, stopLoading } from "../../actions/appLoading";
import { UPDATE_DASHBOARD_PAGE_COUNTER } from "../../actions/types";
import setAuthToken from "../../utilities/setAuthToken";
import DashboardNavbarCopyForBillingsPage from "./DashboardNavbarCopyForBillingsPage";

import NotificationNavbar from "./NotificationNavbar";
import { loadUser } from "../../actions/auth";

import CreditdCards from "../CreditCards/CreditCards";

import "../../custom-styles/dashboard/dashboardlayout.css";
import "../../custom-styles/dashboard/billing-information.css";

const BillingInformationPage = ({ user }) => {
  const dispatch = useDispatch();
  const alert = useAlert();

  const getLoggedInUser = () => {
    dispatch(loadUser());
  };

  const generateCardUpdateLink = async () => {
    if (localStorage.getItem("token")) {
      setAuthToken(localStorage.getItem("token"));
    }
    try {
      dispatch(startLoading());
      const res = await axios.get("/api/v1/paymentplans/card/update");
      if (res.data.status === true) {
        window.location.href = res.data.data.link;
      }
      dispatch(stopLoading());
    } catch (error) {
      dispatch(stopLoading());
      alert.show(error.msg, {
        type: "error",
      });
    }
  };

  useEffect(() => {
    getLoggedInUser();
    dispatch({
      type: UPDATE_DASHBOARD_PAGE_COUNTER,
      payload: 9,
    });
    // eslint-disable-next-line
  }, []);

  return (
    <>
      <div className="dashboard-layout">
        <Container fluid>
          <Row>
            <DashboardNavbarCopyForBillingsPage />
            <Col className="page-actions__col">
              <div className="page-actions">
                <NotificationNavbar />
                <Container className="billing-info-contents-container">
                  <Card className="billing-info-card">
                    <CardBody className="billing-info-contents">
                      <div className="billing-info-heading">
                        <h4>Billing and information page</h4>
                        <Button
                          className="back-to-dashboard-btn"
                          tag={Link}
                          to="/dashboard/index"
                        >
                          <i className="fas fa-arrow-left mr-3"></i>
                          Back to Dashboard
                        </Button>
                      </div>
                      <div className="billing-info-body">
                        <div className="billing-account-info">
                          <p className="info-header-paragraph">
                            Account Name And Card Information
                          </p>
                          {user?.subscriptiondata === undefined ? (
                            <p>No Card Found, Can not Display Card Details.</p>
                          ) : (
                            <>
                              <>
                                <p>{`${user.firstname} ${user.lastname}`}</p>
                                <p>
                                  Last 4 Digist:{" "}
                                  {user?.subscriptiondata?.cardending}
                                </p>
                                <p>
                                  Card Brand:{" "}
                                  {user?.subscriptiondata?.cardexpiry}
                                </p>
                                <p>
                                  Card Expiry:{" "}
                                  {user?.subscriptiondata?.cardtype}
                                </p>
                              </>
                              {CreditdCards({
                                last4: user?.subscriptiondata?.cardending,
                                expiry: user?.subscriptiondata?.cardexpiry,
                                brand: user?.subscriptiondata?.cardtype,
                              })}
                            </>
                          )}
                        </div>
                        <br />
                        <Button
                          onClick={generateCardUpdateLink}
                          className="update-card-btn"
                          disabled={user?.subscriptiondata === undefined}
                        >
                          Update Card
                        </Button>
                      </div>
                    </CardBody>
                  </Card>
                </Container>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
};

const mapStateToProps = (state) => ({
  user: state.auth.user,
});

export default connect(mapStateToProps)(BillingInformationPage);
