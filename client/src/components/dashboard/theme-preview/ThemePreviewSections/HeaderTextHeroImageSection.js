import React from 'react'

import '../ThemePreviewSectionStyles/headertextheroimage.css'

const HeaderTextHeroImageSection = ({
    themeData,
    sectionDetails
}) => {

  return <>
    <section style={{
        backgroundImage: `url(${themeData.defaultassets.defaultheaderheroimage})`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        backgroundColor: 'rgba(0,0,0,0.566)',
        backgroundBlendMode: 'darken'
    }} className='header-text-hero-image'>

        <div className="headerTextHeroImage-section__contents">
            <div style={{
                    backgroundColor: sectionDetails.usesecondarycolorscheme === true ? themeData.themedefaultstyles.secondarybackgroundcolor : themeData.themedefaultstyles.primarybackgroundcolor,
              }} className="segmented-social-links-container">
                  <div className="first-segment">

                  </div>
                  <div className="second-segment">
                  <div 
                  style={{
                    backgroundColor: sectionDetails.usesecondarycolorscheme === true ? themeData.themedefaultstyles.secondarybackgroundcolor : themeData.themedefaultstyles.primarybackgroundcolor,
                  }}
                   className="headerTextHeroImage__social-links">
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
              </div>
                </div>

              <div className="headerTextHeroImage__secondary-contents">
                  <div className="headerTextHeroImage__text-contents">
                        <h2 style={{
                            color: sectionDetails.usesecondarycolorscheme === true ? themeData.themedefaultstyles.secondarytextcolor : themeData.themedefaultstyles.primarytextcolor,
                            fontFamily: themeData.themedefaultstyles.fontfamily
                        }}>
                           'Learn How To Control And Expand Your Business'
                        </h2>
                        <p style={{
                             color: sectionDetails.usesecondarycolorscheme === true ? themeData.themedefaultstyles.secondarytextcolor : themeData.themedefaultstyles.primarytextcolor,
                            fontFamily: themeData.themedefaultstyles.fontfamily
                        }} className='lead'>
                              Lorem ipsum dolor sit amet consectetur adipisicing elit.
                              Ad sequi odit, quisquam dolore illum tenetur magni quam rerum sint qui
                              corrupti dignissimos velit ea beatae molestias! Quod quasi modi quo.
                        </p>
                  </div>        
                  <div className="headerTextHeroImage__form-container">

                  </div>
            </div>
            </div>
    </section>
  </>
}

export default HeaderTextHeroImageSection
