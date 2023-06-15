import React, { useState, useEffect } from "react";
import { SwitchTransition, CSSTransition } from "react-transition-group";
import { Container } from "reactstrap";

import excellentToolTip1 from "../../images/home-page-images/excellent-tools/excellent-tool-1.svg";
import excellentToolTip2 from "../../images/home-page-images/excellent-tools/excellent-tool-2.svg";
import excellentToolTip3 from "../../images/home-page-images/excellent-tools/excellent-tool-3.svg";
import excellentToolTip4 from "../../images/home-page-images/excellent-tools/excellent-tool-4.svg";

import illustratorImage1 from "../../images/home-page-images/illustration-1.svg";
import illustratorImage2 from "../../images/home-page-images/illustration-2.svg";
import illustratorImage3 from "../../images/home-page-images/illustration-3.svg";

const duration = 2000;

const teachCtaListings = [
  {
    id: 1,
    name: "Accounting master-class",
  },
  {
    id: 2,
    name: "Igbo Language",
  },
  {
    id: 3,
    name: "Social Media",
  },
  {
    id: 4,
    name: "Adire making",
  },
  {
    id: 4,
    name: "programming",
  },
  {
    id: 5,
    name: "knitting",
  },
  {
    id: 6,
    name: "Voice training",
  },
  {
    id: 7,
    name: "Baking",
  },
];

const getCtaFromList = (list) => list[Math.floor(Math.random() * list.length)];

const Tools = () => {
  const [courseToTeach, setCourseToTeach] = useState(null);

  const generateWhatToTeachAfterEverySecond = () => {
    setInterval(() => {
      setCourseToTeach(getCtaFromList(teachCtaListings));
    }, duration);
  };

  useEffect(() => {
    generateWhatToTeachAfterEverySecond();
  }, []);

  return (
    <>
      <section className="tools-section">
        <img
          className="tools-illustration-image tools-image-placement2"
          src={illustratorImage2}
          alt="illustration img in tools section"
        />
        <img
          className="tools-illustration-image tools-image-placement3"
          src={illustratorImage3}
          alt="illustration img in tools section"
        />
        <img
          className="tools-illustration-image tools-image-placement1"
          src={illustratorImage1}
          alt="illustration img in tools section"
        />
        <Container data-aos="fade-up" className="tools-section-container">
          <h2 className="text-center">
            Excellent tools to make <br /> your earning faster
          </h2>
          <div className="tools-explainer-container">
            <div className="tools-explainer-row">
              <div className="tools-explainer-item">
                <img src={excellentToolTip1} alt="tuturly tools" />
                <p className="text-center">
                  Analytics keep track <br />
                  of your activities
                </p>
              </div>

              <div className="tools-explainer-item">
                <img src={excellentToolTip2} alt="tuturly tools" />
                <p className="text-center">
                  View and reply to <br />
                  students' messages
                </p>
              </div>
            </div>
          </div>

          <div className="tools-explainer-container">
            <div className="tools-explainer-row">
              <div className="tools-explainer-item">
                <img src={excellentToolTip3} alt="tuturly tools" />
                <p className="text-center">
                  Know your <br /> best-selling course
                </p>
              </div>

              <div className="tools-explainer-item">
                <img src={excellentToolTip4} alt="tuturly tools" />
                <p className="text-center">
                  Withdraw straight <br /> to your bank account
                </p>
              </div>
            </div>
          </div>
          <h3 className="text-center tools-info__h3">
            Join countless other professionals <br />
            and artisans who are already <br />
            making a living by sharing their <br />
            knowledge!
          </h3>

          {courseToTeach !== null && (
            <>
              <div className="tools-transition-container mt-4">
                <p className="tools-p-style">Teach :</p>
                <SwitchTransition>
                  <CSSTransition
                    key={courseToTeach?.id}
                    timeout={duration}
                    classNames="fade"
                  >
                    <p className="tools-p-style-fade">{courseToTeach.name}</p>
                  </CSSTransition>
                </SwitchTransition>
              </div>
            </>
          )}
        </Container>
      </section>
    </>
  );
};

export default Tools;
