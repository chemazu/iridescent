import React, { useState, useRef ,useEffect } from 'react'
import axios from 'axios'
import { Button, Modal, UncontrolledCollapse,
   Input, FormGroup, Label } from 'reactstrap'
import { useAlert } from 'react-alert'   
import setAuthToken from '../../../utilities/setAuthToken'

import '../SectionStyles/imageandtext.css'

const ImageAndTextSection = ({
  themeData,
  isAuthenticated,
  isPreviewMode,
  backendSectionData,
  openAddNewSectionModal,
  displayUpdateLoader,
  removeUpdateLoader,
  updateSectionAfterBackendSubmit,
  handleSectionDelete,
  handleBackToDashboard
}) => {

    const [ sectionData, setSectionData ] = useState(null)
    const [ displaySectionModal, setDisplaySectionModal ] = useState(false)
    const uploadBackgroundImageRef = useRef()
    const alert = useAlert()
    const [ deleteModalConfirmation, setDeleteModalConfirmation ] = useState(false)

    const [ formData, setFormData ] = useState({
      header: '',
      subtitle: '',
      description: '',
      imageurl: '',
      useSecondaryColorScheme: false,
      textBeforeImageLayout: false,
      imagefile: null,
    })


    const { header, subtitle,
       description,
        useSecondaryColorScheme, textBeforeImageLayout } = formData

    const handleBtnFileUploadClick = () => uploadBackgroundImageRef.current.click()

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

    const toggleUseSecondaryColorScheme = () => {
      setFormData({
        ...formData,
        useSecondaryColorScheme: !useSecondaryColorScheme
      })
    }

    const toggleSetTextBeforeImageLayout = () => {
      setFormData({
        ...formData,
        textBeforeImageLayout: !textBeforeImageLayout
      })
    }

    const updateFormFields = (e) =>  setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })

    const addNewSectionModal = () => {
      openAddNewSectionModal(backendSectionData.position)
    }

    const handleDeleteBtnClick = () => {
      setDeleteModalConfirmation(false)
      handleSectionDelete(backendSectionData._id)
    }

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
        return alert.show('Section Subtitle cannot be empty', {
          type: 'error'
        })
      }
      if(formData.description.length === 0){
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
          formField.append('description', description)
          formField.append('useSecondaryColorScheme', useSecondaryColorScheme)
          formField.append('textBeforeImageLayout', textBeforeImageLayout)

          if(formData.imagefile){
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
          const res = await axios.put(`/api/v1/section/${backendSectionData._id}/imageandtext`, body, config)
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
     if(backendSectionData){
        setSectionData(backendSectionData?.imageandtext)
        // console.log(sectionData, 'on first render')
     }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
     if(backendSectionData){
        setSectionData(backendSectionData?.imageandtext)
        // console.log(sectionData, 'on second render')
     }
    }, [backendSectionData])
    
    useEffect(() => {
      if(sectionData){
        setFormData({
          header: sectionData?.header !== undefined ? sectionData.header : '',
          subtitle: sectionData?.subtitle !== undefined ? sectionData.subtitle : '',
          description: sectionData?.description !== undefined ? sectionData.description : '',
          useSecondaryColorScheme: backendSectionData.isusingsecondarystyles,
          textBeforeImageLayout: backendSectionData.alternatecolumns
        })
      }
  // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sectionData])

  return <>
    <section className="image-text" style={{
      backgroundColor:  backendSectionData.isusingsecondarystyles === true ? themeData.themestyles.secondarybackgroundcolor :  themeData.themestyles.primarybackgroundcolor
    }}>
      {
              isAuthenticated === true && isPreviewMode === true && <>
              <div className='image-text-section-overlay'>
                <div className='image-text-controls text-center'>
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

          { 
            backendSectionData.alternatecolumns === false ? <>
               <div className="image-text__container--regular-section-standard">
            <div className="image-container-standard">
                  <img src={ sectionData !== null && sectionData?.imageurl?.length > 0 ? sectionData.imageurl : themeData.defaultassets.defaultimageandtextimage }
                    alt='...' 
                  />
            </div>
            <div className="text-container-standard">
              <h3
                style={{
                  color: backendSectionData.isusingsecondarystyles === true ? themeData.themestyles.secondarytextcolor : themeData.themestyles.primarytextcolor,
                  fontFamily: themeData.themestyles.fontfamily
                }}
              className="text-header">
                {
                  sectionData !== null && sectionData?.header.length > 0 ? sectionData?.header : "This is the Header section for the Image/Text Section"
                }
              </h3>
              <p style={{
                color: backendSectionData.isusingsecondarystyles === true ? themeData.themestyles.secondarytextcolor : themeData.themestyles.primarytextcolor,
                fontFamily: themeData.themestyles.fontfamily
              }}>{
                sectionData !== null && sectionData?.subtitle.length > 0 ? sectionData?.subtitle : "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Porro, sapiente inventore soluta aliquid itaque"
              }</p>
                <p style={{
                color: backendSectionData.isusingsecondarystyles === true ? themeData.themestyles.secondarytextcolor : themeData.themestyles.primarytextcolor,
                fontFamily: themeData.themestyles.fontfamily
              }}>
              {
                sectionData !== null && sectionData?.description.length > 0 ? sectionData?.description : <>
                  Lorem ipsum dolor, sit amet consectetur adipisicing elit. Porro, sapiente inventore 
                soluta aliquid itaque molestiae nisi repellendus quidem omnis recusandae, quod dolorum temporibus architecto repudiandae 
                consequatur commodi odio! Consequuntur, quas?
                </>
              } 
              </p>
          </div>
        </div>
            </> : <>
            <div className="image-text__container--regular-section-alternate">
                    <div className="text-container-alternate">
                      <h3
                        style={{
                          color: backendSectionData.isusingsecondarystyles === true ? themeData.themestyles.secondarytextcolor : themeData.themestyles.primarytextcolor,
                          fontFamily: themeData.themestyles.fontfamily
                        }}
                      className="text-header">
                        {
                          sectionData !== null && sectionData?.header.length > 0 ? sectionData?.header : "This is the Header section for the Image/Text Section"
                        }
                      </h3>
                      <p style={{
                        color: backendSectionData.isusingsecondarystyles === true ? themeData.themestyles.secondarytextcolor : themeData.themestyles.primarytextcolor,
                        fontFamily: themeData.themestyles.fontfamily
                      }}>{
                        sectionData !== null && sectionData?.subtitle.length > 0 ? sectionData?.subtitle : "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Porro, sapiente inventore soluta aliquid itaque"
                      }</p>
                        <p style={{
                        color: backendSectionData.isusingsecondarystyles === true ? themeData.themestyles.secondarytextcolor : themeData.themestyles.primarytextcolor,
                        fontFamily: themeData.themestyles.fontfamily
                      }}>
                      {
                        sectionData !== null && sectionData?.description.length > 0 ? sectionData?.description : <>
                          Lorem ipsum dolor, sit amet consectetur adipisicing elit. Porro, sapiente inventore 
                        soluta aliquid itaque molestiae nisi repellendus quidem omnis recusandae, quod dolorum temporibus architecto repudiandae 
                        consequatur commodi odio! Consequuntur, quas?
                        </>
                      } 
                      </p>
                  </div>
                <div className="image-container-alternate">
                    <img src={ sectionData !== null && sectionData?.imageurl?.length > 0 ? sectionData.imageurl : themeData.defaultassets.defaultimageandtextimagealt }
                      alt='...' 
                    />
                </div>
            </div>
            </>
          }
     
    </section>

    {/* update section data modal  */}
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
            {/* modal body beginning  */}

            <div className="container-settings">
              <div id='update-image-toggler' className="toggle-action-launcher">
                      <div className="toggle-action-text">
                        Update Section Image.
                      </div>
                      <div className="toggle-action-icon">
                        <i className="fas fa-caret-down"></i>
                      </div>
               </div>
                <UncontrolledCollapse toggler='#update-image-toggler'>
                   <FormGroup>
                    <div>
                    <Label>Upload Image </Label>
                    </div>
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
                </UncontrolledCollapse>
             </div>

             <div className="container-settings">
             <div id='update-text-toggler' className="toggle-action-launcher">
                      <div className="toggle-action-text">
                        Update Section Text.
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
                      name="header"
                      onChange={e => updateFormFields(e)}
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>Subtitle: <span className='compulsory-indicator'>*</span></Label>
                    <Input
                      className='form-group__settings'
                      placeholder='Section Subtitle'
                      type='text'
                      value={subtitle}
                      name="subtitle"
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
                      value={description}
                      name="description"
                      onChange={e => updateFormFields(e)}
                    />
                  </FormGroup>
                </UncontrolledCollapse>
             </div>
            
             <div className="container-settings">
             <div id='update-section-background-toggler' className="toggle-action-launcher">
                      <div className="toggle-action-text">
                        Update Section Background
                      </div>
                      <div className="toggle-action-icon">
                        <i className="fas fa-caret-down"></i>
                      </div>
              </div>
              <UncontrolledCollapse toggler='#update-section-background-toggler'>
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

             <div className="container-settings">
             <div id='update-section-layout-toggler' className="toggle-action-launcher">
                      <div className="toggle-action-text">
                        Update Section Layout
                      </div>
                      <div className="toggle-action-icon">
                        <i className="fas fa-caret-down"></i>
                      </div>
              </div>
              <UncontrolledCollapse toggler='#update-section-layout-toggler'>
                  <FormGroup>
                    <Label>Set Text Before Image:</Label>
                    <div className="modal-checkbox-toggle">
                        <label class="modal-switch">
                        <input
                        type="checkbox"
                        value={textBeforeImageLayout}
                        checked={textBeforeImageLayout}
                        onChange={toggleSetTextBeforeImageLayout}
                        />
                        <span class="modal-slider modal-round"></span>
                      </label>
                   </div>
                  </FormGroup>
                </UncontrolledCollapse>
             </div>

             {/* modal body ending  */}
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

export default ImageAndTextSection
