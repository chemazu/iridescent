import React from "react";
import { Col } from "reactstrap";

const VideoWalkThroughItem = ({
  tutorial,
  videoWalkThroughItemClickHandler,
}) => {
  const handleVideoWalkThroughClickEventHandler = () => {
    videoWalkThroughItemClickHandler(tutorial);
  };

  return (
    <Col
      onClick={handleVideoWalkThroughClickEventHandler}
      xs="12"
      sm="12"
      md="6"
      lg="6"
    >
      <div className="video-walkthrough-item">
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

export default VideoWalkThroughItem;
