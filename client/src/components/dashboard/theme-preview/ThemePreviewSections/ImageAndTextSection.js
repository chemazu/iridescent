import React from 'react'
import '../ThemePreviewSectionStyles/imageandtext.css'

function ImageAndTextSection({
  themeData,
  sectionDetails
}) {

  return <>
    <section className="image-text" style={{
      backgroundColor: sectionDetails.usesecondarycolorscheme === true ? themeData.themedefaultstyles.secondarybackgroundcolor : themeData.themedefaultstyles.primarybackgroundcolor,
    }}>

      {sectionDetails.alternatecolumns === false ? <>
        <div className="image-text__container--regular-section-standard">
          <div className="image-container-standard">
            <img src={themeData.defaultassets.defaultimageandtextimage}
              alt='...' />
          </div>
          <div className="text-container-standard">
            <h3
              style={{
                color: sectionDetails.usesecondarycolorscheme === true ? themeData.themedefaultstyles.secondarytextcolor : themeData.themedefaultstyles.primarytextcolor,
                fontFamily: themeData.themedefaultstyles.fontfamily
              }}
              className="text-header">
              This is the Header section for the Image/Text Section
            </h3>
            <p style={{
              color: sectionDetails.usesecondarycolorscheme === true ? themeData.themedefaultstyles.secondarytextcolor : themeData.themedefaultstyles.primarytextcolor,
              fontFamily: themeData.themedefaultstyles.fontfamily
            }}>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Porro, sapiente inventore soluta aliquid itaque.
            </p>
            <p style={{
             color: sectionDetails.usesecondarycolorscheme === true ? themeData.themedefaultstyles.secondarytextcolor : themeData.themedefaultstyles.primarytextcolor,
              fontFamily: themeData.themedefaultstyles.fontfamily
            }}>
                Lorem ipsum dolor, sit amet consectetur adipisicing elit. Porro, sapiente inventore
                soluta aliquid itaque molestiae nisi repellendus quidem omnis recusandae, quod dolorum temporibus architecto repudiandae
                consequatur commodi odio! Consequuntur, quas?
            </p>
          </div>
        </div>
      </> : <>
        <div className="image-text__container--regular-section-alternate">
          <div className="text-container-alternate">
            <h3
               style={{
                color: sectionDetails.usesecondarycolorscheme === true ? themeData.themedefaultstyles.secondarytextcolor : themeData.themedefaultstyles.primarytextcolor,
                fontFamily: themeData.themedefaultstyles.fontfamily
              }}
              className="text-header">
              This is the Header section for the Image/Text Section
            </h3>
            <p style={{
              color: sectionDetails.usesecondarycolorscheme === true ? themeData.themedefaultstyles.secondarytextcolor : themeData.themedefaultstyles.primarytextcolor,
              fontFamily: themeData.themedefaultstyles.fontfamily
            }}>
              Lorem ipsum dolor, sit amet consectetur adipisicing elit. Porro, sapiente inventore soluta aliquid itaque
           </p>
            <p style={{
              color: sectionDetails.usesecondarycolorscheme === true ? themeData.themedefaultstyles.secondarytextcolor : themeData.themedefaultstyles.primarytextcolor,
              fontFamily: themeData.themedefaultstyles.fontfamily
            }}>
                Lorem ipsum dolor, sit amet consectetur adipisicing elit. Porro, sapiente inventore
                soluta aliquid itaque molestiae nisi repellendus quidem omnis recusandae, quod dolorum temporibus architecto repudiandae
                consequatur commodi odio! Consequuntur, quas?
            </p>
          </div>
          <div className="image-container-alternate">
            <img src={themeData.defaultassets.defaultimageandtextimagealt}
              alt='...' />
          </div>
        </div>
      </>}

    </section>
  </>
}

export default ImageAndTextSection
