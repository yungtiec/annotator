const {
  Comment,
  Tag,
  Issue,
  User,
  Role,
  Version
} = require("../../../db/models");
const { assignIn, pick } = require("lodash");
const { IncomingWebhook } = require("@slack/client");
const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;
const webhook = new IncomingWebhook(slackWebhookUrl);
const moment = require("moment");
Promise = require("bluebird");

const sendNotificationToSlack = annotation => {
  // Send simple text to the webhook channel
  if (process.env.NODE_ENV === "production")
    webhook.send(
      `Incoming annotation at ${annotation.uri}/question/${
        annotation.version_question_id
      }/comment/${
        annotation.id
      }\nor view it in your admin panel at https://tbp-annotator.herokuapp.com/admin`,
      function(err, res) {
        if (err) {
          console.log("Error:", err);
        } else {
          console.log("Message sent: ", res);
        }
      }
    );
};

const getAnnotatedComments = async (req, res, next) => {
  try {
    var comments = await Comment.findAll({
      where: {
        version_id: req.query.version_id,
        version_question_id: req.query.version_question_id,
        reviewed: { $not: "spam" },
        hierarchyLevel: 1
      },
      include: [
        {
          model: Tag,
          attributes: ["name", "id"]
        }
      ]
    }).map(annotation => {
      return annotation.toJSON();
    });
    res.send({
      rows: comments,
      total: comments.length
    });
  } catch (err) {
    next(err);
  }
};

const postAnnotatedComment = async (req, res, next) => {
  try {
    const {
      ranges,
      quote,
      text,
      uri,
      version_question_id,
      version_id,
      tags
    } = req.body;
    const isAdmin = req.user.roles.filter(r => r.name === "admin").length;
    const version = await Version.findById(version_id);
    const isClosedForComment =
      Number(version.comment_until_unix) - Number(moment().format("x")) <= 0;
    if (isClosedForComment) {
      res.sendStatus(404);
      return;
    }
    var newComment = await Comment.create({
      uri,
      version_question_id,
      version_id,
      quote: quote.replace("\n  \n\n  \n    \n    \n      Cancel\nSave", ""),
      comment: text,
      ranges,
      reviewed: isAdmin ? "verified" : "pending"
    });
    const issuePromise = Issue.create({
      open: true,
      comment_id: newComment.id
    });
    const ownerPromise = newComment.setOwner(req.user.id);
    await Promise.all([ownerPromise, issuePromise]);
    newComment = await Comment.scope({
      method: ["flatThreadByRootId", { where: { id: newComment.id } }]
    }).findOne();
    // sendNotificationToSlack(newComment);
    res.send(newComment);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAnnotatedComments,
  postAnnotatedComment
};
