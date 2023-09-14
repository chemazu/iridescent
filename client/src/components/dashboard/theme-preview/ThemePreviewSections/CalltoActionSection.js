import React from 'react'
import { 
  Button,
  Container,
} from "reactstrap"

import '../ThemePreviewSectionStyles/callToAction.css'

const CalltoActionSection = ({
  themeData,
  previewId,
  sectionDetails
}) => {

  return <>
      <section style={{
              backgroundImage: `url(${themeData.defaultassets.defaultcalltoactionheroimage})`,
              backgroundSize:'cover',
              backgroundRepeat:'no-repeat',
              backgroundAttachment:'fixed',
              backgroundPosition:'bottom',
              width:'100%',
              height:'70vh',
              backgroundColor: 'rgba(0,0,0,0.566)',
              backgroundBlendMode:'darken',
              paddingTop:'11vh',
            }}
            className="callToAction"
            >
          <Container fluid className="callToAction-container-styles">
            <div className="callToAction-contents">
            <div className="callToAction-section-socail-links">
                      <a target="_blank" rel="noreferrer" href='https://www.twitter.com' className="social-icon-item" style={{
                        color: sectionDetails.usesecondarycolorscheme === true ? themeData.themedefaultstyles.secondarytextcolor : themeData.themedefaultstyles.primarytextcolor
                      }}>
                      <i className="fab fa-twitter"></i>
                      </a>
                      <a target="_blank" rel="noreferrer" href='https://www.youtube.com' className="social-icon-item" 
                       style={{
                        color: sectionDetails.usesecondarycolorscheme === true ? themeData.themedefaultstyles.secondarytextcolor : themeData.themedefaultstyles.primarytextcolor
                      }}
                       >
                       <i className="fab fa-youtube"></i>
                       </a>
                       <a target="_blank" rel="noreferrer" href='https://www.google.com' className="social-icon-item" style={{
                        color: sectionDetails.usesecondarycolorscheme === true ? themeData.themedefaultstyles.secondarytextcolor : themeData.themedefaultstyles.primarytextcolor
                        }}>
                      <i class="fab fa-google"></i>
                     </a>
                     <a target="_blank" rel="noreferrer" href='https://www.instagram.com' className="social-icon-item" style={{
                       color: sectionDetails.usesecondarycolorscheme === true ? themeData.themedefaultstyles.secondarytextcolor : themeData.themedefaultstyles.primarytextcolor
                      }}>
                      <i className="fab fa-instagram"></i>
                      </a>
                      <a target="_blank" rel="noreferrer" href='https://www.facebook.com' className="social-icon-item" style={{
                        color: sectionDetails.usesecondarycolorscheme === true ? themeData.themedefaultstyles.secondarytextcolor : themeData.themedefaultstyles.primarytextcolor
                      }}>
                     <i className="fab fa-facebook"></i>
                    </a>
            </div>
            <div className="callToAction-section-school-info">
                <h1 style={{
                   color: sectionDetails.usesecondarycolorscheme === true ? themeData.themedefaultstyles.secondarytextcolor : themeData.themedefaultstyles.primarytextcolor,
                   fontFamily: themeData.themedefaultstyles.fontfamily
                }} className="callToAction-header">
                 This is the call to action main header. Include Call To Action Phrase Here.
                </h1>
                <p style={{
                   color: sectionDetails.usesecondarycolorscheme === true ? themeData.themedefaultstyles.secondarytextcolor : themeData.themedefaultstyles.primarytextcolor,
                   fontFamily: themeData.themedefaultstyles.fontfamily
                }} className="callToAction-subtitle">
                  This is the call to Call to action subtitles text. this part contains more information on what you want your student to do!
                </p>
                  <Button style={{
                  color: themeData.themedefaultstyles.buttontextcolor,
                  borderRadius: themeData.themedefaultstyles.buttonborderradius,
                  backgroundColor: themeData.themedefaultstyles.buttonbackgroundcolor
                }} target="_blank" rel="noreferrer" href={`/dashboard/customize/theme/preview/${previewId}`} className="btn callToAction-btn-link">
                    Enroll
                </Button>
            </div>
            </div>
          </Container>

        </section>
  </>
}

export default CalltoActionSection
