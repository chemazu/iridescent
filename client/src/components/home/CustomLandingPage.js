import React from "react";
import { Container, Row, Col } from "reactstrap";

import customLandingPageSectionImage from "../../images/home-page-images/custom-landing-page-image__section.png";

const CustomLandingPage = () => {
  return (
    <section className="custom-landing-page-section">
      <Container className="custom-landing-page-section__container">
        <h2 className="text-center">Create Your Custom Landing Page</h2>
        <Row className="mt-3">
          <Col xs="12" sm="12" md="6" lg="6">
            <img
              src={customLandingPageSectionImage}
              className="img-fluid"
              alt="..."
            />
          </Col>
          <Col xs="12" sm="12" md="6" lg="6">
            <p className="text-right">
              Create your own webpage, customize it, upload your Knowledge
              (Course videos, Digital products or Live classes) and share your
              link.
            </p>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default CustomLandingPage;
