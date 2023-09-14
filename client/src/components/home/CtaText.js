import React from "react";
import { Link } from "react-router-dom";
import { Button, Container } from "reactstrap";

const CtaText = () => {
  return (
    <>
      <section className="cta-text__section">
        <Container
          data-aos="fade-up"
          data-aos-anchor-placement="center-bottom"
          className="cta-text__container"
        >
          <h2 className="text-center">
            The Best Ecosystem <br />
            for Online Tutors
          </h2>
          <p data-aos-anchor-placement="center-bottom" className="text-center">
            Get your own website where you can monetize your video content{" "}
            <br />
            without having a single knowledge about coding
          </p>
          <div>
            <div className="cta-text-btn__container">
              <Button tag={Link} to="/signup" className="cta-text__btn">
                Get started for Free.
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
};

export default CtaText;
