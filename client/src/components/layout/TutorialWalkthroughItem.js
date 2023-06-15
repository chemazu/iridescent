import React from "react";
import { useDispatch, connect } from "react-redux";
import { LOAD_ACTIVE_TUTORIAL } from "../../actions/types";

const TutorialWalkthroughItem = ({ tutorial, activeTutorial }) => {
  const dispatch = useDispatch();

  const loadActiveTutorial = () => {
    dispatch({
      type: LOAD_ACTIVE_TUTORIAL,
      payload: tutorial,
    });
  };

  return (
    <div
      onClick={loadActiveTutorial}
      className={`more-walkthroughs__item ${
        activeTutorial._id === tutorial._id && "tutorial-item-active"
      }`}
    >
      <div className="tutorial-item-img__container">
        <img
          src={`https://img.youtube.com/vi/${tutorial.videoId}/maxresdefault.jpg`}
          className="img-fluid"
          alt="tutorial item"
        />
      </div>
      <div className="tutorial-item__details">
        <p className="tutorial-title">{tutorial.title}</p>
        <p className="tutorial-duration">{tutorial.duration}</p>
      </div>
    </div>
  );
};

const mapStateToProps = (state) => ({
  activeTutorial: state.tutorials.activeVideo,
});

export default connect(mapStateToProps)(TutorialWalkthroughItem);
