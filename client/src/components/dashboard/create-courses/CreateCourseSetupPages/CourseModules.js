import React from 'react'
import { 
    Container, 
    Row, 
    Col
} from "reactstrap"
import DashboardNavbar from '../../DashboardNavbar'
import CourseModuleOrganiser from './CourseModuleOrganiser'


import "../../../../custom-styles/dashboard/dashboardlayout.css"
import "../../../../custom-styles/dashboard/coursemodule.css"

export const CreateCourseModules = () => {
    return <>
        <div className="dashboard-layout">
            <Container fluid>
                <Row>
                <DashboardNavbar />
                 <Col>
                  <div className="page-actions">
                  <h2 className="page-title-color text-center">Create Course Modules</h2>
                  <p className="page-title-color text-center">Organize course curriculum</p>
                   <CourseModuleOrganiser />
                 </div>
                 </Col>
                </Row>
            </Container>
        </div>
    </>
}


export default CreateCourseModules
