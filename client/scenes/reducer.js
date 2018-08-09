import { combineReducers } from "redux";

import { default as projectReducer } from "./project/reducer";
import { default as profileReducer } from "./profile/reducer";
import { default as adminReducer } from "./admin/reducer";
import { default as uploadReducer } from "./upload/reducer";
import { default as activityBoardReducer } from "./activity-board/reducer";
import { default as dashboardReducer } from "./dashboard/reducer";
import { default as surveyReducer } from "./survey/reducer";

export default combineReducers({
  project: projectReducer,
  profile: profileReducer,
  admin: adminReducer,
  upload: uploadReducer,
  activityBoard: activityBoardReducer,
  dashboard: dashboardReducer,
  survey: surveyReducer
});
