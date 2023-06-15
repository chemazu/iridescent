import axios from "axios";
import { LOAD_USER, AUTH_ERROR, LOGOUT } from "./types";
import setAuthToken from "../utilities/setAuthToken";

export const loadUser = () => {
  return async (dispatch) => {
    if (localStorage.token) {
      setAuthToken(localStorage.token);
    }
    try {
      const res = await axios.get("/api/v1/user/me");
      dispatch({
        type: LOAD_USER,
        payload: res.data,
      });
    } catch (error) {
      const errors = error.response.data.errors;
      if (errors) {
        errors.forEach((error) => {
          alert(error.msg);
        });
      }
      dispatch({
        type: AUTH_ERROR,
      });
    }
  };
};

export const logout = () => {
  return (dispatch) => {
    dispatch({
      type: LOGOUT,
    });
  };
};
