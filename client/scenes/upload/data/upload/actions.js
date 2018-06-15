import * as types from "./actionTypes";
import { postMarkdown, getManagedProjects } from "./services";
import history from "../../../../history";
import { orderBy, keyBy } from "lodash";

export const fetchManagedProjects = () => async (dispatch, getState) => {
  try {
    const projects = await getManagedProjects();
    const projectsBySymbol = keyBy(projects, "symbol");
    const projectSymbolArr = projects.map(project => project.symbol);
    dispatch({
      type: types.MANAGED_PROJECTS_FETCH_SUCCESS,
      projectsBySymbol,
      projectSymbolArr
    });
  } catch (err) {
    console.log(err);
  }
};

export const importMarkdown = markdown => ({
  type: types.MARKDOWN_IMPORTED,
  markdown
});

export const uploadMarkdownToServer = () => async (dispatch, getState) => {
  try {
    const state = getState();
    const {
      markdown,
      collaboratorEmails,
      commentPeriodInDay,
      selectedProject
    } = state.scenes.upload.data.upload;
    const projectSurvey = await postMarkdown({
      markdown,
      collaboratorEmails,
      commentPeriodInDay,
      selectedProjectSymbol: selectedProject.symbol
    });
    history.push(
      `/project/${selectedProject.symbol}/survey/${projectSurvey.id}`
    );
    dispatch({
      type: types.MARKDOWN_UPLOADED
    });
  } catch (err) {
    console.log(err);
  }
};

export const updateCollaborators = collaboratorEmails => ({
  type: types.COLLABORATOR_UPDATED,
  collaboratorEmails
});

export const updateCommentPeriod = commentPeriodInDay => ({
  type: types.COMMENT_PERIOD_UPDATED,
  commentPeriodInDay
});

export const updateSelectedProject = selectedProject => ({
  type: types.SELECTED_PROJECT_UPDATED,
  selectedProject
});
