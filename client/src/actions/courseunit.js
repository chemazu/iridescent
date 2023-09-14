import axios from "axios"
import { toast } from 'react-toastify'
import setAuthToken from "../utilities/setAuthToken"
import { LOAD_COURSE_UNIT,
     UPDATE_COURSE_UNIT_NAME, 
    UPDATE_COURSEUNIT_VIDEO,
    ADD_ATTACHMENT_TO_COURSE_UNIT,
    REMOVE_ATTACHMENT_FROM_COURSE_UNIT
} from "./types"
import { startLoading, stopLoading } from "./appLoading"

export const loadCourseUnit = (courseunitId) => {
    return async (dispatch) => {
        if(localStorage.getItem("token")){
            setAuthToken(localStorage.getItem("token"))
        }
        try {
            const res = await axios.get(`/api/v1/courseunit/${courseunitId}`)
            dispatch({
                type: LOAD_COURSE_UNIT,
                payload: res.data
            })
        } catch (error) {
            console.log(error)
            const errors = error.response.data.errors
            if(errors){
                errors.forEach(element => {
                    alert(element.msg)
                });
            }
        }
    }
}

export const updateCourseUnitName = (updateDetails, courseunitId) => {
    return async (dispatch) => {
        if(localStorage.getItem("token")){
            setAuthToken(localStorage.getItem("token"))
        }
        const config = {
            headers: {
                'Content-Type': 'application/json'
            }
        }
        const body = JSON.stringify(updateDetails)
        try {
            dispatch(startLoading())
            const res = await axios.put(`/api/v1/courseunit/${courseunitId}`, body, config)
            dispatch({
                type: UPDATE_COURSE_UNIT_NAME,
                payload: res.data
            })
            toast.success('updated successfully')
            dispatch(stopLoading())
        } catch (error) {
            const errors = error.response.data.errors
            dispatch(stopLoading())
            if(errors){
                errors.forEach(element => {
                    alert(element.msg)
                });
            }
        }
    }
}

export const updateCourseUnitVideo = (videoUpdates) => {
    return (dispatch) => {
            // if(localStorage.getItem("token")){
            //     setAuthToken(localStorage.getItem("token"))
            // }
            // const config = {
            //     headers: {
            //         'Content-Type': 'multipart/form-data'
            //     }
            // }
            // const body = videoUpdates
            dispatch({
                type: UPDATE_COURSEUNIT_VIDEO,
                payload: videoUpdates
            })
    }
}

export const addAttachmentToCourseUnit = (attachmentDetails, courseUnitId) => {
    return async (dispatch) => {
        try {
            if(localStorage.getItem("token")){
                setAuthToken(localStorage.getItem("token"))
            }
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }
            const body = attachmentDetails
            dispatch(startLoading())
            const res = await axios.put(`/api/v1/courseunit/attachment/${courseUnitId}`, body, config)
            dispatch({
                type: ADD_ATTACHMENT_TO_COURSE_UNIT,
                payload: res.data
            })
            toast.success('attachment added successfully')
            dispatch(stopLoading())
        } catch (error) {
            const errors = error.response.data.errors
            dispatch(stopLoading())
            if(errors){
                errors.forEach(element => {
                    alert(element.msg)
                });
            }
        }
    }
}

export const removeAttachmentFromCourseUnit = (courseUnitId, attachmentId) => {
    return async (dispatch) => {
        try {
            if(localStorage.getItem("token")){
                setAuthToken(localStorage.getItem("token"))
            }
            dispatch(startLoading())
            const res = await axios.put(`/api/v1/courseunit/attachment/remove/${courseUnitId}/${attachmentId}`)
            dispatch({
                type: REMOVE_ATTACHMENT_FROM_COURSE_UNIT,
                payload: res.data
            })
            toast.success('attachment removed successfully')
            dispatch(stopLoading())
        } catch (error) {
            const errors = error.response.data.errors
            const someError = error.response.data
            if(someError.msg === 'resource cannot be uploaded at the moment'){
                return toast.warn(someError.msg)
            }
            dispatch(stopLoading())
            if(errors){
                errors.forEach(element => {
                    alert(element.msg)
                });
            }
        }
    }
}