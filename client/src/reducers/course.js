import { CREATE_COURSE, LOAD_COURSE,
        UPDATE_COURSE, PUBLISH_COURSE,
        RETRACT_COURSE
    } from "../actions/types";

const initialState = {
    loading: true,
    courseDetails: null
}

const courseReducer = (state = initialState, action) => {
    const { type, payload } = action

    switch (type) {
        case CREATE_COURSE:
        case LOAD_COURSE:    
            return {
                ...state,
                loading: false,
                courseDetails: payload
            }     
        case UPDATE_COURSE: 
         delete payload.author
            return {
                ...state,
                loading: false,
                courseDetails: {
                    ...state.courseDetails,
                    ...payload
                }
            } 
        case PUBLISH_COURSE:
        case RETRACT_COURSE:    
            delete payload.author
                return {
                    ...state,
                    loading: false,
                    courseDetails: {
                        ...state.courseDetails,
                        ...payload
                    }
                }       
        default:
            return state
    }
}

export default courseReducer