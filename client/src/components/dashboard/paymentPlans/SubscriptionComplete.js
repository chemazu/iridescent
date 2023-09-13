import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import axios from "axios";
import qs from "qs";
import { useHistory } from "react-router-dom";
import { Row, Col, Container, Modal, Card, Button } from "reactstrap";
import { useAlert } from "react-alert";
import DashboardNavbar from "../DashboardNavbar";
import NotificationNavbar from "../NotificationNavbar";
import setAuthToken from "../../../utilities/setAuthToken";
import { startLoading, stopLoading } from "../../../actions/appLoading";

import "../../../custom-styles/dashboard/dashboardlayout.css";

const SubscriptionComplete = ({ location, showLoader, removeLoader }) => {
  const { reference } = qs.parse(location.search, { ignoreQueryPrefix: true });
  const alert = useAlert();
  const [displaySuccessModal, setDisplaySuccessModal] = useState(false);
  const history = useHistory();

  const verifyTransaction = async () => {
    try {
      showLoader();
      if (localStorage.getItem("token")) {
        setAuthToken(localStorage.getItem("token"));
      }
      await axios.get(`/api/v1/paymentplans/verify/${reference}`);
      removeLoader();
      setDisplaySuccessModal(true);
    } catch (error) {
      const errors = error.response?.data?.errors | [];
      if (errors) {
        errors.forEach((error) => alert.show(error.msg, { type: "error" }));
      }
      alert.show(error.message, {
        type: "error",
      });
      console.log(JSON.stringify(error));
      removeLoader();
    }
  };

  const handleButtonClick = () => {
    setDisplaySuccessModal(false);
    history.push("/dashboard/plans/payment");
  };

  useEffect(() => {
    verifyTransaction();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className="dashboard-layout">
        <Container fluid>
          <Row>
            <DashboardNavbar />
            <Col className="page-actions__col">
              <div className="page-actions">
                <NotificationNavbar />
              </div>
            </Col>
          </Row>
        </Container>
      </div>
      <Modal isOpen={displaySuccessModal} size="md" centered>
        <Card
          style={{
            padding: "45px",
          }}
        >
          <p
            className="lead text-center mb-4 mt-2"
            style={{
              color: "#242121",
              fontSize: "16px",
              fontWeight: "450",
            }}
          >
            Your Transaction has being verified and your subscription was
            processed successfully.
          </p>
          <Button
            style={{
              color: "#242121 !important",
              boxShadow: "none",
              backgroundColor: "#fff",
              border: "0.002345rem solid #242121",
            }}
            onClick={handleButtonClick}
            block
          >
            Proceed To Payment Plans Page.
          </Button>
        </Card>
      </Modal>
    </>
  );
};

const mapDispatchToProps = (dispatch) => ({
  showLoader: () => dispatch(startLoading()),
  removeLoader: () => dispatch(stopLoading()),
});

export default connect(null, mapDispatchToProps)(SubscriptionComplete);
