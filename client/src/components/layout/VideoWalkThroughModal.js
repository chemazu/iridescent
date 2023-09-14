import React, { useState, useEffect } from "react";
import { connect, useDispatch } from "react-redux";
import {
  DISPLAY_TUTORIALS_MODAL,
  LOAD_ACTIVE_TUTORIAL,
} from "../../actions/types";
import { useHistory } from "react-router-dom";
import axios from "axios";
import { useAlert } from "react-alert";
import { Modal, Row } from "reactstrap";
import { UPDATE_USER_VIDEO_WALKTHROUGH_MODAL_CLOSE } from "../../actions/types";
import VideoWalkThroughItem from "./VideoWalkThroughItem";
import setAuthToken from "../../utilities/setAuthToken";

import "../../custom-styles/layout/videowalkthroughmodal.css";

const VideoWalkThroughModal = ({ displaywalkthrough }) => {
  const [tutorials, setTutorials] = useState([]);
  const [loading, setLoading] = useState(true);
  const history = useHistory();
  const alert = useAlert();
  const dispatch = useDispatch();

  const markDisplayWalkThroughAsRead = async () => {
    if (localStorage.getItem("token")) {
      setAuthToken(localStorage.getItem("token"));
    }
    try {
      await axios.put("/api/v1/user/dashboard/markdisplaywalkasseen");
    } catch (error) {
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

  const closeAddNewSectionModal = () => {
    dispatch({ type: UPDATE_USER_VIDEO_WALKTHROUGH_MODAL_CLOSE });
    markDisplayWalkThroughAsRead();
  };

  const getTutorialsWalkthrough = async () => {
    try {
      const res = await axios.get("/api/v1/tutorial?count=4");
      setTutorials(res.data);
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

  const videoWalkThroughItemClickHandler = (tutorial) => {
    closeAddNewSectionModal();
    dispatch({
      type: LOAD_ACTIVE_TUTORIAL,
      payload: tutorial,
    });
    dispatch({ type: DISPLAY_TUTORIALS_MODAL });
  };

  const viewAllClickHandler = () => {
    closeAddNewSectionModal();
    history.push("/dashboard/tutorials");
  };

  useEffect(() => {
    getTutorialsWalkthrough();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Modal isOpen={displaywalkthrough} size="lg" backdrop fade>
      <div className="modal-custom__header-container">
        <div className="modal-custom__header">
          <h3 className="text-center">Tuturly Dashboard Tutorials</h3>
        </div>
        <div
          className="close-Videowalkthrough-modal"
          onClick={closeAddNewSectionModal}
        >
          <i className="fas fa-times"></i>
        </div>
      </div>
      <p className="text-center modal-text-subject">
        Learn to navigate through your tutors dashboard
      </p>
      <div className="modal-body">
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
            <div className="tutorial-walkthrough-container">
              <Row>
                {tutorials.map((tutorial) => (
                  <VideoWalkThroughItem
                    key={tutorial._id}
                    tutorial={tutorial}
                    videoWalkThroughItemClickHandler={
                      videoWalkThroughItemClickHandler
                    }
                  />
                ))}
              </Row>
            </div>
          </>
        )}
      </div>
      <div className="modal-custom__footer">
        <h5 onClick={viewAllClickHandler} className="text-center">
          View All
        </h5>
      </div>
    </Modal>
  );
};

const mapStateToProps = (state) => ({
  displaywalkthrough: state?.auth?.user?.displaywalkthrough,
});

export default connect(mapStateToProps)(VideoWalkThroughModal);
