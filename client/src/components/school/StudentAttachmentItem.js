import React from 'react'

import '../../custom-styles/pages/components/student-attachment-item.css'

const StudentAttachmentItem = ({ attachment, theme }) => {

    const openInNewTab = (url) => {
        window.open(url, '_blank').focus();
    }

    return <>
    <div className="student-attachment__item">   
        <p style={{
            color: theme.themestyles.primarytextcolor
        }} className="student-attachment__item-name">{attachment.filename}</p>

        <div onClick={() => openInNewTab(attachment.url)}
         style={{
            color: theme.themestyles.primarytextcolor
         }}
         className="student-attachment__item-download-btn">
          <i className="fas fa-download"></i>
        </div>
    </div>
    </>
}

export default StudentAttachmentItem