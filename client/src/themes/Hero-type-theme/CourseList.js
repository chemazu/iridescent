import React from 'react'
import { Container, Row } from "reactstrap"
import CourseItem from "./CourseItem"

export const CourseList = ({ themeData, courses, coursesLoading, school }) => {
    return <>
        <section className="course-list">
            <Container fluid className="course-list-container">
                <h3 className="section-title">{themeData.themeschoolname} Course List</h3>
                <div className="course-item-container">
                    <Row>
                        {
                            coursesLoading ? <>
                                <div style={{
                                            width:'50%',
                                            margin:'20px auto',
                                            display:'flex',
                                            alignItems:'center',
                                            justifyContent:'center',
                                            color:'#ffffff'
                                        }}>
                                            <i style={{fontSize:'22px'}} className="fas fa-circle-notch fa-spin"></i>
                                        </div>
                            </> : <>
                                {
                                 courses.length === 0 ? <p style={{
                                     textAlign:'center',
                                     color:'#fff',
                                     width:'100%'
                                 }} className="text-center mb-2 mt-2">course not found</p> : <>{
                                    courses.map((course) => <CourseItem key={course._id} course={course} school={school} />)
                                 }</>
                                }
                            </>
                        }
                    </Row>
                </div>
            <hr className="course-list-hr" />
            </Container>
        </section>
    </>
}

export default CourseList