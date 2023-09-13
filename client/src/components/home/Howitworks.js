import React from "react";
import { Container, Row, Col, Button } from "reactstrap";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { Link } from "react-router-dom";

import howItWorks1 from "../../images/home-page-images/how-it-works/How-it-works-1.svg";
import howItWorks2 from "../../images/home-page-images/how-it-works/How-it-works-2.svg";
import howItWorks3 from "../../images/home-page-images/how-it-works/How-it-works-3.svg";

const Howitworks = () => {
  return (
    <>
      <section className="how-it-works">
        <Container data-aos="fade-bottom" className="how-it-works__container">
          <h2 className="text-center">How It Works</h2>
          <p className="text-center">
            Easy to set up in <br /> 3 simple steps
          </p>
          <div className="steps-container mt-3">
            <Row>
              <Col xs="12" sm="12" md="12" lg="4" xl="4">
                <div className="how-it-works__item">
                  <div className="how-it-works-item-counter">1</div>
                  <LazyLoadImage
                    src={howItWorks1}
                    alt="how it works"
                    className="img-fluid how-it-works__img"
                  />
                  <p className="how-it-works__text">Create your account</p>
                </div>
              </Col>
              <Col xs="12" sm="12" md="12" lg="4" xl="4">
                <div className="how-it-works__item">
                  <div className="how-it-works-item-counter">2</div>
                  <LazyLoadImage
                    src={howItWorks2}
                    alt="how it works"
                    className="img-fluid how-it-works__img"
                  />
                  <p className="how-it-works__text">Customize your website</p>
                </div>
              </Col>
              <Col xs="12" sm="12" md="12" lg="4" xl="4">
                <div className="how-it-works__item">
                  <div className="how-it-works-item-counter">3</div>
                  <LazyLoadImage
                    src={howItWorks3}
                    alt="how it works"
                    className="img-fluid how-it-works__img"
                  />
                  <p className="how-it-works__text">
                    Upload your first course, share the link & start making
                    money
                  </p>
                </div>
              </Col>
            </Row>
          </div>
          <div className="cta-button-container">
            <Button
              data-aos-anchor-placement="bottom-bottom"
              tag={Link}
              to="/signup"
              className="how-it-works__cta-btn"
            >
              Get started for free
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
};

export default Howitworks;
