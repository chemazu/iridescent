import React from 'react'
import HeroSection from "./HeroSetion"
import CourseList from "./CourseList"
import About from "./About"
import Contact from "./Contact"
import Footer from "./Footer"

import "./hero-theme-styles.css"

export const LandingPage = ({ themeData, courses, coursesLoading, school }) => {
    return <>
        <HeroSection themeData={themeData} school={school} />
        <CourseList school={school} themeData={themeData} courses={courses} coursesLoading={coursesLoading} />
        <About themeData={themeData} />
        <Contact themeData={themeData} />
        <Footer themeData={themeData} />
    </>
}

export default LandingPage