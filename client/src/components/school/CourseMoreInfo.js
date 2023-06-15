import React from 'react'

export const CourseMoreInfo = ({
    theme
}) => {
    return <>
    <div className="course-more-info__container">
        <div style={{
            color: theme.themestyles.primarytextcolor
        }} className="info-action-and-icon">
            <i className="fas fa-exclamation-circle mr-3"></i>
            <p className="info-text">About this course</p>
        </div>     
        <div style={{
            color: theme.themestyles.primarytextcolor
        }} className="info-action-and-icon">
            <i className="fas fa-share-alt mr-3"></i>
            <p className="info-text">Share this course</p>
        </div>      
        <div style={{
            color: theme.themestyles.primarytextcolor
        }} className="info-action-and-icon">
            <i className="fas fa-archive mr-3"></i>
            <p className="info-text">Archive</p>
        </div>      
        <div style={{
            color: theme.themestyles.primarytextcolor
        }} className="info-action-and-icon">
            <i className="far fa-question-circle mr-3"></i>
            <p className="info-text">Q&A</p>
        </div>       
     </div>
    </>
}

export default CourseMoreInfo
