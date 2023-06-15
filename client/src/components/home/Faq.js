import React from "react";
import { Container } from "reactstrap";

import FaqItem from "./FaqItem";

const Faq = () => {
  return (
    <>
      <section className="faq-section">
        <h1 className="header-1">
          Frequently Asked Questions <span>(FAQ)</span>
        </h1>

        <Container
          style={{
            width: "75%",
          }}
          fluid
          className="mt-6"
        >
          <FaqItem
            question="Do I get a URL to my website?"
            answer="Yes you would get your personalised URL.
                 when you are done with setting up your website,
                  you can find your link on your tutor's dashboard. 
                  you can then copy this link and share."
            togglerNumber={1}
          />
          <FaqItem
            question="How do I withdraw my earnings?"
            answer="To withdraw your earnings, go to the payments section
                 of the tutor's dashboard and click on the withdraw 
                 tab, add the bank details you wish to receive payment 
                 and then select the bank in your list of added banks 
                 to make a withdrawal."
            togglerNumber={2}
          />
          <FaqItem
            question="Can I upload multiple courses?"
            answer="Yes you can. You can upload multiple courses on Tuturly Basic 
                and Tuturly Enterprise but
                 not on the Tuturly Free plan"
            togglerNumber={3}
          />
          <FaqItem
            question="Can I have my logo on my website?"
            answer="Yes you can, it is part of the requirements when setting up your website."
            togglerNumber={4}
          />
          <FaqItem
            question="How much storage size do I have to upload my courses?"
            answer="Your storage size depends on your Tuturly plan.
                 You get 5GB on Tuturly Free, 30GB on Tuturly Basic and 50GB on Tuturly Enterprise."
            togglerNumber={5}
          />

          {/* <h3 className='text-center mt-5 mb-5 further-enquiries-header'>
            If you have a Question that isn't above, you can send  it in an email to <span className='mail-info'>
            info@tuturly.com
            </span>
            <span className='newline-span'> and we would reply your Question via email</span>
        </h3> */}
        </Container>
      </section>
    </>
  );
};

export default Faq;
