import { ADD_COURSE_TO_CART, REMOVE_COURSE_FROM_CART, CLEAR_CART } from "../actions/types"

const initialState = localStorage.getItem('cartList') === null ? [] : JSON.parse(localStorage.getItem('cartList'))

const cartReducer = (state = initialState, action) => {
    const { type, payload } = action

    switch (type) {
        case ADD_COURSE_TO_CART:
            return [
                ...state,
                payload
            ]
        case REMOVE_COURSE_FROM_CART: 
            return state.filter(({ itemId }) => itemId !== payload)
        case CLEAR_CART:
            return []    
        default:
            return state;
    }
    
}

export default cartReducer