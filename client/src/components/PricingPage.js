import React from "react";
import { Container, Row, Col, Button } from "reactstrap";
import { Link } from "react-router-dom";
import PublicPageNavbar from "./layout/PublicPageNavbar";

import "../custom-styles/publicpages/pricingpage.css";

const PricingPage = () => {
  return (
    <>
      <PublicPageNavbar />
      <section className="user-plans">
        <h3 className="text-center">Select a Tuturly Plan</h3>
        <Container className="mt-4">
          <Row className="d-flex justify-content-md-center">
            <Col className="mb-2" xs="12" sm="12" md="12" lg="4" xl="4">
              <div className="payment-plan__item">
                <div className="payment-plan__first-item-header">
                  <p className="plan-name text-center">Tuturly Free</p>
                  <h3 className="plan-price__tag text-center">Free</h3>
                </div>
                <div className="item-body">
                  <ul>
                    <li>
                      <span className="course-counter-span__landing-page">
                        1
                      </span>{" "}
                      Course Upload <br />
                      <span>(200MB/Video)</span>
                    </li>
                    <li>400 Megabytes Storage space.</li>
                    <li>Unlimited Students</li>
                    <li>Instant Payout</li>
                    <li>Course Design Templates</li>
                    <li>20% Commission/Sale</li>
                  </ul>
                  <Button className="btn-select__plan" tag={Link} to="/signin">
                    Select
                  </Button>
                </div>
              </div>
            </Col>
            <Col className="mb-2" xs="12" sm="12" md="12" lg="4" xl="4">
              <div className="payment-plan__item">
                <div className="item-header">
                  <p className="plan-name text-center">Tuturly Basic</p>
                  <h3 className="plan-price__tag text-center">&#8358;8,000</h3>
                  <div className="price-tag__extra-info">per month</div>
                </div>
                <div className="item-body">
                  <ul>
                    <li>
                      <span className="course-counter-span__landing-page">
                        10
                      </span>{" "}
                      Courses Upload
                      <span>(200MB/Video)</span>
                    </li>
                    <li>10 Gigabytes Storage space.</li>
                    <li>Unlimited Students</li>
                    <li>Instant Payout</li>
                    <li>Course Design Templates</li>
                    <li>20% Commission/Sale</li>
                  </ul>
                  <Button className="btn-select__plan" tag={Link} to="/signin">
                    Select
                  </Button>
                </div>
              </div>
            </Col>
            <Col className="mb-2" xs="12" sm="12" md="12" lg="4" xl="4">
              <div className="payment-plan__item">
                {/* <div className='percentage-discount'>
                                <span>Save 20% </span>
                                 when you pay per annum
                            </div> */}
                <div className="item-header">
                  <p className="plan-name text-center">Tuturly Enterprise</p>
                  <h3 className="plan-price__tag text-center">&#8358;15,000</h3>
                  <div className="price-tag__extra-info">per month</div>
                </div>
                <div className="item-body">
                  <ul>
                    <li>
                      <span className="course-counter-span__landing-page">
                        25
                      </span>{" "}
                      Courses Upload
                      <span>(200MB/Video)</span>
                    </li>
                    <li>25 Gigabytes Storage space.</li>
                    <li>Unlimited Students</li>
                    <li>Instant Payout</li>
                    <li>Course Design Templates</li>
                    <li>20% Commission/Sale</li>
                  </ul>
                  <Button className="btn-select__plan" tag={Link} to="/signin">
                    Select
                  </Button>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
        <div class="custom-shape-divider-bottom-1651592650">
          <svg
            data-name="Layer 1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path
              d="M600,112.77C268.63,112.77,0,65.52,0,7.23V120H1200V7.23C1200,65.52,931.37,112.77,600,112.77Z"
              class="shape-fill"
            ></path>
          </svg>
        </div>
      </section>
    </>
  );
};

export default PricingPage;
