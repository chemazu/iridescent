import React from "react";

const TutorAttachmentInStudentDashboard = ({ attachment }) => {
  const openInNewTab = (url) => {
    window.open(url, "_blank").focus();
  };

  return (
    <div className="tutor-attachment__item">
      <p className="tutor-attachment__item-name">{attachment.filename}</p>
      <div
        onClick={() => openInNewTab(attachment.url)}
        className="tutor-attachment__item-download-btn"
      >
        <i className="fas fa-download"></i>
      </div>
    </div>
  );
};

export default TutorAttachmentInStudentDashboard;
