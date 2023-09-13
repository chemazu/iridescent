import { START_LOADING, STOP_LOADING } from "./types"

export const startLoading = () => {
    return (dispatch) => {
        dispatch({
            type: START_LOADING
        })
    }
}

export const stopLoading = () => {
    return (dispatch) => {
        dispatch({
            type: STOP_LOADING
        })
    }
}