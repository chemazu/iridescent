import { START_LOADING, STOP_LOADING } from "../actions/types"

const initialState = {
    isLoading: false
}

const loadingReducer = (state = initialState, action) => {
    const { type } = action

    switch (type) {
        case START_LOADING:
           return {
               ...state,
               isLoading: true
           }
        case STOP_LOADING: 
           return {
               ...state,
               isLoading: false
           }
        default:
            return state
    }
}

export default loadingReducer