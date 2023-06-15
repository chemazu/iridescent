import {
  TUTOR_SIGNUP,
  TUTOR_SIGNIN_FAIL,
  TUTOR_SIGNUP_FAIL,
  TUTOR_SIGNIN,
  TUTOR_AUTH,
  TUTOR_LOGOUT,
  TUTOR_AUTH_FAILED,
} from "../actions/types";

const initialState = {
  tutorToken: null,
  authenticated: false,
  loading: true,
  tutorDetails: null,
};

const tutorReducer = (state = initialState, action) => {
  const { type, payload } = action;

  switch (type) {
    case TUTOR_SIGNUP:
    case TUTOR_SIGNIN:
      localStorage.setItem("tutorToken", payload.token);
      delete payload.tutor.password;

      return {
        ...state,
        authenticated: true,
        loading: false,
        tutorToken: payload.token,
        tutorDetails: payload.tutor,
      };
    case TUTOR_AUTH:
      return {
        ...state,
        authenticated: true,
        loading: false,
        tutorDetails: payload,
      };
    case TUTOR_SIGNUP_FAIL:
    case TUTOR_SIGNIN_FAIL:
    case TUTOR_LOGOUT:
    case TUTOR_AUTH_FAILED:
      localStorage.removeItem("tutorToken");
      return {
        ...state,
        authenticated: false,
        loading: false,
        tutorToken: null,
        tutorDetails: null,
      };
    default:
      return state;
  }
};

export default tutorReducer;
