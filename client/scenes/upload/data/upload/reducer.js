import * as types from "./actionTypes";
import { uniq, isEmpty, values } from "lodash";

const initialState = {
  markdown: null,
  versionNumber: '',
  collaboratorEmails: [],
  commentPeriodValue: 3,
  commentPeriodUnit: "days",
  selectedProject: "",
  projectSymbolArr: [],
  projectsBySymbol: {},
  collaboratorOptions: [],
  scorecard: {}
};

export default function reduce(state = initialState, action = {}) {
  switch (action.type) {
    case types.MARKDOWN_IMPORTED:
      return {
        ...state,
        markdown: action.markdown
      };
    case types.MARKDOWN_UPLOADED:
      return {
        ...state,
        markdown: null,
        collaboratorEmails: [],
        commentPeriodValue: 3,
        commentPeriodUnit: "days",
        selectedProject: ""
      };
    case types.COLLABORATOR_UPDATED:
      return {
        ...state,
        collaboratorEmails: action.collaboratorEmails
      };
    case types.COMMENT_PERIOD_UNIT_UPDATED:
      return {
        ...state,
        commentPeriodUnit: action.commentPeriodUnit
      };
    case types.COMMENT_PERIOD_VALUE_UPDATED:
      return {
        ...state,
        commentPeriodValue: action.commentPeriodValue
      };
    case types.SELECTED_PROJECT_UPDATED:
      return {
        ...state,
        selectedProject: action.selectedProject,
        collaboratorOptions: action.selectedProject.collaboratorOptions
      };
    case types.VERSION_NUMBER_UPDATED:
      return {
        ...state,
        versionNumber: action.versionNumber
      };
    case types.PROJECT_SCORECARD_UPDATED:
      return {
        ...state,
        scorecard: action.projectScorecard
      };
    default:
      return state;
  }
}

export function getUploadMetadata(state) {
  var {
    markdown: importedMarkdown,
    versionNumber,
    selectedProject,
    collaboratorEmails,
    collaboratorOptions,
    versionNumber,
    commentPeriodUnit,
    commentPeriodValue,
    scorecard
  } = state.scenes.upload.data.upload;
  return {
    importedMarkdown,
    versionNumber,
    selectedProject,
    collaboratorEmails,
    collaboratorOptions,
    versionNumber,
    commentPeriodUnit,
    commentPeriodValue,
    scorecard,
    scorecardCompleted:
      !isEmpty(scorecard) &&
      values(scorecard).reduce((bool, score) => !!score && bool, true)
  };
}
