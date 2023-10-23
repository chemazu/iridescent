import React from "react";
import { Container, Row, Col, Button } from "reactstrap";
import { Link } from "react-router-dom";

import specialSectionImage from "../../images/home-page-images/special-image__section.png";

const Special = () => {
  return (
    <section className="special-section">
      <Container className="special-section-container">
        <h2 className="text-center">What is So Special About Tuturly?</h2>
        <h4 className="text-center">You Can Host Live Classes</h4>
        <Row className="align-item-center">
          <Col xs="12" sm="12" md="6" lg="6">
            <img src={specialSectionImage} className="img-fluid" alt="..." />
          </Col>
          <Col xs="12" sm="12" md="6" lg="6">
            <div className="special-section-cta__container">
              <p className="text-right">
                Host live classes for your audience with the New Tuturly Class
                feature. On Tuturly class, you can set polls and quiz for your
                audience to make the class more interactive.
              </p>
              <Button
                size="lg"
                type="button"
                className="ml-1 mb-3 sign-up-btn"
                to="/signup"
                tag={Link}
                disabled={false}
              >
                Get started for free
              </Button>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default Special;
