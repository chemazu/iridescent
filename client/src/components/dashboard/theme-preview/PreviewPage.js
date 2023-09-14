import React, { useState, useEffect } from 'react'
import { connect, useDispatch } from 'react-redux'
import axios from 'axios'
import { useAlert } from 'react-alert'
import { getDefaultSchool } from '../../../actions/school'
import ThemePreviewNavbar from './ThemePreviewNavbar'
import ThemePreviewFooter from './ThemePreviewFooter'
import AdminEditorsNavbar from './AdminEditorsNavbar'

import setAuthToken from '../../../utilities/setAuthToken'

// preview sections imports here
import CalltoActionSection from './ThemePreviewSections/CalltoActionSection'
import CourseListSection from './ThemePreviewSections/CourseListSection'
import HeaderTextAndImageSection from './ThemePreviewSections/HeaderTextAndImageSection'
import HeaderTextHeroImageSection from './ThemePreviewSections/HeaderTextHeroImageSection'
import ImageAndTextSection from './ThemePreviewSections/ImageAndTextSection'
import TextAndChecklistSection from './ThemePreviewSections/TextAndChecklistSection'
import TextImageOverlaySection from './ThemePreviewSections/TextOverlaySection'
import ThreeColumnImageGallery from './ThemePreviewSections/ThreeColumnImageGallery'
import VideoSection from './ThemePreviewSections/VideoSection'

const PreviewPage = ({ match, school: {
    schoolDetails
} }) => {
    
    const [ themePreview, setThemePreview ] = useState(null)
    const [ pageLoading, setPageLoading ] = useState(true)

    const [ schoolCourses, setSchoolCourses ] = useState([])
    const [ coursesLoading, setCoursesLoading ] = useState(false)

    const dispatch = useDispatch()

    const alert = useAlert()

    const getThemePreviewById = async (id) => {
        try {
            if(localStorage.getItem('token')){
                setAuthToken(localStorage.getItem('token'))
            }
            const res = await axios.get(`/api/v1/themepreview/${id}`)
            setThemePreview(res.data)
            setPageLoading(false)
        } catch (error) {
            alert.show(error.message, {
                type: 'error'
            })
        }
    }

    const getCoursesBySchoolName = async (schoolName) => {
        try {
            setCoursesLoading(true)
            const res = await axios.get(`/api/v1/school/courses/${schoolName}`)
            setCoursesLoading(false)
            setSchoolCourses(res.data)
        } catch (error) {
            const errros = error?.response?.data?.errors
            if(errros){
                errros.forEach((error) => alert.show(error.msg, { type:'error'}))
            }
            alert.show(error.message)
            console.log(error)
        }
    }

    const loadSchool = () => {
        dispatch(getDefaultSchool())
    }

    const determineSectionToRenderBySectionName = (sectionName, sectionDetails) => {
        const sectionNameToLowerCase = sectionName.toLowerCase()
        switch (sectionNameToLowerCase) {
            case 'calltoaction':
                return <>
                <CalltoActionSection
                  key={sectionDetails._id}
                  themeData={themePreview} 
                  sectionDetails={sectionDetails}
                  previewId={match.params.themePreviewId}
                />
                </>
            case 'courselist':
                return <>
                <CourseListSection
                    key={sectionDetails._id}
                    themeData={themePreview} 
                    sectionDetails={sectionDetails}
                    previewId={match.params.themePreviewId}
                    coursesLoading={coursesLoading}
                    schoolCourses={schoolCourses} 
                 />     
                </>
            case 'galleryimageurls': 
                 return <>
                    <ThreeColumnImageGallery
                        key={sectionDetails._id}
                        themeData={themePreview} 
                        sectionDetails={sectionDetails}
                        previewId={match.params.themePreviewId}
                    />  
                 </>
            case 'imageandtext': 
                return <>
                <ImageAndTextSection
                    key={sectionDetails._id}
                    themeData={themePreview} 
                    sectionDetails={sectionDetails}
                    previewId={match.params.themePreviewId}
                />      
                </>
            case 'textimageoverlay':
                return <>
                    <TextImageOverlaySection
                     key={sectionDetails._id}
                     themeData={themePreview} 
                     sectionDetails={sectionDetails}
                     previewId={match.params.themePreviewId}
                    />     
                </>
            case 'video': 
                return <>
                    <VideoSection
                        key={sectionDetails._id}
                        themeData={themePreview} 
                        sectionDetails={sectionDetails}
                        previewId={match.params.themePreviewId}
                    />
                    </>
            case 'textandchecklist':
                return <>
                   <TextAndChecklistSection 
                        key={sectionDetails._id}
                        themeData={themePreview} 
                        sectionDetails={sectionDetails}
                        previewId={match.params.themePreviewId}
                    />
                </>
            case 'headertextandimage': 
                return <>   
                    <HeaderTextAndImageSection
                         key={sectionDetails._id}
                         themeData={themePreview} 
                         sectionDetails={sectionDetails}
                         previewId={match.params.themePreviewId}
                    />
                </>
            case 'headertextheroimage':
                return <>
                    <HeaderTextHeroImageSection
                       key={sectionDetails._id}
                       themeData={themePreview} 
                       sectionDetails={sectionDetails}
                       previewId={match.params.themePreviewId}
                    />
                </>
            default:
                return <p className='lead mt-3 mb-3'>Section Not Found!</p>
        }
    }

    useEffect(() => {
        loadSchool()
        // eslint-disable-next-line
    }, [])

    useEffect(() => {
        if(schoolDetails){
            getThemePreviewById(match.params.themePreviewId)
            getCoursesBySchoolName(schoolDetails?.name)
        }
        // eslint-disable-next-line
    }, [schoolDetails])

  return <>
    {
        pageLoading ? <div style={{
            width:'50%',
            margin:'20px auto',
            display:'flex',
            alignItems:'center',
            justifyContent:'center'
        }}>
            <i style={{fontSize:'22px'}} className="fas fa-circle-notch fa-spin"></i>
        </div> : <>
            {
                !pageLoading && themePreview === null ? <p className="text-center lead">Theme Preview Not Found</p> : <>
                    <AdminEditorsNavbar
                        schoolDetails={schoolDetails}
                        idOfThemePreviewInView={match.params.themePreviewId}
                    />
                    <ThemePreviewNavbar 
                    theme={themePreview}
                    previewId={match.params.themePreviewId}
                     />
                     {
                         themePreview.requiredsetions.map((sectionData) => {
                            return determineSectionToRenderBySectionName(sectionData.name, sectionData)
                         })
                     }
                    <ThemePreviewFooter theme={themePreview} />
                </>
            }
        </>
    }
  </>
}

const mapStateToProps = (state) => ({
    school: state.school
})

export default connect(mapStateToProps)(PreviewPage)
