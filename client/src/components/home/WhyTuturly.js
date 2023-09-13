import React from "react";
import { Col, Container, Row } from "reactstrap";
import { LazyLoadImage } from "react-lazy-load-image-component";

import whyTuturly from "../../images/home-page-images/why-tuturly.png";
import benefitsOfTuturly from "../../images/home-page-images/benefits.png";

const WhyTuturly = () => {
  return (
    <>
      <section className="why-tuturly">
        <Container fluid className="why-tuturly__container">
          <div className="why-explainer-section">
            <Row>
              <Col data-aos="zoom-in-down" xs="12" sm="12" md="6" lg="6" xl="6">
                <br />
                <br />
                <h2>Why Tuturly?</h2>
                <p>
                  Tuturly was created to make it easy for professionals from all
                  works of life to share their knowledge through generations and
                  earn from it.
                </p>
              </Col>
              <Col data-aos="zoom-in-up" xs="12" sm="12" md="6" lg="6" xl="6">
                <LazyLoadImage
                  src={whyTuturly}
                  className="img-fluid"
                  alt="why tuturly..."
                  // style={{ borderRadius: "10px" }}
                />
              </Col>
            </Row>
          </div>
          <div className="benefits-explainer-section">
            <Row>
              <Col data-aos="zoom-in-down" xs="12" sm="12" md="6" lg="6" xl="6">
                <LazyLoadImage
                  src={benefitsOfTuturly}
                  alt="benefits of tuturly..."
                  className="img-fluid"
                />
              </Col>
              <Col data-aos="zoom-in-up" xs="12" sm="12" md="6" lg="6" xl="6">
                <br />
                <br />
                <h4>Benefits of Tuturly</h4>
                <ul>
                  <li>You own your customizable website.</li>
                  <li>Zero coding knowledge required.</li>
                  <li>Upload large size videos.</li>
                  <li>Interact with your students.</li>
                  <li>Monetize your videos</li>
                </ul>
              </Col>
            </Row>
          </div>
        </Container>
      </section>
    </>
  );
};

export default WhyTuturly;
