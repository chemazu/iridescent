import React, { useState } from "react";
import { Modal, Button } from "reactstrap";
import format from "../../utilities/format";

import "../../custom-styles/pages/components/notesitem.css";

const NotesItem = ({
  note,
  handleDeleteNote,
  videoJsPlayerRef,
  scrollToVideo,
  theme,
}) => {
  const [displayDeleteModal, setDisplayDeleteModal] = useState(false);
  const toggleDeleteModal = () => setDisplayDeleteModal(!displayDeleteModal);

  const handleGoToTimestamp = () => {
    videoJsPlayerRef.current.currentTime(note.timestamp);
    scrollToVideo();
  };

  return (
    <>
      <div className="notes-item">
        <div
          style={{
            color: theme.themestyles.primarytextcolor,
          }}
          className="notes-item__timestamp mr-1"
        >
          {format(note.timestamp)}
        </div>
        <div
          style={{
            backgroundColor: theme.themestyles.coursecardbackgroundcolor,
            color: theme.themestyles.coursecardtextcolor,
          }}
          className="notes-item__content"
        >
          <div
            style={{
              color: theme.themestyles.coursecardtextcolor,
              fontSize: "15px",
            }}
            onClick={toggleDeleteModal}
            className="notes-delete-btn"
          >
            x
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
          <Button onClick={toggleDeleteModal}>Cancel</Button>
          <Button onClick={() => handleDeleteNote(note._id)}>Delete</Button>
        </div>
      </Modal>
    </>
  );
};

export default NotesItem;
