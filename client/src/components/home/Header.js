import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { Container, Button, Row, Col } from "reactstrap";
import { useAlert } from "react-alert";

import heroImage from "../../images/home-page-images/tuthero.svg";

import HomepageNavbar from "../layout/HomepageNavbar";

const Header = () => {
  const [email, setEmail] = useState("");
  const alert = useAlert();
  const history = useHistory();

  const handleSignInButtonClick = () => {
    if (email.length === 0) {
      return alert.show("Email Field Cannot be Empty.");
    }
    localStorage.setItem("userEmail", email);
    history.push("/signup");
  };

  return (
    <>
      <section className="home-hero-section">
        <HomepageNavbar />
        <div className="hero-info">
          <Container fluid className="hero-container">
            <Row>
              <Col data-aos="fade-right" xs="12" sm="12" md="12" lg="7" xl="7">
                <div className="hero-text">
                  <h1 className="site-heading">
                    The Best Tool for Experts to Sell Knowledge
                  </h1>
                  <p className="site-paragraph">
                    <span>Tuturly</span> gives you a unique platform to own your{" "}
                    website and sell your knowledge in different formats
                    including LIVE! sessions.
                  </p>
                  <div className="hero-btn-container">
                    <input
                      type="email"
                      className="email-input"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <Button
                      type="button"
                      className="sign-up-btn"
                      to="/signup"
                      onClick={handleSignInButtonClick}
                    >
                      Get started for free
                    </Button>
                  </div>
                </div>
              </Col>
              <Col data-aos="fade-left" xs="12" sm="12" md="12" lg="5" xl="5">
                <div className="img-container">
                  <LazyLoadImage
                    className="img-fluid hero-img-style"
                    src={heroImage}
                    loading="lazy"
                    alt=""
                  />
                </div>
              </Col>
            </Row>
          </Container>
        </div>
      </section>
    </>
  );
};

export default Header;
