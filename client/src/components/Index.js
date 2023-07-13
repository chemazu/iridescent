import React, { useEffect } from "react";
import { Modal } from "reactstrap";

import Header from "./home/Header";
import Howitworks from "./home/Howitworks";
import WhyTuturly from "./home/WhyTuturly";
import Tools from "./home/Tools";
import Audience from "./home/Audience";
import Faq from "./home/Faq";
import CtaText from "./home/CtaText";
import Footer from "./home/Footer";

import "../../src/custom-styles/index.css";

export const Index = ({ match: { params } }) => {
  useEffect(() => {
    if (params.ref_code_name) {
      localStorage.setItem("ref", params.ref_code_name);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Header />
      <Howitworks />
      <WhyTuturly />
      <Tools />
      <Audience />
      <Faq />
      <CtaText />
      <Footer />
      <Modal isOpen={false} centered>
        <div className="modal-body">
          <p>This should show up in production though...</p>
        </div>
      </Modal>
    </>
  );
};

export default Index;
