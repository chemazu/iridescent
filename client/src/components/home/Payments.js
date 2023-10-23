import React from "react";
import { Container, Row, Col } from "reactstrap";

import paymentSectionImage from "../../images/home-page-images/payment-image__section.png";

const Payments = () => {
  return (
    <section className="payments-section">
      <Container className="payments-section__container">
        <h2 className="text-center">Keep Track of Your Audience</h2>
        <Row className="mt-4">
          <Col xs="12" sm="12" md="6" lg="6">
            <p className="text-left">
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
