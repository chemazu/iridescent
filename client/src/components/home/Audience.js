import React from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { Row, Col, Container } from "reactstrap";

import whoIsTuturlyFor from "../../images/home-page-images/who-is-tuturly-for.png";

const Audience = () => {
  return (
    <>
      <section className="audience-section">
        <Container className="audience-section__container">
          <Row className="align-items-center">
            <Col className="d-flex" xs="12" sm="12" md="6" lg="6">
              <LazyLoadImage
                src={whoIsTuturlyFor}
                alt="tuturly built for"
                className="img-fluid audience-section-img"
              />
            </Col>
            <Col xs="12" sm="12" md="6" lg="6">
              <div className="audience-text-container">
                <div>
                  <h2>Who is Tuturly for?</h2>
                  <p>
                    If you're an expert in your craft and want to share your
                    passion with the world, you've come to the right place. We
                    offer a one-stop-shop for all your content needs. Whether
                    you want to host recorded video courses, sell digital
                    products or host live webinars, we've got you covered.
                  </p>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </>
  );
};

export default Audience;
