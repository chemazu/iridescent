import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { useAlert } from 'react-alert'
import { Button, Modal, 
  FormGroup, Input, Label, UncontrolledCollapse } from 'reactstrap'
import setAuthToken from '../../../utilities/setAuthToken'

import '../SectionStyles/headertextheroimage.css'

const HeaderTextHeroImageSection = ({
    themeData,
    isAuthenticated,
    isPreviewMode,
    backendSectionData,
    openAddNewSectionModal,
    handleSectionDelete,
    displayUpdateLoader,
    removeUpdateLoader,
    updateSectionAfterBackendSubmit,
    handleBackToDashboard
}) => {

    const [ sectionData, setSectionData ] = useState(null)
    const [ displaySectionModal, setDisplaySectionModal ] = useState(false)
    const [ deleteModalConfirmation, setDeleteModalConfirmation ] = useState(false)
    const uploadBackgroundImageRef = useRef()
    const alert = useAlert()

    const [ formData, setFormData ] = useState({
      header: '',
      subtitle: '',
      imagefile: null,
      useSecondaryColorScheme: false,
      showSocialLinks: false
    })

    const handleBtnFileUploadClick = () => uploadBackgroundImageRef.current.click()

    const { header, subtitle, useSecondaryColorScheme, showSocialLinks } = formData
 
    const handleImageFileUpload = (e) => {
      if(e.target.files.length === 0){
        setFormData({
          ...formData,
          imagefile: null
        })
      }
  
      const fileSize = e?.target?.files[0]?.size / 1024 / 1024 // file size in mb
      if(fileSize > 30){
        return alert.show("File Size exceeds maximum limit, choose another file", {
          type:"error"
      })
      }
  
      // const fileType = `.${e.target.files[0].name.split(".")[e.target.files[0].name.split(".").length - 1]}`
      // if(fileType !== '.png' || fileType !== '.jpg' || fileType !== '.jpeg'|| fileType !== '.PNG' || fileType !== '.JPG' || fileType !== '.JPEG'){
      //   return alert.show("thumbnail must be an image", {
      //     type: "error"
      //   })
      // }
  
      setFormData({
        ...formData,
        imagefile: e.target.files[0]
      })
  }

    const toggleShowSocailLink = () => {
        setFormData({
          ...formData,
          showSocialLinks: !showSocialLinks
        })
    }

    const toggleUseSecondaryColorScheme = () => {
        setFormData({
          ...formData,
          useSecondaryColorScheme: !useSecondaryColorScheme
        })
    }

    const addNewSectionModal = () => {
      openAddNewSectionModal(backendSectionData.position)
    }

    const handleDeleteBtnClick = () => {
      setDeleteModalConfirmation(false)
      handleSectionDelete(backendSectionData._id)
    }

    const updateFormFields = (e) =>  setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })

    const handleBtnSaveUpdate = async () => {
      setDisplaySectionModal(false)
      displayUpdateLoader()

      if(formData.header.length === 0){
        removeUpdateLoader()
        setDisplaySectionModal(true)
        return alert.show('Section Header cannot be empty', {
          type: 'error'
        })
      }

      if(formData.subtitle.length === 0){
        removeUpdateLoader()
        setDisplaySectionModal(true)
        return alert.show('Section Description cannot be empty', {
          type: 'error'
        })
      }
      try { 
          const formField = new FormData()
          formField.append('header', header)
          formField.append('subtitle', subtitle)
          formField.append('useSecondaryColorScheme', useSecondaryColorScheme)
          formField.append('showSocialLinks', showSocialLinks)

          if(formData.imagefile !== null){
            formField.append('file', formData.imagefile)
          }

          if(localStorage.getItem('token')){
            setAuthToken(localStorage.getItem('token'))
          }

          const config = {
            headers: {
                "Content-Type": "multipart/form-data"
            }
          }
          const body = formField
          const res = await axios.put(`/api/v1/section/${backendSectionData._id}/headertextheroimage`, body, config)
          updateSectionAfterBackendSubmit(res.data)
          setFormData({
            ...formData,
            imagefile: null
          })
          removeUpdateLoader()
      } catch (error) {
        removeUpdateLoader()
        const errors = error.response.data.errors
        if(errors){
          errors.forEach((error) => {
            alert.show(error.msg, {
              type:'error'
            })
          })
        }
        alert.show(error.message, {
          type:'error'
        })
      }
    }

    useEffect(() => {
        setSectionData(backendSectionData?.headertextheroimage)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
      setSectionData(backendSectionData?.headertextheroimage)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backendSectionData])

  useEffect(() => {
    if(sectionData){
      setFormData({
        header: sectionData?.header !== undefined ? sectionData?.header : '',
        subtitle: sectionData?.subtitle !== undefined ? sectionData?.subtitle : '',
        showSocialLinks: sectionData?.showsociallinks,
        useSecondaryColorScheme: backendSectionData.isusingsecondarystyles
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionData])

  return <>
    <section style={{
        backgroundImage: sectionData != null && sectionData?.heroimageurl?.length > 0 ? `url(${sectionData?.heroimageurl})` : `url(${themeData.defaultassets.defaultheaderheroimage})`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        backgroundColor: 'rgba(0,0,0,0.566)',
        backgroundBlendMode: 'darken'
    }} className='header-text-hero-image'>

         {
           isAuthenticated === true && isPreviewMode === true && <>
           <div className='header-text-hero-image-section-overlay'>
             <div className='header-text-hero-image-Controls text-center'>
               <Button onClick={() => setDisplaySectionModal(true)} block>Edit</Button>
               <Button
               onClick={() => setDeleteModalConfirmation(true)}
              block>Delete</Button>
                 <Button
                  onClick={handleBackToDashboard}
                  block
                  >Back To Dashboard</Button>
             </div>
             <div onClick={addNewSectionModal} className="add-section-btn">
                 <i className="fas fa-plus"></i>
               </div>
           </div>
           </>
        }

             <div className="headerTextHeroImage-section__contents">
                
                {
                    sectionData != null && sectionData?.showsociallinks === true && <>
                        <div style={{
                     backgroundColor: backendSectionData.isusingsecondarystyles === true ? themeData.themestyles.secondarybackgroundcolor : themeData.themestyles.primarybackgroundcolor,
                }} className="segmented-social-links-container">
                    <div className="first-segment">

                    </div>
                    <div className="second-segment">
                    <div 
                    style={{
                      backgroundColor: backendSectionData.isusingsecondarystyles === true ? themeData.themestyles.secondarybackgroundcolor : themeData.themestyles.primarybackgroundcolor,
                    }}
                className="headerTextHeroImage__social-links">
                    {
                      themeData.twitterurl !== 'undefined' && (<a target="_blank" rel="noreferrer" href={`https://${themeData.twitterurl}`} className="social-icon-item" style={{
                        color: backendSectionData.isusingsecondarystyles === true ? themeData.themestyles.secondarytextcolor : themeData.themestyles.primarytextcolor
                    }}>
                    <i className="fab fa-twitter"></i>
                    </a>)
                    }
                    {
                      themeData.youtubeurl !== 'undefined' && (<a target="_blank" rel="noreferrer" href={`https://${themeData.youtubeurl}`} className="social-icon-item" 
                      style={{
                      color: backendSectionData.isusingsecondarystyles === true ? themeData.themestyles.secondarytextcolor : themeData.themestyles.primarytextcolor
                    }}
                      >
                      <i className="fab fa-youtube"></i>
                      </a>)
                    }
                  {
                    themeData.googleurl !== 'undefined' && (<a target="_blank" rel="noreferrer" href={`https://${themeData.googleurl}`} className="social-icon-item" style={{
                      color: backendSectionData.isusingsecondarystyles === true ? themeData.themestyles.secondarytextcolor : themeData.themestyles.primarytextcolor
                    }}>
                    <i className="fab fa-google"></i>
                    </a>)
                  }
                  {
                    themeData.instagramurl !== 'undefined' && (<a target="_blank" rel="noreferrer" href={`https://${themeData.instagramurl}`} className="social-icon-item" style={{
                      color: backendSectionData.isusingsecondarystyles === true ? themeData.themestyles.secondarytextcolor : themeData.themestyles.primarytextcolor
                    }}>
                    <i className="fab fa-instagram"></i>
                    </a>)
                  }
                  {
                    themeData.facebookurl !== 'undefined' && (<a target="_blank" rel="noreferrer" href={`https://${themeData.facebookurl}`} className="social-icon-item" style={{
                    color: backendSectionData.isusingsecondarystyles === true ? themeData.themestyles.secondarytextcolor : themeData.themestyles.primarytextcolor
                  }}>
                    <i className="fab fa-facebook"></i>
                </a>)
                  }
              </div>
                    </div>
                </div>
                    </>
                }
                
              <div className="headerTextHeroImage__secondary-contents">
                  <div className="headerTextHeroImage__text-contents">
                        <h2 style={{
                            color: '#ffffff',
                            // backendSectionData.isusingsecondarystyles === true ? themeData.themestyles.secondarytextcolor : themeData.themestyles.primarytextcolor,
                            fontFamily: themeData.themestyles.fontfamily
                        }}>{
                            sectionData != null && sectionData?.header?.length ? sectionData.header : 'Learn How To Control And Expand Your Business'
                        }</h2>
                        <p style={{
                            color: '#ffffff',
                            // backendSectionData.isusingsecondarystyles === true ? themeData.themestyles.secondarytextcolor : themeData.themestyles.primarytextcolor,
                            fontFamily: themeData.themestyles.fontfamily
                        }} className='lead'>{
                            sectionData != null && sectionData?.subtitle?.length > 0 ? sectionData.subtitle : `
                              Lorem ipsum dolor sit amet consectetur adipisicing elit.
                              Ad sequi odit, quisquam dolore illum tenetur magni quam rerum sint qui
                              corrupti dignissimos velit ea beatae molestias! Quod quasi modi quo.`
                        }</p>
                  </div>        
                  <div className="headerTextHeroImage__form-container">

                  </div>
            </div>
            </div>
    </section>
    <Modal
      isOpen={displaySectionModal}
      size="md"
      centered
      backdrop
      >
         <div className="modal-header header-design">
            <h3>Update Section</h3>
            <div onClick={() => setDisplaySectionModal(false)} className="close-container"><i className="fas fa-times"></i></div>
        </div>
        <div className="modal-body">

        <div className="container-settings">
             <div id='update-text-toggler' className="toggle-action-launcher">
                      <div className="toggle-action-text">
                        Update Section Header And Description
                      </div>
                      <div className="toggle-action-icon">
                        <i className="fas fa-caret-down"></i>
                      </div>
              </div>
              <UncontrolledCollapse toggler='#update-text-toggler'>
                  <FormGroup>
                    <Label>Header: <span className='compulsory-indicator'>*</span></Label>
                    <Input
                      className='form-group__settings'
                      placeholder='Section Header'
                      type='text'
                      value={header}
                      name='header'
                      onChange={e => updateFormFields(e)}
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>Description: <span className='compulsory-indicator'>*</span></Label>
                    <Input
                      className='form-group__settings'
                      placeholder='Section Description'
                      type='textarea'
                      rows='4'
                      value={subtitle}
                      name="subtitle"
                      onChange={e => updateFormFields(e)}
                    />
                  </FormGroup>
                </UncontrolledCollapse>
             </div>

             <div className="container-settings">
             <div id='update-image-toggler' className="toggle-action-launcher">
                      <div className="toggle-action-text">
                        Update Section Background
                      </div>
                      <div className="toggle-action-icon">
                        <i className="fas fa-caret-down"></i>
                      </div>
              </div>
              <UncontrolledCollapse toggler='#update-image-toggler'>
                <Label>Upload Background Image:</Label>
                  <FormGroup>
                    <Button onClick={handleBtnFileUploadClick}>Click To Upload</Button>
                    <input onChange={handleImageFileUpload} ref={uploadBackgroundImageRef} style={{
                      display:'none'
                    }} type='file'></input>
                    {
                      formData.imagefile !== null && <small className='mt-3 mb-2' style={{
                        color:'tomato',
                        display:'block'
                      }}>
                        { formData.imagefile?.name}
                      </small>
                    }
                  </FormGroup>
                  <FormGroup>
                    <Label>Display Social Links:</Label>
                    <div className="modal-checkbox-toggle">
                        <label class="modal-switch">
                        <input
                        type="checkbox"
                        value={showSocialLinks}
                        checked={showSocialLinks}
                        onChange={toggleShowSocailLink}
                        />
                        <span class="modal-slider modal-round"></span>
                      </label>
                   </div>
                  </FormGroup>
                  <FormGroup>
                    <Label>Use Secondary Color Scheme:</Label>
                    <div className="modal-checkbox-toggle">
                        <label class="modal-switch">
                        <input
                        type="checkbox"
                        value={useSecondaryColorScheme}
                        checked={useSecondaryColorScheme}
                        onChange={toggleUseSecondaryColorScheme}
                        />
                        <span class="modal-slider modal-round"></span>
                      </label>
                   </div>
                  </FormGroup>
                </UncontrolledCollapse>
             </div>

        </div>

        <div className="modal-footer">
            <Button onClick={handleBtnSaveUpdate} className="save-button" block>Save</Button>
        </div>
    </Modal>

  {/* delete section modal starts here  */}
    <Modal 
        className="modal-dialog-centered"
        isOpen={deleteModalConfirmation}
        size='md'
        >
          <div className="modal-header delete-section-modal">
            <h3>Delete Section</h3>
            <div 
             onClick={() => setDeleteModalConfirmation(false)} 
            ><i className="fas fa-times"></i></div>
          </div>
          <div className="modal-body">
            <p className="text-center lead confirmation-text">
              Are you sure you want to Delete this section ?
            </p>
          </div>
          <div className="modal-footer">
            <Button 
            block
            onClick={() => setDeleteModalConfirmation(false)}
            className="delete-confimation-cancel"
            >Cancel</Button>
            <Button block onClick={handleDeleteBtnClick}
            className="delete-confirmation-confirm" 
            >Delete</Button>
          </div>
        </Modal>
  </>
}

export default HeaderTextHeroImageSection
