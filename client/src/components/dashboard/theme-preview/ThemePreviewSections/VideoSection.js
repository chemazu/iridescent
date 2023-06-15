import React, { useState, useEffect } from 'react'
import ReactPlayer from 'react-player'

import '../ThemePreviewSectionStyles/videosection.css'

const VideoSection = ({
  themeData,
  sectionDetails
}) => {

  const [ width, setWindowWidth ] = useState(0)

  useEffect(() => {
    window.addEventListener('resize', () => {
      const width = window.innerWidth
      setWindowWidth(width)
    })

    return () => {
      window.removeEventListener('resize', () => {
        const width = window.innerWidth
        setWindowWidth(width)
      })
    }

  }, [])

  const videoContainerDefaultStyles = width < 767 ? {
    width: '100%',
    height: '94%',
    position: 'relative',
  } : {
    width: '80%',
    height: '85%',
    margin: '0 auto',
    position: 'relative',
  }
  
  // const videoContainerToggleFullScreenStyle = {
  //   width: '100%',
  //   height: '94%',
  //   position: 'relative',
  // }

  return <>
    <section style={{
       backgroundColor: sectionDetails.usesecondarycolorscheme === true ? themeData.themedefaultstyles.secondarybackgroundcolor : themeData.themedefaultstyles.primarybackgroundcolor,
    }} className="video-section">

        <h3 style={{
          color: sectionDetails.usesecondarycolorscheme === true ? themeData.themedefaultstyles.secondarytextcolor : themeData.themedefaultstyles.primarytextcolor,
          fontFamily: themeData.themedefaultstyles.fontfamily
        }} className='video-intro-text text-center'>
          Video Introduction Here, let your students know what to expect.
        </h3>
      <div style={videoContainerDefaultStyles} className="video-container mb-3">
        <ReactPlayer
          url='https://res.cloudinary.com/kolaniyi/video/upload/v1644594734/tuturly/Default%20Section%20Assets/The_Cinematic_Orchestra_-_Arrival_of_The_Birds_Transformation_ryssby.mp4'
          width={"100%"}
          height={"100%"}
          controls={true}
          className='react-player'
           config={{
            file:{
                attributes:{
                    crossOrigin:"anonymous"
                }
            }
        }}
        >
        </ReactPlayer>
      </div>
    </section>
  </>
}

export default VideoSection
