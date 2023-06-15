import React from "react";
import { useHistory } from "react-router-dom";
import { Button, Modal } from "reactstrap";
import { connect, useDispatch } from "react-redux";
import { useAlert } from "react-alert";
import { UPDATE_USER_NEW_FEATURE_MODAL_CLOSE } from "../../actions/types";
import axios from "axios";
import setAuthToken from "../../utilities/setAuthToken";

import Logo from "../../images/tuturlySvgLogo.svg";
import confetti from "../../images/confetti.png";

import "../../custom-styles/layout/newfeatureannouncementmodal.css";

const NewFeatureAnnouncementModal = ({ showNewFeatureModal }) => {
  const dispatch = useDispatch();
  const alert = useAlert();
  const history = useHistory();

  const markNewFeatureAnnouncementMessageAsSeen = async () => {
    if (localStorage.getItem("token")) {
      setAuthToken(localStorage.getItem("token"));
    }
    try {
      await axios.put("/api/v1/user/dashboard/marknewfeatureasseen");
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

  const closeNewSectionModal = async () => {
    await markNewFeatureAnnouncementMessageAsSeen();
    dispatch({
      type: UPDATE_USER_NEW_FEATURE_MODAL_CLOSE,
    });
  };

  const handleNewAnnouncementCreateButton = () => {
    closeNewSectionModal();
    history.push("/dashboard/products");
  };

  const handleNewAnnouncementCancelButton = () => {
    closeNewSectionModal();
  };

  return (
    <>
      <Modal isOpen={showNewFeatureModal} centered size="md">
        <div className="modal-body new-feature-modal__content">
          <div className="new-feature-icon-container">
            <img src={Logo} alt="..." className="img-fluid new-feature-logo" />
          </div>
          <h4 className="text-center new-feature-annoucement__text">
            We are pleased to introduce to you, the new feature added to your
            dashboard.
          </h4>
          <div className="new-feature-confetti__container mb-4">
            <img
              src={confetti}
              className="img-fluid confetti-styles"
              alt="..."
            />
            <p className="text-center new-feature-confetti-text mt-4">
              You can now create and sell digital products on Tuturly
            </p>
          </div>
        </div>
        <div className="modal-footer">
          <Button
            onClick={handleNewAnnouncementCreateButton}
            block
            className="modal-btn-style new-feature-create__btn"
          >
            Create product
          </Button>
          <Button
            block
            className="modal-btn-style-outline new-feature-cancel__btn"
            onClick={handleNewAnnouncementCancelButton}
          >
            Cancel
          </Button>
        </div>
      </Modal>
    </>
  );
};

const mapStateToProps = (state) => ({
  showNewFeatureModal: state?.auth?.user?.showNewFeatureAnnouncementModal,
});

export default connect(mapStateToProps)(NewFeatureAnnouncementModal);
