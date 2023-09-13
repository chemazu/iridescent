import {
  ADD_COURSE_MODULE,
  LOAD_COURSE_MODULES,
  ADD_COURSE_UNIT_TO_MODULE,
  UPDATE_MODULE_NAME,
  DELETE_MODULE,
  REMOVE_COURSE_UNIT_FROM_MODULE,
  UPDATE_COURSE_UNIT_PREVIEW_STATUS,
} from "../actions/types";

const initialState = {
  courseModules: [],
  loading: true,
};

const updateVideoUnitPreviewStatus = (state, payload) => {
  const updatedModules = state.courseModules.map((module) => {
    if (module._id === payload.coursechapter) {
      const updatedUnit = module.courseunit.map((unit) => {
        if (unit._id === payload._id) {
          return {
            ...unit,
            ...payload,
          };
        } else {
          return unit;
        }
      });
      return {
        ...module,
        courseunit: updatedUnit,
      };
    } else {
      return module;
    }
  });
  return updatedModules;
};

const modulesReducer = (state = initialState, action) => {
  const { type, payload } = action;

  switch (type) {
    case ADD_COURSE_MODULE:
      return {
        ...state,
        courseModules: [...state.courseModules, payload],
        loading: false,
      };
    case LOAD_COURSE_MODULES:
      return {
        ...state,
        courseModules: payload,
        loading: false,
      };
    case ADD_COURSE_UNIT_TO_MODULE:
    case REMOVE_COURSE_UNIT_FROM_MODULE:
      return {
        ...state,
        courseModules: payload,
        loading: false,
      };
    case UPDATE_COURSE_UNIT_PREVIEW_STATUS:
      return {
        ...state,
        courseModules: updateVideoUnitPreviewStatus(state, payload),
      };
    case UPDATE_MODULE_NAME:
      return {
        ...state,
        courseModules: state.courseModules.map((module) =>
          module._id === payload._id ? { ...module, ...payload } : module
        ),
        loading: false,
      };
    case DELETE_MODULE:
      return {
        ...state,
        courseModules: state.courseModules.filter(
          (module) => module._id !== payload._id
        ),
        loading: false,
      };
    default:
      return state;
  }
};

export default modulesReducer;
