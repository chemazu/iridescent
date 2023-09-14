import {
    RESET_NOTIFICATION_UPDATE_DATA,
     LOAD_NOTIFICATION_DATA
    } from "../actions/types"

const initialState = null

const notification = (state = initialState, action) => {
    const { type, payload } = action

    switch (type) {
        case LOAD_NOTIFICATION_DATA:
            return payload
        case RESET_NOTIFICATION_UPDATE_DATA:
             return {
                 ...state,
                 ...payload
             }
        default:
            return state
    }
}

export default notification