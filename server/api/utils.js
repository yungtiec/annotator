const { User, Role, Comment } = require("../db/models");
const _ = require("lodash");

const ensureAuthentication = async (req, res, next) => {
  if (req.user) {
    next();
  } else {
    res.sendStatus(401);
  }
};

const ensureAdminRole = async (req, res, next) => {
  const requestor = await User.findOne({
    where: { id: req.user.id },
    include: [
      {
        model: Role
      }
    ]
  });
  if (requestor.roles.filter(r => r.name === "admin").length) {
    next();
  } else {
    res.sendStatus(401);
  }
};

const ensureAdminRoleOrOwnership = async (req, res, next) => {
  try {
    const requestor = await User.scope({
      method: ["roles", Number(req.user.id)]
    }).findOne();
    if (
      requestor.roles.filter(r => r.name === "admin").length ||
      Number(req.params.userId) === req.user.id
    ) {
      next();
    } else {
      res.sendStatus(401);
    }
  } catch (err) {
    next(err);
  }
};

const ensureAdminRoleOrCommentOwnership = async (req, res, next) => {
  try {
    const requestor = await User.findOne({
      where: { id: req.user.id },
      include: [
        {
          model: Role
        }
      ]
    });
    const comment = Comment.findById(req.body.comment.id);
    if (
      requestor.roles.filter(r => r.name === "admin").length ||
      comment.owner_id === req.user.id
    ) {
      next();
    } else {
      res.sendStatus(401);
    }
  } catch (err) {
    next(err);
  }
};

const ensureResourceAccess = async (req, res, next) => {
  const requestor = await User.findById(req.user.id);
  if (requestor.restricted_access) res.sendStatus(403);
  else next();
};

const getEngagedUsers = async projectSurvey => {
  var comments = await projectSurvey.getComments({
    include: [
      {
        model: User,
        as: "owner"
      }
    ]
  });
  var commentators = _.uniqBy(comments.map(c => c.owner.toJSON()), "id");
  var issueCreators = _.uniqBy(
    comments.filter(c => !!c.issue).map(c => c.owner.toJSON()),
    "id"
  );
  // we might want to tailor the notification based on their action
  return commentators;
};

module.exports = {
  ensureAuthentication,
  ensureAdminRole,
  ensureAdminRoleOrCommentOwnership,
  ensureAdminRoleOrOwnership,
  ensureResourceAccess,
  getEngagedUsers
};
