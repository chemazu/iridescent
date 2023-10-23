import React, { useEffect } from "react";
import { Modal } from "reactstrap";

import Header from "./home/Header";
import Partners from "./home/Partners";
import WhyTuturly from "./home/WhyTuturly";
import Special from "./home/Special";
import TuturlyTracking from "./home/TuturlyTracking";
import Audience from "./home/Audience";
import CustomLandingPage from "./home/CustomLandingPage";
import Notice from "./home/Notice";
import Testimonial from "./home/Testimonial";
import Payments from "./home/Payments";
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
      <Partners />
      <WhyTuturly />
      <Special />
      <TuturlyTracking />
      <CustomLandingPage />
      <Payments />
      <Notice />
      <Audience />
      <Testimonial />
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
