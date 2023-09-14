import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { Container, Row,
   Col, Button,
   Modal, UncontrolledCollapse,
   Input, FormGroup,
   Label  } from 'reactstrap'
import setAuthToken from '../../../utilities/setAuthToken'
import { useAlert } from 'react-alert'

import '../SectionStyles/threecolumnimagegallery.css'

const ThreeColumnImageGallery = ({
  themeData,
  backendSectionData,
  isAuthenticated,
  isPreviewMode,
  openAddNewSectionModal,
  displayUpdateLoader,
  removeUpdateLoader,
  updateSectionAfterBackendSubmit,
  handleSectionDelete,
 handleBackToDashboard
}) => {

    const [ sectionData, setsectionData ] = useState(null)
    const [ displaySectionModal, setDisplaySectionModal ] = useState(false)
    const [ deleteModalConfirmation, setDeleteModalConfirmation ] = useState(false)
    const uploadGalleryImageRefImageOne = useRef()
    const uploadGalleryImageRefImageTwo = useRef()
    const uploadGalleryImageRefImageThree = useRef()

    const alert = useAlert()

    const [ formData, setFormData ] = useState({
       header: '',
       imagefileone: null,
       imagefiletwo: null,
       imagefilethree: null,
       useSecondaryColorScheme: false,
    })

    const { header, useSecondaryColorScheme } = formData

    const addNewSectionModal = () => {
      openAddNewSectionModal(backendSectionData.position)
    }

    const handleDeleteBtnClick = () => {
      setDeleteModalConfirmation(false)
      handleSectionDelete(backendSectionData._id)
    }

    const toggleUseSecondaryColorScheme = () => {
      setFormData({
        ...formData,
        useSecondaryColorScheme: !useSecondaryColorScheme
      })
    }

    const handleImageFileUploadImageOne = (e) => {
      if(e.target.files.length === 0){
        setFormData({
          ...formData,
          imagefileone: null
        })
      }

    const fileSize = e?.target?.files[0]?.size / 1024 / 1024 // file size in mb
      if(fileSize > 30){
        return alert.show("File Size exceeds maximum limit, choose another file", {
          type:"error"
      })
    }

    setFormData({
      ...formData,
      imagefileone:  e.target.files[0]
    })
  }

  const handleImageFileUploadImageTwo = (e) => {
    if(e.target.files.length === 0){
      setFormData({
        ...formData,
        imagefiletwo: null
      })
    }

   const fileSize = e?.target?.files[0]?.size / 1024 / 1024 // file size in mb
    if(fileSize > 30){
      return alert.show("File Size exceeds maximum limit, choose another file", {
        type:"error"
    })
  }

  setFormData({
    ...formData,
    imagefiletwo:  e.target.files[0]
   })
  }

  const handleImageFileUploadImageThree = (e) => {
    if(e.target.files.length === 0){
      setFormData({
        ...formData,
        imagefilethree: null
      })
    }

    const fileSize = e?.target?.files[0]?.size / 1024 / 1024 // file size in mb
    if(fileSize > 30){
      return alert.show("File Size exceeds maximum limit, choose another file", {
        type:"error"
    })
  }

  setFormData({
    ...formData,
    imagefilethree:  e.target.files[0]
   })
  }
  
  const updateFormFields = (e) =>  setFormData({
    ...formData,
    [e.target.name]: e.target.value
  })

  const handleBtnFileUploadClickImageOne = () => uploadGalleryImageRefImageOne.current.click()
  const handleBtnFileUploadClickImageTwo = () => uploadGalleryImageRefImageTwo.current.click()
  const handleBtnFileUploadClickImageThree = () => uploadGalleryImageRefImageThree.current.click()

  const handleBtnSaveUpdate = async () => {
    setDisplaySectionModal(false)
    displayUpdateLoader()
    if (formData.header.length === 0) {
        removeUpdateLoader()
        return alert.show('Section Header cannot be empty', {
          type: 'error'
        })
    }
    try {
      const formField = new FormData()
      formField.append('header', header)
      formField.append('useSecondaryColorScheme', useSecondaryColorScheme)

      if(formData.imagefileone !== null){
        formField.append('imagefileone', formData.imagefileone)
      }

      if(formData.imagefiletwo !== null){
        formField.append('imagefiletwo', formData.imagefiletwo)
      }

      if(formData.imagefilethree !== null){
        formField.append('imagefilethree', formData.imagefilethree)
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
      const res = await axios.put(`/api/v1/section/${backendSectionData._id}/threeimagegallery`, body, config)
      updateSectionAfterBackendSubmit(res.data)
      setFormData({
        ...formData,
        imagefileone: null,
        imagefiletwo: null,
        imagefilethree: null
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
    }
  }
  
  useEffect(() => {
    if(backendSectionData){
      setsectionData(backendSectionData?.galleryimageurls)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
   if(backendSectionData){
    setsectionData(backendSectionData?.galleryimageurls)
   }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backendSectionData])

  useEffect(() => {
    if(sectionData){
      setFormData({
        header: sectionData?.header !== undefined ? sectionData.header : '',
        useSecondaryColorScheme: backendSectionData.isusingsecondarystyles
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionData])

  return <>
     <section style={{
      backgroundColor: backendSectionData.isusingsecondarystyles === true ? themeData.themestyles.secondarybackgroundcolor : themeData.themestyles.primarybackgroundcolor
     }} className="image-gallery">
        {
              isAuthenticated === true && isPreviewMode === true && <>
              <div className='gallery-section-overlay'>
                <div className='gallery-overlay-controls text-center'>
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
        <Container fluid>
        <div className="image-gallery-title">
         <h3 className='mt-2 mb-4' style={{
           color: backendSectionData.isusingsecondarystyles === true ? themeData.themestyles.secondarytextcolor : themeData.themestyles.primarytextcolor,
           fontFamily: themeData.themestyles.fontfamily
         }}>{
           sectionData != null && sectionData?.header?.length > 0 ? sectionData?.header : "Text Explaining what the image gallery is all about"
         }</h3>
       </div>
          <Row>
            {
              sectionData != null ? <>
              {
              <>
                <Col xs="12" sm="6" md="4" lg="4" className='mb-1'>
                <div className="gallery-img-item">
                  <img 
                  src={
                    sectionData?.imageone?.length > 0 ? sectionData?.imageone :
                     themeData.defaultassets.defaultgalleryimage1
                      }
                   alt="..." className="img-fluid"
                    />
                </div>
              </Col>
              <Col xs="12" sm="6" md="4" lg="4" className='mb-1'>
                <div className="gallery-img-item">
                  <img 
                  src={ sectionData?.imagetwo?.length > 0 ? sectionData?.imagetwo :
                    themeData.defaultassets.defaultgalleryimage2
                     }
                   alt="..." className="img-fluid"
                    />
                </div>
              </Col>
              <Col xs="12" sm="6" md="4" lg="4" className='mb-1'>
                <div className="gallery-img-item">
                  <img 
                  src={ sectionData?.imagethree?.length > 0 ? sectionData?.imagethree :
                    themeData.defaultassets.defaultgalleryimage3
                     }
                   alt="..." className="img-fluid"
                    />
                </div>
              </Col>
              </>
              }
          </> : <>
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
              </>
            }
          </Row>
        </Container>
     </section>

    {/* edit section modal  */}
    <Modal
       isOpen={displaySectionModal}
       size="md"
       centered
     >
        <div className="modal-header header-design">
            <h3>Update Section</h3>
            <div onClick={() => setDisplaySectionModal(false)} className="close-container"><i className="fas fa-times"></i></div>
        </div>
        <div className="modal-body">
            {/* section modal body  */}

            <div className="container-settings">
             <div id='update-header-toggler' className="toggle-action-launcher">
                      <div className="toggle-action-text">
                        Update Section Header
                      </div>
                      <div className="toggle-action-icon">
                        <i className="fas fa-caret-down"></i>
                      </div>
              </div>
              <UncontrolledCollapse toggler='#update-header-toggler'>
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
                </UncontrolledCollapse>
             </div>

             <div className="container-settings">
             <div id='update-image-toggler' className="toggle-action-launcher">
                      <div className="toggle-action-text">
                        Update Section Images
                      </div>
                      <div className="toggle-action-icon">
                        <i className="fas fa-caret-down"></i>
                      </div>
              </div>
              <UncontrolledCollapse toggler='#update-image-toggler'>
                <Label>Upload Images:</Label>
                  <FormGroup>
                  <p className="small">Upload Image In First Tile.</p>
                  <Button onClick={handleBtnFileUploadClickImageOne}>Click To Upload</Button>
                    <input onChange={handleImageFileUploadImageOne} ref={uploadGalleryImageRefImageOne} style={{
                      display:'none'
                    }} type='file'></input>
                    {
                      formData.imagefileone !== null && <small className='mt-3 mb-2' style={{
                        color:'tomato',
                        display:'block'
                      }}>
                        { formData.imagefileone?.name}
                      </small>
                    }
                    </FormGroup>
                    <FormGroup>
                      <p className="small">Upload Image In Second Tile</p>
                     <Button onClick={handleBtnFileUploadClickImageTwo}>Click To Upload</Button>
                    <input onChange={handleImageFileUploadImageTwo} ref={uploadGalleryImageRefImageTwo} style={{
                      display:'none'
                    }} type='file' multiple></input>
                    {
                     formData.imagefiletwo !== null && <small className='mt-3 mb-2' style={{
                      color:'tomato',
                      display:'block'
                    }}>
                      { formData.imagefiletwo?.name}
                    </small>
                    }
                    </FormGroup>
                    <FormGroup>
                      <p className="small">Upload Image In Third Tile.</p>
                    <Button onClick={handleBtnFileUploadClickImageThree}>Click To Upload</Button>
                    <input onChange={handleImageFileUploadImageThree} ref={uploadGalleryImageRefImageThree} style={{
                      display:'none'
                    }} type='file' multiple></input>
                    {
                      formData.imagefilethree !== null && <small className='mt-3 mb-2' style={{
                        color:'tomato',
                        display:'block'
                      }}>
                        { formData.imagefilethree?.name}
                      </small>
                    }
                  </FormGroup>
                </UncontrolledCollapse>
             </div>

             <div className="container-settings">
             <div id='update-background-toggler' className="toggle-action-launcher">
                      <div className="toggle-action-text">
                        Update Section Background
                      </div>
                      <div className="toggle-action-icon">
                        <i className="fas fa-caret-down"></i>
                      </div>
              </div>
              <UncontrolledCollapse toggler='#update-background-toggler'>
                  <FormGroup>
                  <p>Use Secondary Color Scheme:</p>
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

export default ThreeColumnImageGallery
