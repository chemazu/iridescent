import React from 'react'
import { Container, Row,
   Col } from 'reactstrap'

import '../ThemePreviewSectionStyles/threecolumnimagegallery.css'

const ThreeColumnImageGallery = ({
  themeData,
  sectionDetails
}) => {

  return <>
     <section style={{
      backgroundColor: sectionDetails.usesecondarycolorscheme === true ? themeData.themedefaultstyles.secondarybackgroundcolor : themeData.themedefaultstyles.primarybackgroundcolor,
     }} className="image-gallery">
       
        <Container fluid>
        <div className="image-gallery-title">
         <h3 className='mt-2 mb-4' style={{
           color: sectionDetails.usesecondarycolorscheme === true ? themeData.themedefaultstyles.secondarytextcolor : themeData.themedefaultstyles.primarytextcolor,
           fontFamily: themeData.themedefaultstyles.fontfamily
         }}>
           Text Explaining what the image gallery is all about
         </h3>
       </div>
          <Row>
            <Col xs="12" sm="6" md="4" lg="4" className='mb-1'>
              <div className="gallery-img-item">
                <img 
                src={themeData.defaultassets.defaultgalleryimage1}
                 alt="..." className="img-fluid"
                  />
              </div>
            </Col>
            <Col xs="12" sm="6" md="4" lg="4" className='mb-1'>
            <div className="gallery-img-item">
                <img 
                src={themeData.defaultassets.defaultgalleryimage2}
                 alt="..." className="img-fluid"
                  />
              </div>
            </Col>
            <Col xs="12" sm="6" md="4" lg="4" className='mb-1'>
            <div className="gallery-img-item">
                <img 
                src={themeData.defaultassets.defaultgalleryimage3}
                 alt="..." className="img-fluid"
                  />
              </div>
            </Col>
          </Row>
        </Container>
     </section>
  </>
}

export default ThreeColumnImageGallery
