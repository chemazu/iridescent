import React from "react";
import { Container, Row, Col } from "reactstrap";

import partnerOneLogo from "../../images/partners/partner1.png";
import partnerTwoLogo from "../../images/partners/partner2.png";
import partnerThreeLogo from "../../images/partners/partner3.png";
import partnerFourLogo from "../../images/partners/partner4.png";
import partnerFiveLogo from "../../images/partners/partner5.png";
import partnerSixLogo from "../../images/partners/partner6.png";
import partnerSevenLogo from "../../images/partners/partner7.png";

const Partners = () => {
  return (
    <div className="partners-section">
      <Container fluid className="partners-container">
        <Row className="justify-content-md-between align-items-baseline">
          <Col xs="4" lg="1">
            <div className="partner-logo__container">
              <img src={partnerOneLogo} alt="..." />
            </div>
          </Col>
          <Col xs="4" lg="1">
            <div className="partner-logo__container">
              <img src={partnerTwoLogo} alt="..." />
            </div>
          </Col>
          <Col xs="4" lg="1">
            <div className="partner-logo__container">
              <img src={partnerThreeLogo} alt="..." />
            </div>
          </Col>
          <Col xs="4" lg="1">
            <div className="partner-logo__container">
              <img src={partnerFourLogo} alt="..." />
            </div>
          </Col>
          <Col xs="4" lg="1">
            <div className="partner-logo__container">
              <img src={partnerFiveLogo} alt="..." />
            </div>
          </Col>
          <Col xs="4" lg="1">
            <div className="partner-logo__container">
              <img src={partnerSixLogo} alt="..." />
            </div>
          </Col>
          <Col xs="4" lg="1">
            <div className="partner-logo__container">
              <img src={partnerSevenLogo} alt="..." />
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Partners;
