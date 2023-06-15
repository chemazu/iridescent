import React from 'react'
import { Container, Row, Col } from "reactstrap"

export const About = ({ themeData }) => {
    return <> 
    <section className="about">
      <Container fluid className="about-container">
      <Row>
           <Col sm="3" md="3">
               <div className="about-author">
                   <h3 className="about-author-subtitle">
                       About <span>{themeData.themeschoolname}</span>
                   </h3>
                   <div className="about-img-container">
                    <img src={themeData.instructorimage} alt="author display" 
                    className="img-fluid" />
                   </div>
               </div>
           </Col>
           <Col sm="9" md="9">
               <div className="about-text">
                    <p className="about-text-content">
                        {
                           themeData.abouttext 
                        }
                    </p>
               </div>
           </Col>
       </Row>
      </Container>
    </section>
    </>
}

export default About