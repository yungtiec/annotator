import * as types from "./actionTypes";
import {
  getSurveyByProjectSurveyId,
<<<<<<< HEAD
  postUpvoteToProjectSurvey,
  postDownvoteToProjectSurvey,
  putOnboardStatus
=======
  postUpvoteToSurvey
>>>>>>> db-refactor
} from "./service";
import { keyBy, omit, assignIn, pick, sortBy } from "lodash";
import { notify } from "reapop";
import { loadModal } from "../../../../../data/reducer";

export function fetchQuestionsByProjectSurveyId({
  projectSurveyId,
  projectSymbol
}) {
  return async (dispatch, getState) => {
    try {
      var projectSurvey = await getSurveyByProjectSurveyId(
        projectSymbol,
        projectSurveyId
      );
      const surveyQnas = sortBy(
        projectSurvey.survey_questions,
        ["order_in_survey"],
        ["asc"]
      );
      const surveyQnasById = keyBy(surveyQnas, "id");
      const surveyQnaIds = surveyQnas.map(qna => qna.id);
      const surveyVersions = projectSurvey.ancestors
        .concat([
          omit(projectSurvey, ["ancestors", "descendents", "survey_questions"])
        ])
        .concat(projectSurvey.descendents);
      projectSurvey.versions = surveyVersions;
      const surveyMetadata = omit(projectSurvey, ["survey_questions"]);
      dispatch({
        type: types.PROJECT_SURVEY_FETCH_SUCCESS,
        surveyQnasById,
        surveyQnaIds,
        surveyMetadata
      });
    } catch (error) {
      console.error(error);
    }
  };
}

export function upvoteSurvey({
  surveyId,
  projectSymbol,
  hasUpvoted,
  hasDownvoted
}) {
  return async (dispatch, getState) => {
    try {
<<<<<<< HEAD
      const [upvotesFrom, downvotesFrom] = await postUpvoteToProjectSurvey({
        projectSurveyId,
=======
      const upvotesFrom = await postUpvoteToSurvey({
        surveyId,
>>>>>>> db-refactor
        projectSymbol,
        hasUpvoted,
        hasDownvoted
      });
      dispatch({
        type: types.PROJECT_SURVEY_VOTED,
        upvotesFrom,
        downvotesFrom
      });
      dispatch(
        loadModal("COMMENT_MODAL", {
          projectSurveyId
        })
      );
    } catch (err) {
      console.log(err);
    }
  };
}

export function downvoteProjectSurvey({
  projectSurveyId,
  projectSymbol,
  hasUpvoted,
  hasDownvoted
}) {
  return async (dispatch, getState) => {
    try {
      const [upvotesFrom, downvotesFrom] = await postDownvoteToProjectSurvey({
        projectSurveyId,
        projectSymbol,
        hasUpvoted,
        hasDownvoted
      });
      dispatch({
        type: types.PROJECT_SURVEY_VOTED,
        upvotesFrom,
        downvotesFrom
      });
      dispatch(
        loadModal("COMMENT_MODAL", {
          projectSurveyId
        })
      );
    } catch (err) {
      console.log(err);
    }
  };
}
