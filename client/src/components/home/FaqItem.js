import React from "react";
import { UncontrolledCollapse, Card, CardBody } from "reactstrap";

const FaqItems = ({ question, answer, togglerNumber }) => {
  return (
    <>
      <div data-aos="zoom-out" className="faq-item">
        <div id={`toggler${togglerNumber}`} className="faq-item__header">
          <div className="item-title">{question}</div>
          <div className="item-icon-indicator">
            <i className="fas fa-chevron-circle-down"></i>
          </div>
        </div>
        <UncontrolledCollapse toggler={`toggler${togglerNumber}`}>
          <Card>
            <CardBody>{answer}</CardBody>
          </Card>
        </UncontrolledCollapse>
      </div>
    </>
  );
};

export default FaqItems;
