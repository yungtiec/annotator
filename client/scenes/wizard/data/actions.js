import * as types from "./actionTypes.js";
import stepSchemas from "../../../../json-schema/step-schemas.json";
import { steps } from "../../../../json-schema/step-array.json";
import { getWizardSchemaById, postDocumentMetadata } from "./services";

export function fetchStepArrayAndSchemas(wizardSchemaId) {
  return async (dispatch, getState) => {
    const wizardSchema = await getWizardSchemaById(wizardSchemaId);
    try {
      dispatch({
        type: types.STEP_ARRAY_AND_SCHEMAS_FETCH_SUCCESS,
        stepSchemas: wizardSchema.step_schemas_json,
        stepArray: wizardSchema.step_array_json.steps
      });
    } catch (error) {
      console.log(error);
      // Todos: error handling
    }
  };
}

export function updateFormDataInStore(formDataPath, formData) {
  return {
    type: types.FORM_DATA_IN_STORE_UPDATED,
    formData,
    formDataPath
  };
}

export function updateCurrentProject(project) {
  return {
    type: types.CURRENT_PROJECT_UPDATED,
    project
  };
}

export function submitDocumentMetadata({ title, description, project }) {
  return async (dispatch, getState) => {
    try {
      const currentDocument = getState().scenes.wizard.data.document;
      if (!currentDocument) {
        const { document, version } = await postDocumentMetadata({
          title,
          description,
          projectId: project.id
        });
        dispatch({
          type: types.DOCUMENT_METADATA_SUBMITTED,
          document,
          version,
          project
        });
      } else {
        const document = await putDocumentMetadata({
          title,
          description,
          projectId: project.id
        });
        dispatch({
          type: types.DOCUMENT_METADATA_SUBMITTED,
          document,
          project
        });
      }
    } catch (err) {}
  };
}
