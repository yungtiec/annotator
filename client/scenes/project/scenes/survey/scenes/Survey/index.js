import React, { Component } from "react";
import Loadable from "react-loadable";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { SquareLoader } from "halogenium";
import { batchActions } from "redux-batched-actions";
import {
  sortCommentBy,
  updateIssueFilter,
  updateVerificationStatusInView,
  updateEngagementTabInView,
  getSidebarContext,
  updateSidebarContext
} from "../../reducer";
import { fetchQuestionsByProjectSurveyId } from "../../data/actions";
import {
  fetchCommentsBySurvey,
  addNewCommentSentFromServer,
  addNewComment
} from "../../data/comments/actions";
import { getAllSurveyQuestions } from "../../data/qnas/reducer";
import { getAllComments } from "../../data/comments/reducer";
import { getSelectedSurvey } from "../../data/metadata/reducer";
import { getSelectedProject } from "../../../../data/metadata/reducer";
import {
  getAllTags,
  getTagsWithCountInSurvey,
  getTagFilter
} from "../../data/tags/reducer";
import { updateTagFilter } from "../../data/tags/actions";

const LoadableSurvey = Loadable({
  loader: () => import("./main"),
  loading: () => (
    <SquareLoader
      className="route__loader"
      color="#2d4dd1"
      size="16px"
      margin="4px"
    />
  ),
  render(loaded, props) {
    let Survey = loaded.default;
    return <Survey {...props} />;
  },
  delay: 1000
});

class MyComponent extends React.Component {
  componentDidMount() {
    batchActions([
      this.props.fetchQuestionsByProjectSurveyId({
        projectSurveyId: this.props.match.params.projectSurveyId
      }),
      this.props.fetchCommentsBySurvey(this.props.match.params.projectSurveyId)
    ]);
  }

  componentDidUpdate(prevProps) {
    const projectSymbol = this.props.match.url.split("/")[2];
    const prevProjectSymbol = prevProps.match.url.split("/")[2];
    const surveyId = this.props.match.params.projectSurveyId;
    const prevSurveyId = prevProps.match.params.projectSurveyId;
    if (
      projectSymbol &&
      surveyId &&
      (projectSymbol !== prevProjectSymbol || surveyId !== prevSurveyId)
    ) {
      batchActions([
        this.props.fetchQuestionsByProjectSurveyId({
          projectSurveyId: surveyId
        }),
        this.props.fetchCommentsBySurvey(surveyId)
      ]);
    }
  }

  render() {
    if (
      !this.props.surveyQnaIds ||
      !this.props.commentIds ||
      !this.props.commentsById
    )
      return null;
    else return <LoadableSurvey {...this.props} />;
  }
}

const mapState = state => {
  const { surveyQnasById, surveyQnaIds } = getAllSurveyQuestions(state);
  const { commentsById, commentIds, unfilteredCommentIds } = getAllComments(
    state
  );
  const {
    sidebarOpen,
    commentSortBy,
    commentIssueFilter
  } = state.scenes.project.scenes.survey;
  return {
    // global metadata
    width: state.data.environment.width,
    isLoggedIn: !!state.data.user.id,
    userEmail: !!state.data.user.id && state.data.user.email,
    // project metadata
    projectMetadata: getSelectedProject(state),
    surveyMetadata: getSelectedSurvey(state),
    // survey data
    surveyQnasById,
    surveyQnaIds,
    // ann
    commentsById,
    commentIds,
    unfilteredCommentIds,
    // tab, sort, filter
    sidebarOpen,
    commentSortBy,
    commentIssueFilter,
    sidebarContext: getSidebarContext(state),
    // tags
    tags: getAllTags(state),
    tagFilter: getTagFilter(state),
    tagsWithCountInSurvey: getTagsWithCountInSurvey(state)
  };
};

const actions = {
  fetchQuestionsByProjectSurveyId,
  fetchCommentsBySurvey,
  addNewComment,
  addNewCommentSentFromServer,
  sortCommentBy,
  updateTagFilter,
  updateIssueFilter,
  updateSidebarContext
};

export default withRouter(connect(mapState, actions)(MyComponent));
