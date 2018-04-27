import axios from "axios";

export function getCommentsBySurvey(projectSurveyId) {
  return axios
    .get("/api/project/survey/comment", {
      params: {
        projectSurveyId
      }
    })
    .then(res => res.data);
}

export function postComment({ projectSurveyId, comment, tags, issueOpen }) {
  return axios
    .post("/api/project/survey/comment", { projectSurveyId, comment, tags, issueOpen })
    .then(res => res.data);
}

export function postReplyToComment({ parentId, comment }) {
  return axios
    .post("/api/project/survey/comment/reply", { parentId, comment })
    .then(res => res.data);
}

export function postUpvoteToComment({ commentId, hasUpvoted }) {
  return axios
    .post("/api/project/survey/comment/upvote", { commentId, hasUpvoted })
    .then(res => res.data);
}

export function updateComment({ commentId, comment, tags, issueOpen }) {
  return axios
    .post("/api/project/survey/comment/edit", { commentId, comment, tags, issueOpen })
    .then(res => res.data);
}

export function postPendingCommentStatus({ commentId, reviewed }) {
  return axios.post("/api/project/survey/comment/verify", {
    commentId,
    reviewed
  });
}

export function updateCommentIssueStatus({ commentId, open }) {
  return axios.post("/api/project/survey/comment/issue", {
    commentId,
    open
  });
}
