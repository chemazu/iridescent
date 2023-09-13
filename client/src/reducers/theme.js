import { 
    CHOOSE_THEME, 
    UPDATE_THEME_IMAGE,
    UPDATE_THEME_ABOUT_IMAGE,
    UPDATE_THEME_CONTACT_INFO,
    UPDATE_THEME_INFO,
    THEME_SETUP_ERROR,
    GET_SCHOOL_THEME,
} from "../actions/types"

const initialState = {
    loading: true,
    schoolTheme:null
}

const themeReducer = (state = initialState, action) => {
    const { type, payload } = action

    switch (type) {
        case CHOOSE_THEME:
            return {
                ...state,
                loading: false,
                schoolTheme: payload
            }
        case GET_SCHOOL_THEME: 
        return {
            ...state,
            loading: false,
            schoolTheme: payload
        }   
        case UPDATE_THEME_INFO:
            return {
                ...state,
                loading: false,
                schoolTheme: payload
            }
        case UPDATE_THEME_IMAGE: 
            return {
                ...state,
                loading: false,
                schoolTheme: {
                    ...state.schoolTheme,
                    ...payload
                }
            }
        case UPDATE_THEME_ABOUT_IMAGE:
            return {
                ...state,
                loading: false,
                schoolTheme: {
                    ...state.schoolTheme,
                    ...payload
                }
            }
        case UPDATE_THEME_CONTACT_INFO:
            return {
                ...state,
                loading: false,
                schoolTheme: payload
            }            
        case THEME_SETUP_ERROR:
            return {
                ...state,
                loading: false,
            }
        default:
            return state
    }
}

export default themeReducer