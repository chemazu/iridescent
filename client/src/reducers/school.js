import { GET_SCHOOL, UPDATE_SCHOOL_THEME_INFO } from "../actions/types"

const initialState = {
    loading: true,
    schoolDetails: null
}

const schoolReducer = (state = initialState, action) => {
    const { type, payload } = action

    switch (type) {
        case GET_SCHOOL:
            return {
                ...state,
                loading: false,
                schoolDetails: payload
            }    
            case UPDATE_SCHOOL_THEME_INFO: 
            return {
                ...state,
                loading: false,
                schoolDetails: payload
            }   
        default:
           return state
    }
}

export default schoolReducer