import axios from "axios";
import { toast } from "react-toastify";
import {
  STUDENT_SIGNUP,
  STUDENT_SIGNIN_FAIL,
  STUDENT_SIGNUP_FAIL,
  STUDENT_SIGNIN,
  STUDENT_AUTH,
  STUDENT_LOGOUT,
  STUDENT_AUTH_FAILED,
} from "./types";
import { startLoading, stopLoading } from "./appLoading";
import setAuthToken from "../utilities/setAuthToken";

export const studentAuth = () => {
  return async (dispatch) => {
    if (localStorage.getItem("studentToken")) {
      setAuthToken(localStorage.getItem("studentToken"));
    }
    try {
      const res = await axios.get("/api/v1/student/active");
      dispatch({
        type: STUDENT_AUTH,
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
        type: STUDENT_AUTH_FAILED,
      });
    }
  };
};

export const studentSignUp = (schoolName, studentDetails, history) => {
  return async (dispatch) => {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const body = JSON.stringify(studentDetails);
    try {
      dispatch(startLoading());
      const res = await axios.post(
        `/api/v1/student/signup/${schoolName}`,
        body,
        config
      );
      dispatch({
        type: STUDENT_SIGNUP,
        payload: res.data,
      });
      toast.success("signed up completed");
      dispatch(stopLoading());
      if (history) {
        history.push(`/dashboard/courses`);
      }
    } catch (error) {
      const errors = error.response.data.errors;
      if (errors) {
        errors.forEach((error) => {
          toast.warn(error.msg);
        });
      }
      dispatch(stopLoading());
      dispatch({
        type: STUDENT_SIGNUP_FAIL,
      });
    }
  };
};

export const studentSignIn = (schoolname, studentDetails, history) => {
  return async (dispatch) => {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const body = JSON.stringify(studentDetails);
    try {
      dispatch(startLoading());
      const res = await axios.post(
        `/api/v1/student/signin/${schoolname}`,
        body,
        config
      );
      dispatch({
        type: STUDENT_SIGNIN,
        payload: res.data,
      });
      toast.success("signed in completed");
      dispatch(stopLoading());
      if (history) history.push(`/dashboard/courses`);
    } catch (error) {
      const errors = error?.response?.data?.errors;
      if (errors) {
        errors.forEach((error) => {
          toast.warn(error.msg);
        });
      }
      dispatch(stopLoading());
      dispatch({
        type: STUDENT_SIGNIN_FAIL,
      });
    }
  };
};

export const studentLogout = () => {
  return (dispatch) => {
    dispatch({ type: STUDENT_LOGOUT });
  };
};
