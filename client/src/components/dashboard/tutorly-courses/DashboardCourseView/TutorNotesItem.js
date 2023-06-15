import React, { useState } from "react";
import { Modal, Button } from "reactstrap";
import format from "../../../../utilities/format";

const TutorNotesItem = ({
  note,
  handleDeleteNote,
  videoJsPlayerRef,
  scrollToVideo,
}) => {
  const [displayDeleteModal, setDisplayDeleteModal] = useState(false);
  const toggleDeleteModal = () => setDisplayDeleteModal(!displayDeleteModal);

  const handleGoToTimestamp = () => {
    videoJsPlayerRef.current.currentTime(note.timestamp);
    scrollToVideo();
  };

  return (
    <>
      <div className="tutor-notes-item">
        <div className="tutor-notes-item__timestamp mr-1">
          {format(note.timestamp)}
        </div>
        <div className="tutor-notes-item__content">
          <div onClick={toggleDeleteModal} className="tutor-notes-delete-btn">
            <i className="fas fa-times"></i>
          </div>
          <div
            style={{
              margin: "10px",
            }}
            onClick={handleGoToTimestamp}
          >
            {note.text}
          </div>
        </div>
      </div>
      <Modal isOpen={displayDeleteModal} toggle={toggleDeleteModal} centered>
        <div className="modal-header">Delete Note!</div>
        <div className="modal-body">
          <p className="text-center">
            Are You sure you want to Delete This Note?
          </p>
        </div>
        <div className="modal-footer">
          <Button
            block
            className="modal-btn-style-outline"
            onClick={toggleDeleteModal}
          >
            Cancel
          </Button>
          <Button
            block
            className="modal-btn-style mb-2"
            onClick={() => handleDeleteNote(note._id)}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default TutorNotesItem;
