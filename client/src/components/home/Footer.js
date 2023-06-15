import React from "react";
import { Col, Row, Container } from "reactstrap";
import { Link } from "react-router-dom";

import logo from "../../images/tuturlySVGHomeLogo.svg";

const Footer = () => {
  return (
    <>
      <footer className="footer">
        <Container
          fluid
          className="mt-4 mb-3"
          style={{
            width: "80%",
          }}
        >
          <Row>
            <Col className="mb-4" xs="12" sm="12" md="12" lg="6" xl="6">
              <div className="tuturly-basic__info">
                <div className="tuturly-logo-container">
                  <img src={logo} alt="..." />
                </div>
                <br />
                <div className="tuturly-footer-links">
                  <Link to="/signup">Signup</Link>
                  <Link to="/signin">Login</Link>
                  <Link>Support</Link>
                </div>
              </div>
            </Col>
            <Col xs="12" sm="12" md="12" lg="6" xl="6">
              <div className="tuturly-contact">
                <div className="footer-socail-links">
                  <a href="https://www.instagram.com" target="_blanck">
                    <i className="fab fa-instagram"></i>
                  </a>
                  <a href="https://www.instagram.com" target="_blanck">
                    <i className="fas fa-comment-alt"></i>
                  </a>
                  <a href="https://www.twitter.com" target="_blanck">
                    <i className="fab fa-twitter"></i>
                  </a>
                  <a href="https://www.facebook.com" target="_blanck">
                    <i className="fab fa-facebook-f"></i>
                  </a>
                </div>
              </div>
            </Col>
          </Row>
          <div className="text-center copyright-text">
            copyright &copy; {new Date().getFullYear()} Tuturly - All rights
            reserved
          </div>
        </Container>
      </footer>
    </>
  );
};

export default Footer;
