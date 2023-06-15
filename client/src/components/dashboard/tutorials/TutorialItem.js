import React from "react";
import { Col } from "reactstrap";

const TutorialItem = ({ tutorial, tutorialItemUpdateClickHandler }) => {
  const handleTutorialItemClickEventHandler = () => {
    tutorialItemUpdateClickHandler(tutorial);
  };

  return (
    <Col
      onClick={handleTutorialItemClickEventHandler}
      xs="12"
      sm="12"
      md="6"
      lg="4"
    >
      <div className="tutorial-item">
        <img
          src={`https://img.youtube.com/vi/${tutorial.videoId}/maxresdefault.jpg`}
          className="img-fluid"
          alt="..."
        />
        <p>{tutorial.title}</p>
      </div>
    </Col>
  );
};

export default TutorialItem;
