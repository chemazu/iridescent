import React from "react";
import { Container, Row, Col } from "reactstrap";

import trackSectionImage from "../../images/home-page-images/track-image__section.png";

const TuturlyTracking = () => {
  return (
    <section className="tuturly-tracking-section">
      <Container className="tuturly-tracking-section__container">
        <h2 className="text-center">Keep Track of Your Audience</h2>
        <Row className="mt-4">
          <Col xs="12" sm="12" md="6" lg="6">
            <p className="text-left">
              Keep track of your activities, analytics and reply students
              messages all from the comfort of your own dashboard.
            </p>
          </Col>
          <Col xs="12" sm="12" md="6" lg="6">
            <img src={trackSectionImage} className="img-fluid" alt="..." />
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default TuturlyTracking;
