import React from 'react'
import { Container } from 'reactstrap'

import '../ThemePreviewSectionStyles/textimageoverlay.css'

const TextImageOverlaySection = ({
  themeData,
  sectionDetails
}) => {

return <>
    <section
      style= {{
        backgroundColor: sectionDetails.usesecondarycolorscheme === true ? themeData.themedefaultstyles.secondarybackgroundcolor : themeData.themedefaultstyles.primarybackgroundcolor,
      }}
     className="text-overlay-image-background">
        <Container fluid>
           <div className="text-header">
             <div className="header-container">
             <h2 style={{
               color: sectionDetails.usesecondarycolorscheme === true ? themeData.themedefaultstyles.secondarytextcolor : themeData.themedefaultstyles.primarytextcolor,
               fontFamily: themeData.themedefaultstyles.fontfamily
             }} className="text-overlay-header">
               Text Here Could Be Anything. Anything About your School.
              </h2>
             </div>
             <div className="subtitle-container mt-3">
             <p style={{
                color: sectionDetails.usesecondarycolorscheme === true ? themeData.themedefaultstyles.secondarytextcolor : themeData.themedefaultstyles.primarytextcolor,
               fontFamily: themeData.themedefaultstyles.fontfamily
             }} className="text-overlay-subtitle">
              Lorem ipsum dolor sit amet consectetur, adipisicing elit.
                Commodi omnis deserunt facere necessitatibus itaque tempora
                dolorum impedit nam corporis, quae fuga? Aut fugit iusto recusandae in optio nemo molestiae sequi!
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Nesciunt porro ipsa, odit ea, eius
                 incidunt doloribus corporis vel eaque, laborum autem rem reprehenderit totam hic consequuntur veniam? Ullam, laborum modi.
                </p>
             </div>
           </div>
        </Container>
    </section>
   </>
}

export default TextImageOverlaySection
