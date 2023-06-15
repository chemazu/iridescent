import {
  DISPLAY_TUTORIALS_MODAL,
  CLOSE_TUTORIALS_MODAL,
  LOAD_ACTIVE_TUTORIAL,
  LOAD_TUTORIAL_LIST,
  EMPTY_TUTORIAL_LIST,
  EMPTY_ACTIVE_TUTORIAL,
} from "../actions/types";

const initialState = {
  displayPlayer: false,
  activeVideo: null,
  playerList: [],
};

const tutorials = (state = initialState, action) => {
  const { type, payload } = action;

  switch (type) {
    case DISPLAY_TUTORIALS_MODAL:
      return {
        ...state,
        displayPlayer: true,
      };
    case CLOSE_TUTORIALS_MODAL:
      return {
        ...state,
        displayPlayer: false,
      };
    case LOAD_ACTIVE_TUTORIAL:
      return {
        ...state,
        activeVideo: payload,
      };
    case LOAD_TUTORIAL_LIST:
      return {
        ...state,
        playerList: payload,
      };
    case EMPTY_ACTIVE_TUTORIAL:
      return {
        ...state,
        activeVideo: null,
      };
    case EMPTY_TUTORIAL_LIST:
      return {
        ...state,
        playerList: [],
      };
    default:
      return state;
  }
};

export default tutorials;
