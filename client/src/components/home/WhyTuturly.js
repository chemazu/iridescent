import React from "react";
import { Col, Container, Row } from "reactstrap";

import teachable from "../../images/home-page-images/competitors/teachable.png";
import selar from "../../images/home-page-images/competitors/selar.png";
import paypal from "../../images/home-page-images/competitors/paypal.png";
import zoom from "../../images/home-page-images/competitors/zoom.png";
import calendly from "../../images/home-page-images/competitors/calendly.png";
import telegram from "../../images/home-page-images/competitors/telegram.png";
import plusIcon from "../../images/home-page-images/plus-icon.png";
import logo from "../../images/tuturlySvgLogo.svg";

const WhyTuturly = () => {
  return (
    <>
      <section className="why-tuturly">
        <Container fluid className="why-tuturly__container">
          <h2 className="intro-header">
            Trusted by individuals and teams across the globe
          </h2>
          <h2 className="intro-header">about</h2>
          <h2 className="usage-count-header">7000+</h2>
          <h2 className="intro-header">Academies</h2>

          <div className="usage-info__container">
            <h3>
              Before you would need all these to <br /> interact and sell to
              your audience
            </h3>
            <Row className="justify-content-sm-between align-items-baseline mt-3">
              <Col xs="4" lg="1">
                <div className="why-tuturly-icon__container">
                  <img src={teachable} alt="..." className="img-fluid" />
                  <p>Courses</p>
                </div>
              </Col>
              {/* plus icon  */}
              <Col xs="4" lg="1" className="why-tuturly-plus-icon__col">
                <div className="why-tuturly-plus-icon__container">
                  <img src={plusIcon} alt="..." className="img-fluid" />
                </div>
              </Col>
              {/* plus icon end  */}
              <Col xs="4" lg="1">
                <div className="why-tuturly-icon__container">
                  <img src={selar} alt="..." className="img-fluid" />
                  <p>Ebooks</p>
                </div>
              </Col>
              {/* plus icon  */}
              <Col xs="4" lg="1" className="why-tuturly-plus-icon__col">
                <div className="why-tuturly-plus-icon__container">
                  <img src={plusIcon} alt="..." className="img-fluid" />
                </div>
              </Col>
              {/* plus icon end */}
              <Col xs="4" lg="1">
                <div className="why-tuturly-icon__container">
                  <img src={paypal} alt="..." className="img-fluid" />
                  <p>Payments</p>
                </div>
              </Col>
              {/* plus icon  */}
              <Col xs="4" lg="1" className="why-tuturly-plus-icon__col">
                <div className="why-tuturly-plus-icon__container">
                  <img src={plusIcon} alt="..." className="img-fluid" />
                </div>
              </Col>
              {/* plus icon end */}
              <Col xs="4" lg="1">
                <div className="why-tuturly-icon__container">
                  <img src={zoom} alt="..." className="img-fluid" />
                  <p>Live</p>
                </div>
              </Col>
              {/* plus icon  */}
              <Col xs="4" lg="1" className="why-tuturly-plus-icon__col">
                <div className="why-tuturly-plus-icon__container">
                  <img src={plusIcon} alt="..." className="img-fluid" />
                </div>
              </Col>
              {/* plus icon end */}
              <Col xs="4" lg="1">
                <div className="why-tuturly-icon__container">
                  <img src={calendly} alt="..." className="img-fluid" />
                  <p>Scheduling</p>
                </div>
              </Col>
              {/* plus icon  */}
              <Col xs="4" lg="1" className="why-tuturly-plus-icon__col">
                <div className="why-tuturly-plus-icon__container">
                  <img src={plusIcon} alt="..." className="img-fluid" />
                </div>
              </Col>
              {/* plus icon  end */}
              <Col xs="4" lg="1">
                <div className="why-tuturly-icon__container">
                  <img src={telegram} alt="..." className="img-fluid" />
                  <p>Community</p>
                </div>
              </Col>
            </Row>
            <div className="why-tuturly-logo">
              <h4>Now all you need is</h4>
              <img src={logo} className="img-fluid" alt="..." />
            </div>
          </div>
        </Container>
      </section>
    </>
  );
};

export default WhyTuturly;
