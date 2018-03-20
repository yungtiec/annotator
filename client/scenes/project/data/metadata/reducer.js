import _ from "lodash";
import * as types from "../actionTypes";

const initialState = {};

export default function reduce(state = initialState, action = {}) {
  switch (action.type) {
    case types.PROJECT_FETCH_SUCCESS:
      return {
        ...state,
        ...action.projectMetadata
      }
    default:
      return state;
  }
}

export function getSelectedProject(state) {
  return state.scenes.project.data.metadata
}

