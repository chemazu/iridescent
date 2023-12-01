import React from "react";
import { Container, Row, Col } from "reactstrap";

import paymentSectionImage from "../../images/home-page-images/payment-image__section.svg";

const Payments = () => {
  return (
    <section className="payments-section">
      <Container className="payments-section__container">
        <h2 className="text-center">Keep Track of Your Payments</h2>
        <Row className="mt-4 payments-section-row">
          <Col xs="12" sm="12" md="6" lg="6">
            <p>
              View your payment history, know your best selling offer and
              withdraw your earnings straight to your bank account
            </p>
          </Col>
          <Col xs="12" sm="12" md="6" lg="6">
            <img src={paymentSectionImage} className="img-fluid" alt="..." />
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default Payments;
