import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Col, Container,
   Row, Button, Modal,
   UncontrolledCollapse,
   Input,
   FormGroup,
   Label
  } from 'reactstrap'
  import { useAlert } from 'react-alert'
  import setAuthToken from '../../../utilities/setAuthToken'

import '../SectionStyles/text-checklist.css'

const TextAndChecklistSection = ({
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
  const [ checklisttext, setChecklistText ] = useState('')
  const alert = useAlert()

  const [ formData, setFormData ] = useState({
    text: '',
    checklist: [],
    useSecondaryColorScheme: false,
  })

  const { text, checklist, useSecondaryColorScheme } = formData

  const toggleUseSecondaryColorScheme = () => {
    setFormData({
      ...formData,
      useSecondaryColorScheme: !useSecondaryColorScheme
    })
 }

  const addNewCheckListItem = (text) => {
    if(text.length === 0){
      return alert.show('checklist text cannot be empty', {
        type:'error'
      })
    }
    const textExists = checklist.find((item) => item.toLowerCase() === text.toLowerCase())
    if(textExists){
      return alert.show("Text Item Already exist's", {
        type:'error'
      })
    }
    setFormData({
      ...formData,
      checklist: [ ...formData.checklist, text]
    })
    setChecklistText('')
  }

  const removeCheckListItem = (text) => {
    setFormData({
      ...formData,
      checklist: formData.checklist.filter((listItem) => listItem.toLowerCase() !== text.toLowerCase())
    })
  }

  const updateFormFields = async (e) =>  setFormData({
    ...formData,
    [e.target.name]: e.target.value
  })

  const handleBtnSaveUpdate = async () => {
    setDisplaySectionModal(false)
    displayUpdateLoader()
    if(formData.text.length === 0){
      removeUpdateLoader()
      return alert.show('Section Text cannot be empty', {
        type:'error'
      })
    }
    if(formData.checklist.length === 0){
      removeUpdateLoader()
      return alert.show('Section checklist must have at least 1 item', {
        type:'error'
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
        text: text,
        checklist: checklist,
        useSecondaryColorScheme: useSecondaryColorScheme
      })

      const res = await axios.put(`/api/v1/section/${backendSectionData._id}/textandchecklist`, body, config)
      updateSectionAfterBackendSubmit(res.data)
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

  const addNewSectionModal = () => {
    openAddNewSectionModal(backendSectionData.position)
  }

  const handleDeleteBtnClick = () => {
    setDeleteModalConfirmation(false)
    handleSectionDelete(backendSectionData._id)
  }

  useEffect(() => {
    setSectionData(backendSectionData?.textandchecklist)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    setSectionData(backendSectionData?.textandchecklist)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backendSectionData])

  useEffect(() => {
    if(sectionData){
      setFormData({
        text: sectionData?.text !== undefined ? sectionData.text : '',
        checklist: sectionData?.checklist !== undefined ? sectionData?.checklist.map((item) => item.text) : []
      })
    }
  }, [sectionData])


  return <>
   <section style={{
    backgroundColor: backendSectionData.isusingsecondarystyles === true ? themeData.themestyles.secondarybackgroundcolor : themeData.themestyles.primarybackgroundcolor,
   }} className="text-checklist-section">

        {
          isAuthenticated === true && isPreviewMode === true && <>
          <div className='text-checklist-overlay'>
            <div className='text-checklist-controls text-center'>
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
         <Row>
            <Col xs="12" sm="12" md="7" lg="7">
              <p style={{
                color: backendSectionData.isusingsecondarystyles === true ? themeData.themestyles.secondarytextcolor : themeData.themestyles.primarytextcolor
              }} className="lead">{
                  sectionData != null && sectionData?.text?.length > 0 ? sectionData.text : <>
                Lorem ipsum dolor sit amet
                consectetur adipisicing elit. Illo repellat
                  incidunt modi? Rem, fugiat neque provident
                  atque commodi eaque quibusdam? Quo ipsum dolor officiis 
                  alias eaque laudantium, explicabo odio sequi.
                  </>
              }</p>
            </Col>
            <Col xs="12" sm="12" md="5" lg="5">
                <div className="icon-list">
                {
                  sectionData != null && sectionData?.checklist?.length > 0 ? <>
                      {
                        sectionData?.checklist?.map((listItem) => {
                          return <div key={listItem._id} style={{
                            color: backendSectionData.isusingsecondarystyles === true ? themeData.themestyles.secondarytextcolor : themeData.themestyles.primarytextcolor
                          }} className="icon-item">
                            <div className="icon">
                              <i className={`fas ${listItem.icon}`}></i>
                            </div>
                            <div className="icon-text">{listItem.text}</div>
                          </div>
                        })
                      }
                  </> : <>
                  <div style={{
                   color: backendSectionData.isusingsecondarystyles === true ? themeData.themestyles.secondarytextcolor : themeData.themestyles.primarytextcolor
                  }} className="icon-item">
                    <div className="icon">
                      <i className="fas fa-check"></i>
                    </div>
                    <div className="icon-text">Hello</div>
                  </div>
                  <div style={{
                   color: backendSectionData.isusingsecondarystyles === true ? themeData.themestyles.secondarytextcolor : themeData.themestyles.primarytextcolor
                  }} className="icon-item">
                    <div className="icon">
                      <i className="fas fa-plus"></i>
                    </div>
                    <div className="icon-text">Welcome</div>
                  </div> 
                  <div style={{
                   color: backendSectionData.isusingsecondarystyles === true ? themeData.themestyles.secondarytextcolor : themeData.themestyles.primarytextcolor
                  }} className="icon-item">
                    <div className="icon">
                      <i className="fas fa-times"></i>
                    </div>
                    <div className="icon-text">Get lost</div>
                  </div>
                  <div style={{
                   color: backendSectionData.isusingsecondarystyles === true ? themeData.themestyles.secondarytextcolor : themeData.themestyles.primarytextcolor
                  }} className="icon-item">
                    <div className="icon">
                      <i className="fas fa-check"></i>
                    </div>
                    <div className="icon-text">Hello</div>
                  </div>
                  </>
                }
              </div>
            </Col>
        </Row>
     </Container>
   </section>

   {/* edit section modal starts here  */}
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
          <div className="container-settings">
             <div id='update-text-toggler' className="toggle-action-launcher">
                      <div className="toggle-action-text">
                        Update Section Text
                      </div>
                      <div className="toggle-action-icon">
                        <i className="fas fa-caret-down"></i>
                      </div>
              </div>
              <UncontrolledCollapse toggler='#update-text-toggler'>
                  <FormGroup>
                    <Label>Text: <span className='compulsory-indicator'>*</span></Label>
                    <Input
                      className='form-group__settings'
                      placeholder='Section Text'
                      type='textarea'
                      value={text}
                      name='text'
                      rows="3"
                      onChange={e => updateFormFields(e)}
                    />
                  </FormGroup>
                </UncontrolledCollapse>
             </div>

             <div className="container-settings">
             <div id='update-checklist-toggler' className="toggle-action-launcher">
                      <div className="toggle-action-text">
                        Update Section Checklist
                      </div>
                      <div className="toggle-action-icon">
                        <i className="fas fa-caret-down"></i>
                      </div>
              </div>
              <UncontrolledCollapse toggler='#update-checklist-toggler'>
                  <FormGroup>
                    <Label>Add New List Item: <span className='compulsory-indicator'>*</span></Label>
                    <Input
                      className='form-group__settings'
                      placeholder='Checklist Text'
                      type='text'
                      value={checklisttext}
                      name='checklisttext'
                      onChange={e => setChecklistText(e.target.value)}
                    />
                    <Button block onClick={e => addNewCheckListItem(checklisttext)}>Add</Button>
                    <div className="modal-checklist-container mt-2">
                      {
                       formData.checklist.length === 0 ? <p className='small mt-2 text-center'>
                         checklist data must have at least one item
                       </p> : <>
                        {
                           formData.checklist.map((item) => {
                            return <div key={item} className='modal-checklist-item'>
                               <div className="modal-list-item-text">{item} </div>
                               <div onClick={() => removeCheckListItem(item)} className="modal-list-item-delete"><i className="fas fa-times"></i></div>
                            </div>
                          })
                        }
                       </>
                      }
                    </div>
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

export default TextAndChecklistSection
