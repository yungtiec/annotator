import "./index.scss";
import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import PropTypes from "prop-types";
import { fetchAllProjects } from "../../data/projects/actions";
import { getAllProjects } from "../../data/projects/reducer";
import {
  fetchPublishedProjectSurveyStats,
  getProjectSurveys
} from "../../data/reducer";
import { ListView, ProjectCard, SurveyCard } from "../../components";
import autoBind from "react-autobind";
import { batchActions } from "redux-batched-actions";

class ProjectList extends Component {
  constructor(props) {
    super(props);
    autoBind(this);
  }

  componentDidMount() {
    this.props.loadInitialData();
  }

  render() {
    const {
      projectsBySymbol,
      projectSymbolArr,
      projectSurveysById,
      latestProjectSurveyIds
    } = this.props;

    console.log(projectSurveysById)

    return (
      <div className="main-container">
        <span className="projects-container__sub-header">Recent Disclosures</span>
        <ListView
          viewClassName={"row entity-cards"}
          rowClassName={"col-md-12 entity-card__container"}
          rowsIdArray={latestProjectSurveyIds}
          rowsById={projectSurveysById}
          renderRow={SurveyCard}
        />
        <span className="projects-container__sub-header">Projects</span>
        <ListView
          viewClassName={"row entity-cards"}
          rowClassName={"col-md-12 entity-card__container"}
          rowsIdArray={projectSymbolArr}
          rowsById={projectsBySymbol}
          renderRow={ProjectCard}
        />
      </div>
    );
  }
}

const mapState = state => {
  const { projectsBySymbol, projectSymbolArr } = getAllProjects(state);
  const { projectSurveysById, latestProjectSurveyIds } = getProjectSurveys(
    state
  );
  return {
    projectsBySymbol,
    projectSymbolArr,
    projectSurveysById,
    latestProjectSurveyIds
  };
};

const actions = dispatch => {
  return {
    loadInitialData() {
      batchActions([
        dispatch(fetchAllProjects()),
        dispatch(fetchPublishedProjectSurveyStats())
      ]);
    }
  };
};

export default connect(mapState, actions)(ProjectList);
