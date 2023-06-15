import axios from "axios";
import {
  LOAD_COURSE_MODULES,
  ADD_COURSE_MODULE,
  ADD_COURSE_UNIT_TO_MODULE,
  UPDATE_MODULE_NAME,
  DELETE_MODULE,
} from "./types";
import { startLoading, stopLoading } from "./appLoading";
import setAuthToken from "../utilities/setAuthToken";

export const addNewCourseModule = (moduleForm, courseId) => {
  return async (dispatch) => {
    if (localStorage.getItem("token")) {
      setAuthToken(localStorage.getItem("token"));
    }
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const body = JSON.stringify(moduleForm);
    dispatch(startLoading());
    try {
      const res = await axios.post(
        `/api/v1/coursechapter/${courseId}`,
        body,
        config
      );
      dispatch({
        type: ADD_COURSE_MODULE,
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

export const loadCourseModules = (courseId) => {
  return async (dispatch) => {
    try {
      if (localStorage.getItem("token")) {
        setAuthToken(localStorage.getItem("token"));
      }
      const res = await axios.get(`/api/v1/coursechapter/${courseId}`);
      dispatch({
        type: LOAD_COURSE_MODULES,
        payload: res.data,
      });
    } catch (error) {
      const errors = error.response.data.errors;
      if (errors) {
        errors.forEach((element) => {
          alert(element.msg);
        });
      }
    }
  };
};

export const addNewCourseUnitToModule = (data) => {
  return (dispatch) => {
    dispatch({
      type: ADD_COURSE_UNIT_TO_MODULE,
      payload: data,
    });
  };
};

export const updateModule = (moduleUpdate, moduleId) => {
  return async (dispatch) => {
    if (localStorage.getItem("token")) {
      setAuthToken(localStorage.getItem("token"));
    }
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const body = JSON.stringify(moduleUpdate);
    dispatch(startLoading());
    try {
      const res = await axios.put(
        `/api/v1/coursechapter/${moduleId}`,
        body,
        config
      );
      dispatch({
        type: UPDATE_MODULE_NAME,
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

export const deleteModule = (moduleId) => {
  return async (dispatch) => {
    if (localStorage.getItem("token")) {
      setAuthToken(localStorage.getItem("token"));
    }
    try {
      dispatch(startLoading());
      const res = await axios.delete(`/api/v1/coursechapter/${moduleId}`);
      dispatch({
        type: DELETE_MODULE,
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
