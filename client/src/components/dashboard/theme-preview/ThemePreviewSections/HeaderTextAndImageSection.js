import React from 'react'

import '../ThemePreviewSectionStyles/headertextandimage.css'

const HeaderTextAndImageSection = ({
    themeData,
    sectionDetails
}) => {

  return <> 
    <section style={{
         backgroundColor: sectionDetails.usesecondarycolorscheme === true ? themeData.themedefaultstyles.secondarybackgroundcolor : themeData.themedefaultstyles.primarybackgroundcolor,
    }} className="header-imagetext-section">

        <div className="image-text-content__container">
           <div className="header-text__social-links">
              <a target="_blank" rel="noreferrer" href={`https://${themeData.twitterurl}`} className="social-icon-item" style={{
                       color: sectionDetails.usesecondarycolorscheme === true ? themeData.themedefaultstyles.secondarytextcolor : themeData.themedefaultstyles.primarytextcolor
                    }}>
                    <i className="fab fa-twitter"></i>
               </a>
               <a target="_blank" rel="noreferrer" href={`https://${themeData.youtubeurl}`} className="social-icon-item" 
                      style={{
                        color: sectionDetails.usesecondarycolorscheme === true ? themeData.themedefaultstyles.secondarytextcolor : themeData.themedefaultstyles.primarytextcolor
                    }}
                      >
                      <i className="fab fa-youtube"></i>
                </a>
                <a target="_blank" rel="noreferrer" href={`https://${themeData.googleurl}`} className="social-icon-item" style={{
                    color: sectionDetails.usesecondarycolorscheme === true ? themeData.themedefaultstyles.secondarytextcolor : themeData.themedefaultstyles.primarytextcolor
                    }}>
                    <i className="fab fa-google"></i>
                  </a>
                  <a target="_blank" rel="noreferrer" href={`https://${themeData.instagramurl}`} className="social-icon-item" style={{
                     color: sectionDetails.usesecondarycolorscheme === true ? themeData.themedefaultstyles.secondarytextcolor : themeData.themedefaultstyles.primarytextcolor
                    }}>
                    <i className="fab fa-instagram"></i>
                    </a>
                  <a target="_blank" rel="noreferrer" href={`https://${themeData.facebookurl}`} className="social-icon-item" style={{
                   color: sectionDetails.usesecondarycolorscheme === true ? themeData.themedefaultstyles.secondarytextcolor : themeData.themedefaultstyles.primarytextcolor
                  }}>
                    <i className="fab fa-facebook"></i>
                </a>
              </div>
          <div className="image-text__container">
            <div className="header-text-container">
              <h2 style={{
                color: sectionDetails.usesecondarycolorscheme === true ? themeData.themedefaultstyles.secondarytextcolor : themeData.themedefaultstyles.primarytextcolor,
                fontFamily: themeData.themedefaultstyles.fontfamily
              }}>
                Being the strategic part of the page that people see in the first seconds of loading a website, a header acts as a kind of invitation.
              </h2>
              <p style={{
                color: sectionDetails.usesecondarycolorscheme === true ? themeData.themedefaultstyles.secondarytextcolor : themeData.themedefaultstyles.primarytextcolor,
                fontFamily: themeData.themedefaultstyles.fontfamily
              }}>
                Lorem, ipsum dolor sit amet consectetur adipisicing elit. Qui, natus? Est sapiente quasi voluptates voluptatem recusandae sint dicta debitis porro eligendi veritatis repellendus aut nemo ipsa maxime mollitia, temporibus voluptatum?
              </p>
              </div>
              <div className="header-image-container">
                <img src={themeData.defaultassets.defaultheadertextandimage} alt='...' />
              </div>
          </div>       
        </div>
    </section>
  </>
}

export default HeaderTextAndImageSection
