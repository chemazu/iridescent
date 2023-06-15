import { LOAD_SUBDOMAIN_IN_STATE } from "../actions/types"

const initialState = null

const subdomain = (state = initialState, action) => {
    const { type, payload } = action

    switch (type) {
        case LOAD_SUBDOMAIN_IN_STATE:
            return payload
        default:
           return state
    }
}

export default subdomain