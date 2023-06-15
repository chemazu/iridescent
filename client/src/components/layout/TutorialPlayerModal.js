import React, { useState, useEffect } from "react";
import {
  CLOSE_TUTORIALS_MODAL,
  EMPTY_ACTIVE_TUTORIAL,
  EMPTY_TUTORIAL_LIST,
  LOAD_TUTORIAL_LIST,
} from "../../actions/types";
import { connect, useDispatch } from "react-redux";
import axios from "axios";
// import ReactPlayer from "react-player"
import { Modal } from "reactstrap";
import { useAlert } from "react-alert";
import TutorialWalkthroughItem from "./TutorialWalkthroughItem";

import "../../custom-styles/layout/tutorialplayermodal.css";

const TutorialPlayerModal = ({
  tutorials: { displayPlayer, activeVideo, playerList },
}) => {
  const [loading, setLoading] = useState(true);

  const alert = useAlert();
  const dispatch = useDispatch();
  const handleCloseTutorialsModal = () =>
    dispatch({ type: CLOSE_TUTORIALS_MODAL });

  const getTutorialsWalkthrough = async () => {
    try {
      const res = await axios.get("/api/v1/tutorial");
      dispatch({
        type: LOAD_TUTORIAL_LIST,
        payload: res.data,
      });
      setLoading(false);
    } catch (error) {
      setLoading(false);
      const errors = error.response.data.errors;
      if (errors) {
        return errors.forEach((err) => {
          alert.show(err.msg, {
            type: "error",
          });
        });
      }
      alert.show(error.message, {
        type: "error",
      });
    }
  };

  useEffect(() => {
    getTutorialsWalkthrough();
    return () => {
      dispatch({ type: EMPTY_ACTIVE_TUTORIAL });
      dispatch({ type: EMPTY_TUTORIAL_LIST });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Modal isOpen={displayPlayer} size="lg" backdrop fade>
      {activeVideo === null ? (
        <>
          <div className="display-tutorial-error">
            <p className="text-center">No tutorial selected</p>
          </div>
        </>
      ) : (
        <>
          <div className="modal-header tutorial-modal__header">
            <h3 className="text-center">{activeVideo.title}</h3>
            <div
              className="close-Videowalkthrough-modal"
              onClick={handleCloseTutorialsModal}
            >
              <i className="fas fa-times"></i>
            </div>
          </div>
          <div className="video-player__container">
            <iframe
              className="inline-video-player"
              title="Youtube player"
              sandbox="allow-same-origin allowfullscreen allow-forms allow-scripts allow-presentation"
              src={`https://youtube.com/embed/${activeVideo.videoId}?autoplay=0`}
            ></iframe>
          </div>
          <div className="more-walkthroughs__container">
            <h4>Tutorly Dashboard Tutorials</h4>
            {loading ? (
              <>
                <div className="modal-loader-container">
                  <div
                    style={{
                      width: "50%",
                      margin: "10px auto",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "40px 10px",
                    }}
                  >
                    <i
                      style={{ fontSize: "22px" }}
                      className="fas fa-circle-notch fa-spin"
                    ></i>
                  </div>
                </div>
              </>
            ) : (
              <>
                {playerList.length === 0 ? (
                  <p className="text-center mt-3">No tutorials found.</p>
                ) : (
                  <>
                    {playerList.map((listItem) => (
                      <TutorialWalkthroughItem
                        key={listItem._id}
                        tutorial={listItem}
                      />
                    ))}
                  </>
                )}
              </>
            )}
          </div>
        </>
      )}
    </Modal>
  );
};

const mapStateToProps = (state) => ({
  tutorials: state?.tutorials,
});

export default connect(mapStateToProps)(TutorialPlayerModal);
