import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useAlert } from 'react-alert'
import { useDispatch } from 'react-redux'
import { Container } from 'reactstrap'
import Skeleton from "react-loading-skeleton"
import SetupPageNavbar from "../layout/SetupPageNavbar"
import { stopLoading, startLoading } from "../../actions/appLoading"

import emailIcon from "../../images/email-icon.png"
import tuturlyLogo from '../../images/tuturlySvgLogo.svg'

import "../../custom-styles/auth/emailnotification.css"

const EmailNotification = ({ match }) => {
    
  const [ user, setUser ] = useState(null)
  const [ userLoading, setUserLoading ] = useState(true)
  const dispatch = useDispatch()

  const alert = useAlert()

  const getUserByUserId = async (userId) => {
     try {
        setUserLoading(true) 
        const res = await axios.get(`/api/v1/user/${userId}`)
        setUser(res.data)
        setUserLoading(false)
     } catch (error) {
      const errors = error.response?.data?.errors
      if(errors){
          errors.forEach(error => {
             alert.show(error.msg, {
               type: 'error'
             })
          });
      }
      setUserLoading(false)
     }
  }

  const handleClickResendMailLink = async (userId) => {
    try {
      dispatch(startLoading())
      await axios.get(`/api/v1/user/resend/link/${userId}`)
      dispatch(stopLoading())
      alert.show('Link sent successfully', {
        type: 'success'
      })
    } catch (error) {
      const errors = error.response?.data?.errors
      if(errors){
          errors.forEach(error => {
             alert.show(error.msg, {
               type: 'error'
             })
          });
        dispatch(stopLoading())
      }
    }
  }

  useEffect(() => {
    if(match.params.userId){
      getUserByUserId(match.params.userId)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [match.params.userId])

  return <>
     <div className='email-notification-wrapper'>
     <SetupPageNavbar />
     {
        userLoading === true ? <div className="loader-wrapper">
             <Skeleton duration={2} height={"100%"} width={"100%"} />
        </div> : <>
        <Container className="page-contents">
          <div className="card-logo__container">
               <img src={tuturlyLogo} className='img-fluid' alt="..." />
            </div>
        <div className='mail-image__container'>
          <img src={emailIcon} alt="..." className='img-fluid'/>
        </div>
        <p className="mt-2 para-style">  
          An email has been sent to {user?.email},
          open mail to complete your registration
        </p>
        <p className="para-style">
          Confirm your email to proceed
        </p>

        <p className='resend-mail-string'>Didn't get any mail? <span onClick={() => handleClickResendMailLink(user._id)}>Click here to resend</span></p>
     </Container>
        </> 
     }
     </div>
  </>
}

export default EmailNotification
