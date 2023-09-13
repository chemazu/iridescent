import { STUDENT_SIGNUP, STUDENT_SIGNIN, 
    STUDENT_SIGNUP_FAIL, STUDENT_SIGNIN_FAIL,
    STUDENT_LOGOUT, STUDENT_AUTH, STUDENT_AUTH_FAILED
} from "../actions/types"

const initialState = {
    studentToken: null,
    authenticated: false,
    loading: true,
    studentDetails: null
}

const studentReducer = (state = initialState, action) => {
    const { type, payload } = action

    switch (type) {
        case STUDENT_SIGNUP:
        case STUDENT_SIGNIN:
            localStorage.setItem("studentToken", payload.token)
            delete payload.student.password
            return {
                ...state,
                authenticated:true,
                loading: false,
                studentToken: payload.token,
                studentDetails: payload.student
            }
        case STUDENT_AUTH:
            return {
                ...state,
                authenticated:true,
                loading: false,
                studentDetails: payload
            }    
        case STUDENT_SIGNUP_FAIL:
        case STUDENT_SIGNIN_FAIL:    
        case STUDENT_LOGOUT:
        case STUDENT_AUTH_FAILED:    
            localStorage.removeItem("studentToken")
            return {
                ...state,
                authenticated: false,
                loading: false,
                studentToken: null,
                studentDetails: null
            } 
        default:
           return state
    }
}

export default studentReducer