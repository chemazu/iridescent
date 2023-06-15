import React, { useState } from "react";
import { connect } from "react-redux";
import { Modal, ModalBody, ModalFooter, Button } from "reactstrap";
import { removeAttachmentFromCourseUnit } from "../../../../actions/courseunit";

export const AttachmentItem = ({
  attachment,
  courseUnitId,
  deleteAttachment,
}) => {
  const [showModal, setShowModal] = useState(false);

  const openModalDialog = () => setShowModal(true);
  const closeModalDialog = () => setShowModal(false);

  const openInNewTab = (url) => {
    window.open(url, "_blank");
  };

  const onDeleteAttachmentClickHandler = () => {
    deleteAttachment(courseUnitId, attachment._id);
    closeModalDialog();
  };

  return (
    <>
      <div className="attachment-item">
        <p className="attachment-item-filename">{attachment.filename}</p>
        <div className="attachment-controls">
          <div onClick={openModalDialog} className="attachment-delete__btn">
            <i className="fas fa-times-circle"></i>
          </div>
          <div
            onClick={() => openInNewTab(attachment.url)}
            className="attachment-delete__btn"
          >
            <i className="fas fa-download"></i>
          </div>
        </div>
      </div>
      <Modal centered isOpen={showModal}>
        <div
          style={{
            fontWeight: "700",
            fontSize: "20",
            color: "#242121",
            textTransform: "uppercase",
          }}
          className="modal-header"
        >
          Delete Attachment
        </div>
        <ModalBody>Are You sure you want to delete this attachment ?</ModalBody>
        <ModalFooter>
          <Button
            className="modal-btn-style-outline"
            style={{
              paddingLeft: "40px",
              paddingRight: "40px",
            }}
            onClick={closeModalDialog}
          >
            Cancel
          </Button>{" "}
          <Button
            className="modal-btn-style"
            onClick={onDeleteAttachmentClickHandler}
            style={{
              paddingLeft: "40px",
              paddingRight: "40px",
            }}
          >
            Delete
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

const mapDispatchToProps = (dispatch) => ({
  deleteAttachment: (courseUnitId, attachmentId) =>
    dispatch(removeAttachmentFromCourseUnit(courseUnitId, attachmentId)),
});

export default connect(null, mapDispatchToProps)(AttachmentItem);
