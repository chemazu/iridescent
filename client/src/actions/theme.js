import axios from "axios"
import { startLoading, stopLoading } from "./appLoading"
import setAuthToken from "../utilities/setAuthToken"
import {
    UPDATE_THEME_IMAGE,
    UPDATE_THEME_ABOUT_IMAGE,
    UPDATE_THEME_CONTACT_INFO,
    UPDATE_THEME_INFO,
    THEME_SETUP_ERROR,
    GET_SCHOOL_THEME    
} from "./types"

export const getTheme = (schoolId) => {
    return async (dispatch) => {
        if(localStorage.token){
            setAuthToken(localStorage.token)
        }
        try {
            const res = await axios.get(`/api/v1/theme/${schoolId}`)
            dispatch({
                type: GET_SCHOOL_THEME,
                payload: res.data
            })
        } catch (error) {
            const errors = error.response.data.errors
            if(errors){
                errors.forEach(error => {
                   alert(error.msg)
                });
            } 
            dispatch({
                type: THEME_SETUP_ERROR
            })  
        }
    }
}

export const updateThemeInfo = (formData, school, history) => {
    return async (dispatch) => {
        if(localStorage.token){
            setAuthToken(localStorage.token)
        }
        const config = {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        }
        const body = formData
        try {
            dispatch(startLoading())
            const res = await axios.put(`/api/v1/theme/setup/themeinfo/${school._id}`, body, config)
            dispatch({
                type: UPDATE_THEME_INFO,
                payload: res.data
            })
            dispatch(stopLoading())
        } catch (error) {
            const errors = error.response.data.errors
            if(errors){
                errors.forEach(error => {
                   alert(error.msg)
                });
            }
            dispatch(stopLoading())
            dispatch({
                type: THEME_SETUP_ERROR
            })
        }
    }
}

export const updateThemeImage = (formData, schoolId) => {
    return async (dispatch) => {
        if(localStorage.token){
            setAuthToken(localStorage.token)
        }
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        }
        const body = formData
        try {
            dispatch(startLoading())   
            const res = await axios.put(`/api/v1/theme/setup/assetupload/banner/${schoolId}`, body, config)
            dispatch({
                type: UPDATE_THEME_IMAGE,
                payload: res.data
            })
            dispatch(stopLoading())
        } catch (error) {
            const errors = error.response.data.errors
            if(errors){
                errors.forEach(error => {
                   alert(error.msg)
                });
            }
            dispatch(stopLoading())
            dispatch({
                type: THEME_SETUP_ERROR
            })
        }
    }
}

export const updateThemeInstructorImage = (formData, schoolId) => {
    return async (dispatch) => {
        if(localStorage.token){
            setAuthToken(localStorage.token)
        }
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        }
        const body = formData
        try {
            dispatch(startLoading())
            const res = await axios.put(`/api/v1/theme/setup/assetupload/aboutimage/${schoolId}`, body, config)
            dispatch({
                type: UPDATE_THEME_ABOUT_IMAGE,
                payload: res.data
            })
            dispatch(stopLoading())
        } catch (error) {
            const errors = error.response.data.errors
            if(errors){
                errors.forEach(error => {
                   alert(error.msg)
                });
            }
            dispatch(stopLoading())
            dispatch({
                type: THEME_SETUP_ERROR
            })
        }
    }
}

export const updateThemeContactInfo = (formData, schoolId, schoolname, history) => {
    return async (dispatch) => {
        if(localStorage.token){
            setAuthToken(localStorage.token)
        }
        const config = {
            headers: {
                "Content-Type": "application/json"
            }
        }
        const body = JSON.stringify(formData)
        try {
            dispatch(startLoading())
            const res = await axios.put(`/api/v1/theme/setup/contactinfo/${schoolId}`, body, config)
            dispatch({
                type: UPDATE_THEME_CONTACT_INFO,
                payload: res.data
            })
            dispatch(stopLoading())
            history.push(`/${schoolname}`)
        } catch (error) {
            const errors = error.response.data.errors
            if(errors){
                errors.forEach(error => {
                   alert(error.msg)
                });
            }
            dispatch(stopLoading())
            dispatch({
                type: THEME_SETUP_ERROR
            })
        }
    }
}
