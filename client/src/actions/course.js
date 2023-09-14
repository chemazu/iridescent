import axios from "axios";
import {
  CREATE_COURSE,
  LOAD_COURSE,
  UPDATE_COURSE,
  PUBLISH_COURSE,
  RETRACT_COURSE,
  SHOW_PAYMENT_MODAL,
} from "./types";
import { startLoading, stopLoading } from "./appLoading";
import setAuthToken from "../utilities/setAuthToken";

export const createNewCourse = (formData, schoolId, history, routeTo) => {
  return async (dispatch) => {
    if (localStorage.getItem("token")) {
      setAuthToken(localStorage.getItem("token"));
    }
    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };
    const body = formData;
    dispatch(startLoading());
    try {
      const res = await axios.post(`/api/v1/course/${schoolId}`, body, config);
      dispatch({
        type: CREATE_COURSE,
        payload: res.data,
      });
      dispatch(stopLoading());
      history.push(`/dashboard/course/setup/module`);
    } catch (error) {
      dispatch(stopLoading());
      const errors = error.response.data.errors;
      if (errors) {
        errors.forEach((element) => {
          alert(element.msg);
        });
      }
      alert(error.message);
      if (error.response.status === 402) {
        dispatch({
          type: SHOW_PAYMENT_MODAL,
        });
      }
    }
  };
};

export const updateCourseById = (courseId, updateBody) => {
  return async (dispatch) => {
    if (localStorage.getItem("token")) {
      setAuthToken(localStorage.getItem("token"));
    }
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const body = JSON.stringify(updateBody);
    dispatch(startLoading());
    try {
      const res = await axios.put(`/api/v1/course/${courseId}`, body, config);
      dispatch({
        type: UPDATE_COURSE,
        payload: res.data,
      });
      dispatch(stopLoading());
    } catch (error) {
      dispatch(stopLoading());
      const errors = error.response.data.errors;
      if (errors) {
        errors.forEach((element) => {
          alert(element.msg);
        });
      }
    }
  };
};

export const getCourseById = (courseId) => {
  return async (dispatch) => {
    if (localStorage.getItem("token")) {
      setAuthToken(localStorage.getItem("token"));
    }
    try {
      const res = await axios.get(`/api/v1/course/${courseId}`);
      dispatch({
        type: LOAD_COURSE,
        payload: res.data,
      });
      dispatch(stopLoading());
    } catch (error) {
      dispatch(stopLoading());
      const errors = error.response.data.errors;
      if (errors) {
        errors.forEach((element) => {
          alert(element.msg);
        });
      }
    }
  };
};

export const publishCourse = (courseId) => {
  return async (dispatch) => {
    if (localStorage.getItem("token")) {
      setAuthToken(localStorage.getItem("token"));
    }
    try {
      dispatch(startLoading());
      const res = await axios.put(`/api/v1/course/publish/${courseId}`);
      dispatch({
        type: PUBLISH_COURSE,
        payload: res.data,
      });
      dispatch(stopLoading());
    } catch (error) {
      dispatch(stopLoading());
      const errors = error.response.data.errors;
      if (errors) {
        errors.forEach((element) => {
          alert(element.msg);
        });
      }
    }
  };
};

export const retractCourse = (courseId) => {
  return async (dispatch) => {
    if (localStorage.getItem("token")) {
      setAuthToken(localStorage.getItem("token"));
    }
    try {
      dispatch(startLoading());
      const res = await axios.put(`/api/v1/course/retract/${courseId}`);
      dispatch({
        type: RETRACT_COURSE,
        payload: res.data,
      });
      dispatch(stopLoading());
    } catch (error) {
      dispatch(stopLoading());
      const errors = error.response.data.errors;
      if (errors) {
        errors.forEach((element) => {
          alert(element.msg);
        });
      }
    }
  };
};
