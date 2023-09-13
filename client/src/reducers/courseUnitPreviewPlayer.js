import {
  DISPLAY_VIDEO_UNIT_PREVIEW_MODAL,
  CLOSE_VIDEO_UNIT_PREVIEW_MODAL,
  LOAD_ACTIVE_VIDEO_PREVIEW,
  LOAD_COURSE_PREVIEWABLE_LIST,
  EMPTY_COURSE_PREVIEWABLE_LIST,
  EMPTY_ACTIVE_VIDEO_PREVIEW,
} from "../actions/types";

const initialState = {
  displayPlayer: false,
  unitInPreview: null,
  previewableList: [],
};

const preview = (state = initialState, action) => {
  const { type, payload } = action;

  switch (type) {
    case DISPLAY_VIDEO_UNIT_PREVIEW_MODAL:
      return {
        ...state,
        displayPlayer: true,
      };
    case CLOSE_VIDEO_UNIT_PREVIEW_MODAL:
      return {
        ...state,
        displayPlayer: false,
      };
    case LOAD_ACTIVE_VIDEO_PREVIEW:
      return {
        ...state,
        unitInPreview: payload,
      };
    case EMPTY_ACTIVE_VIDEO_PREVIEW:
      return {
        ...state,
        unitInPreview: null,
      };
    case LOAD_COURSE_PREVIEWABLE_LIST:
      return {
        ...state,
        previewableList: payload,
      };
    case EMPTY_COURSE_PREVIEWABLE_LIST:
      return {
        ...state,
        previewableList: [],
      };
    default:
      return state;
  }
};

export default preview;
