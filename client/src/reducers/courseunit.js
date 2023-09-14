import { LOAD_COURSE_UNIT, 
    UPDATE_COURSE_UNIT_NAME, 
    UPDATE_COURSEUNIT_VIDEO,
    ADD_ATTACHMENT_TO_COURSE_UNIT,
    REMOVE_ATTACHMENT_FROM_COURSE_UNIT
} from "../actions/types"

const initialState = {
    unitDetails: null,
    loading: true
}

const courseUnitReducer = (state = initialState, action) => {
    const { type, payload } = action

    switch (type) {
        case LOAD_COURSE_UNIT:
            return {
                ...state,
                unitDetails: payload,
                loading: false
            }
        case UPDATE_COURSE_UNIT_NAME: 
            return {
                ...state,
                unitDetails: {
                    ...state.unitDetails,
                    ...payload
                },
                loading: false
            }
        case UPDATE_COURSEUNIT_VIDEO:
            return {
                ...state,
                unitDetails: {
                    ...state.unitDetails,
                    ...payload
                },
                loading: false
            }  
        case ADD_ATTACHMENT_TO_COURSE_UNIT:
            return {
                ...state,
                unitDetails: {
                    ...state.unitDetails,
                    ...payload
                },
                loading: false
            }
        case REMOVE_ATTACHMENT_FROM_COURSE_UNIT:
            return {
                ...state,
                unitDetails: {
                    ...state.unitDetails,
                    ...payload
                },
                loading: false
            }          
        default:
            return state;
    }
}

export default courseUnitReducer