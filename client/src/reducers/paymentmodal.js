import { SHOW_PAYMENT_MODAL, REMOVE_PAYMENT_MODAL } from "../actions/types";

const initialState = {
    isLoading: false 
}

const paymentModal = (state = initialState, action) => {
    const { type } = action

    switch (type) {
        case SHOW_PAYMENT_MODAL: 
            return {
                ...state,
                isLoading: true
            }
        case REMOVE_PAYMENT_MODAL: 
            return {
                ...state,
                isLoading: false
            }  
        default: 
            return state      
    }
}

export default paymentModal