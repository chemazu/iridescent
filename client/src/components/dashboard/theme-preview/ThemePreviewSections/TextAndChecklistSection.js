import React from 'react'
import { Container, Row, Col } from 'reactstrap'

import '../ThemePreviewSectionStyles/text-checklist.css'

const TextAndChecklistSection = ({
  themeData,
  sectionDetails
}) => {

  return <>
   <section style={{
    backgroundColor: sectionDetails.usesecondarycolorscheme === true ? themeData.themedefaultstyles.secondarybackgroundcolor : themeData.themedefaultstyles.primarybackgroundcolor,
   }} className="text-checklist-section">

     <Container fluid>
         <Row>
            <Col xs="12" sm="12" md="7" lg="7">
              <p style={{
                color: sectionDetails.usesecondarycolorscheme === true ? themeData.themedefaultstyles.secondarytextcolor : themeData.themedefaultstyles.primarytextcolor,
              }} className="lead">
                Lorem ipsum dolor sit amet
                consectetur adipisicing elit. Illo repellat
                  incidunt modi? Rem, fugiat neque provident
                  atque commodi eaque quibusdam? Quo ipsum dolor officiis 
                  alias eaque laudantium, explicabo odio sequi.
                 </p>
            </Col>
            <Col xs="12" sm="12" md="5" lg="5">
                <div className="icon-list">
                <div style={{
                  color: sectionDetails.usesecondarycolorscheme === true ? themeData.themedefaultstyles.secondarytextcolor : themeData.themedefaultstyles.primarytextcolor,
                  }} className="icon-item">
                    <div className="icon">
                      <i className="fas fa-check"></i>
                    </div>
                    <div className="icon-text">Hello</div>
                  </div>
                  <div style={{
                  color: sectionDetails.usesecondarycolorscheme === true ? themeData.themedefaultstyles.secondarytextcolor : themeData.themedefaultstyles.primarytextcolor,
                  }} className="icon-item">
                    <div className="icon">
                      <i className="fas fa-check"></i>
                    </div>
                    <div className="icon-text">Welcome</div>
                  </div> 
                  <div style={{
                   color: sectionDetails.usesecondarycolorscheme === true ? themeData.themedefaultstyles.secondarytextcolor : themeData.themedefaultstyles.primarytextcolor,
                  }} className="icon-item">
                    <div className="icon">
                      <i className="fas fa-check"></i>
                    </div>
                    <div className="icon-text">Hello</div>
                  </div>
              </div>
            </Col>
        </Row>
     </Container>
   </section>
  </>
}

export default TextAndChecklistSection
