import axios from "axios"
import { GET_SCHOOL } from "./types"
import setAuthToken from "../utilities/setAuthToken"

export const getDefaultSchool = () => {
    return async (dispatch) => {
        if(localStorage.token){
            setAuthToken(localStorage.token)
        }
        try {
            const res = await axios.get('/api/v1/school/')
            dispatch({
                type: GET_SCHOOL,
                payload: res.data
            })
        } catch (error) {
            const errors = error.response.data.errors
            if(errors){
                errors.forEach(element => {
                    alert(element.msg)
                });
            }
        }
    }
}
