import React, { useState, useEffect } from 'react'
import { Container, Button, Modal,
   UncontrolledCollapse, FormGroup, Input, Label } from 'reactstrap'
import { useAlert } from 'react-alert'

import '../SectionStyles/textimageoverlay.css'
import setAuthToken from '../../../utilities/setAuthToken'
import axios from 'axios'

const TextImageOverlaySection = ({
  themeData,
  isAuthenticated,
  isPreviewMode,
  backendSectionData,
  openAddNewSectionModal,
  displayUpdateLoader,
  removeUpdateLoader,
  handleSectionDelete,
  updateSectionAfterBackendSubmit,
  handleBackToDashboard
}) => {

  const [ sectionData, setSectionData ] = useState(null)
  const [ displaySectionModal, setDisplaySectionModal ] = useState(false)
  const alert = useAlert()
  const [ deleteModalConfirmation, setDeleteModalConfirmation ] = useState(false)
  const [ formData, setFormData ] = useState({
      headertext: '',
      text: '',
      useSecondaryColorScheme: false,
  })

  const { headertext, text, useSecondaryColorScheme } = formData

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

  const toggleUseSecondaryColorScheme = () => {
    setFormData({
      ...formData,
      useSecondaryColorScheme: !useSecondaryColorScheme
    })
}

const handleBtnSaveUpdate = async () => {
    setDisplaySectionModal(false)
    displayUpdateLoader()

    if(formData.headertext.length === 0){
      removeUpdateLoader()
      setDisplaySectionModal(true)
      return alert.show('Section Header Text cannot be empty', {
        type: 'error'
      })
    }

    if(formData.text.length === 0){
      removeUpdateLoader()
      setDisplaySectionModal(true)
      return alert.show('Section Text cannot be empty', {
        type: 'error'
      })
    }
    try {

        if(localStorage.getItem('token')){
           setAuthToken(localStorage.getItem('token'))
        }

        const config = {
          headers: {
            'Content-Type': 'application/json'
          }
        }

        const body = JSON.stringify({
          headertext: headertext,
          text: text,
          useSecondaryColorScheme: useSecondaryColorScheme
        })
        const res = await axios.put(`/api/v1/section/${backendSectionData._id}/textoverlay`, body, config)
        updateSectionAfterBackendSubmit(res.data)
        removeUpdateLoader()
    } catch (error) {
      console.log(error)
      removeUpdateLoader()
      const errors = error?.response?.data?.errors
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
    setSectionData(backendSectionData?.textimageoverlay)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    setSectionData(backendSectionData?.textimageoverlay)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backendSectionData])

  useEffect(() => {
    if(sectionData){
      setFormData({
        headertext: sectionData?.headertext !== undefined ? sectionData?.headertext : '',
        text: sectionData?.text !== undefined ? sectionData?.text : '',
        useSecondaryColorScheme: backendSectionData.isusingsecondarystyles
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionData])

  // const defaultSectionStyle = {
  //   backgroundColor:themeData.themestyles.primarybackgroundcolor,
  // }

  // const sectionStyleWithImageBackdrop = {
  //   backgroundImage: sectionData?.imageurl,
  //   backgroundSize:'cover',
  //   backgroundRepeat:'no-repeat',
  //   backgroundAttachment:'fixed',
  //   backgroundPosition:'bottom',
  // }

return <>
    <section
      style= {{
        backgroundColor: backendSectionData.isusingsecondarystyles === true ? themeData.themestyles.secondarybackgroundcolor : themeData.themestyles.primarybackgroundcolor
      }}
    className="text-overlay-image-background">
        {
           isAuthenticated === true && isPreviewMode === true && <>
           <div className='text-image-section-overlay'>
             <div className='text-image-Controls text-center'>
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
           <div className="text-header">
             <div className="header-container">
             <h2 style={{
               color: backendSectionData.isusingsecondarystyles === true ? themeData.themestyles.secondarytextcolor : themeData.themestyles.primarytextcolor,
               fontFamily: themeData.themestyles.fontfamily
             }} className="text-overlay-header">
               {
                 sectionData != null && sectionData?.headertext.length > 0 ? sectionData?.headertext : "Text Here Could Be Anything. Anything About your School."
               }
              </h2>
             </div>
             <div className="subtitle-container mt-3">
             <p style={{
               color: backendSectionData.isusingsecondarystyles === true ? themeData.themestyles.secondarytextcolor : themeData.themestyles.primarytextcolor,
               fontFamily: themeData.themestyles.fontfamily
             }} className="text-overlay-subtitle">
                {
                  sectionData != null && sectionData?.text.length > 0 ? sectionData?.text : <>
                     Lorem ipsum dolor sit amet consectetur, adipisicing elit.
                Commodi omnis deserunt facere necessitatibus itaque tempora
                dolorum impedit nam corporis, quae fuga? Aut fugit iusto recusandae in optio nemo molestiae sequi!
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Nesciunt porro ipsa, odit ea, eius
                 incidunt doloribus corporis vel eaque, laborum autem rem reprehenderit totam hic consequuntur veniam? Ullam, laborum modi.
                  </>
                }
                </p>
             </div>
           </div>
        </Container>
    </section>

    {/* update section modal starts here  */}
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
                    <Label>Header Text: <span className='compulsory-indicator'>*</span></Label>
                    <Input
                      className='form-group__settings'
                      placeholder='Section Header Text'
                      type='text'
                      value={headertext}
                      name='headertext'
                      onChange={e => updateFormFields(e)}
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>Description: <span className='compulsory-indicator'>*</span></Label>
                    <Input
                      className='form-group__settings'
                      placeholder='Section Text'
                      type='textarea'
                      rows='4'
                      value={text}
                      name="text"
                      onChange={e => updateFormFields(e)}
                    />
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

export default TextImageOverlaySection
