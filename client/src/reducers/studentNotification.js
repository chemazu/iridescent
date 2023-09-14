import {
  RESET_STUDENT_NOTIFICATION_DATA,
  LOAD_STUDENT_NOTIFICATION_DATA,
} from "../actions/types";

const initialState = null;

const studentNotification = (state = initialState, action) => {
  const { type, payload } = action;

  switch (type) {
    case LOAD_STUDENT_NOTIFICATION_DATA:
      return payload;
    case RESET_STUDENT_NOTIFICATION_DATA:
      return {
        ...state,
        ...payload,
      };
    default:
      return state;
  }
};

export default studentNotification;
