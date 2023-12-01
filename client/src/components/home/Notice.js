import React from "react";
import { Container, Row, Col, Button } from "reactstrap";
import { Link } from "react-router-dom";

import noticeSectionImage from "../../images/home-page-images/notice-image__section.svg";

const Notification = () => {
  return (
    <section className="notice-section">
      <Container className="notice-section-container">
        <h3 className="text-center">Get Your Course noticed</h3>
        <Row className="align-item-center">
          <Col xs="12" sm="12" md="6" lg="6">
            <img src={noticeSectionImage} className="img-fluid" alt="..." />
          </Col>
          <Col xs="12" sm="12" md="6" lg="6">
            <div className="notice-section-cta__container">
              <p>
                Host your courses and products on Tuturly and get the chance to
                be post on the explore page where your product can be discovered
                by a new audience every single day
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

export default Notification;
