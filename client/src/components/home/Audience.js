import React from "react";
import { Link } from "react-router-dom";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { Row, Col, Container, Button } from "reactstrap";

import whoIsTuturlyFor from "../../images/home-page-images/who-is-tuturly-for.png";

const Audience = () => {
  return (
    <>
      <section className="audience-section">
        <Container className="audience-section__container">
          <Row>
            <Col data-aos="zoom-in" xs="12" sm="12" md="6" lg="6">
              <LazyLoadImage
                src={whoIsTuturlyFor}
                alt="tuturly built for"
                className="img-fluid audience-section-img"
              />
            </Col>
            <Col data-aos="zoom-in-up" xs="12" sm="12" md="6" lg="6">
              <div className="audience-text-container">
                <div>
                  <h2>Who is Tuturly for?</h2>
                  <p>
                    Tuturly is for people from all works of life, that <br />
                    want to earn an honest living by imparting their <br />
                    knowledge through their lectures, <br />
                    tutorials or masterclasses.
                  </p>
                </div>
                <Button className="audience-cta__btn" tag={Link} to="/signup">
                  Get Started for Free
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </>
  );
};

export default Audience;
