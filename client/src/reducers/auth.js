import {
  SIGNUP_SUCCESS,
  SIGNIN_SUCCESS,
  SIGNUP_FAIL,
  SIGNIN_FAIL,
  LOAD_USER,
  AUTH_ERROR,
  UPDATE_ACCOUNT_STEP_ONE,
  UPDATE_ACCOUNT_STEP_TWO,
  UPDATE_ACCOUNT_STEP_ONE_FAIL,
  UPDATE_ACCOUNT_STEP_TWO_FAIL,
  UPDATE_USER_VIDEO_WALKTHROUGH_MODAL_CLOSE,
  UPDATE_USER_NEW_FEATURE_MODAL_CLOSE,
  LOGOUT,
} from "../actions/types";

const initialState = {
  token: null,
  authenticated: false,
  loading: true,
  user: null,
};

const authReducer = (state = initialState, action) => {
  const { type, payload } = action;

  switch (type) {
    case SIGNUP_SUCCESS:
    case SIGNIN_SUCCESS:
      localStorage.setItem("token", payload);
      return {
        ...state,
        authenticated: true,
        loading: false,
        token: payload,
      };
    case SIGNUP_FAIL:
    case AUTH_ERROR:
    case SIGNIN_FAIL:
    case LOGOUT:
      localStorage.removeItem("token");
      return {
        ...state,
        authenticated: false,
        loading: false,
        token: null,
        user: null,
      };
    case LOAD_USER:
      return {
        ...state,
        authenticated: true,
        loading: false,
        user: payload,
      };
    case UPDATE_USER_VIDEO_WALKTHROUGH_MODAL_CLOSE:
      return {
        ...state,
        authenticated: true,
        loading: false,
        user: {
          ...state.user,
          displaywalkthrough: false,
        },
      };
    case UPDATE_USER_NEW_FEATURE_MODAL_CLOSE:
      return {
        ...state,
        authenticated: true,
        loading: false,
        user: {
          ...state.user,
          showNewFeatureAnnouncementModal: false,
        },
      };
    case UPDATE_ACCOUNT_STEP_ONE:
    case UPDATE_ACCOUNT_STEP_TWO:
      return {
        ...state,
        authenticated: true,
        loading: false,
        user: {
          ...state.user,
          ...payload,
        },
      };
    case UPDATE_ACCOUNT_STEP_ONE_FAIL:
    case UPDATE_ACCOUNT_STEP_TWO_FAIL:
      return {
        ...state,
        authenticated: true,
        loading: false,
      };
    default:
      return state;
  }
};

export default authReducer;
