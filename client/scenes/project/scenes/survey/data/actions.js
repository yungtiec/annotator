import * as types from "./actionTypes";
import {
  getSurveyByProjectSurveyId,
  postUpvoteToProjectSurvey
} from "./service";
import { keyBy, omit, assignIn, pick, sortBy } from "lodash";

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
        projectSurvey.survey.survey_questions,
        ["order_in_survey"],
        ["asc"]
      );
      const surveyQnasById = keyBy(surveyQnas, "id");
      const surveyQnaIds = surveyQnas.map(qna => qna.id);
      const surveyVersions = projectSurvey.ancestors
        .concat([
          omit(projectSurvey, [
            "ancestors",
            "descendents",
            "survey.survey_questions"
          ])
        ])
        .concat(projectSurvey.descendents);
      projectSurvey.versions = surveyVersions;
      const surveyMetadata = assignIn(
        pick(projectSurvey, [
          "title",
          "description",
          "id",
          "creator",
          "collaborators",
          "versions",
          "hierarchyLevel",
          "resolvedIssues",
          "comment_until_unix",
          "createdAt",
          "upvotesFrom",
          "scorecard"
        ]),
        omit(projectSurvey.survey, ["survey_questions", "id"])
      );
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

export function upvoteProjectSurvey({
  projectSurveyId,
  projectSymbol,
  hasUpvoted
}) {
  return async (dispatch, getState) => {
    try {
      const upvotesFrom = await postUpvoteToProjectSurvey({
        projectSurveyId,
        projectSymbol,
        hasUpvoted
      });
      dispatch({
        type: types.PROJECT_SURVEY_UPVOTED,
        upvotesFrom
      });
    } catch (err) {
      console.log(err);
    }
  };
}
