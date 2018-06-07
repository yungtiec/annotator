const router = require("express").Router();
const { Comment, Tag, Issue, User, Role } = require("../db/models");
const { assignIn, pick } = require("lodash");
const { ensureAuthentication, ensureResourceAccess } = require("./utils");
const { IncomingWebhook } = require("@slack/client");
const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;
const webhook = new IncomingWebhook(slackWebhookUrl);
Promise = require("bluebird");
module.exports = router;

function sendNotificationToSlack(annotation) {
  // Send simple text to the webhook channel
  if (process.env.NODE_ENV === "production")
    webhook.send(
      `Incoming annotation at ${annotation.uri}/question/${
        annotation.survey_question_id
      }/annotation/${
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
}

router.post(
  "/store",
  ensureAuthentication,
  ensureResourceAccess,
  async (req, res, next) => {
    try {
      const {
        ranges,
        quote,
        text,
        uri,
        annotator_schema_version,
        survey_question_id,
        project_survey_id,
        tags,
        issue
      } = req.body;
      const isAdmin = await User.findOne({
        where: { id: req.user.id },
        include: [
          {
            model: Role
          }
        ]
      }).then(
        requestor => requestor.roles.filter(r => r.name === "admin").length
      );
      var newComment = await Comment.create({
        uri,
        survey_question_id,
        project_survey_id,
        quote: quote.replace("\n  \n\n  \n    \n    \n      Cancel\nSave", ""),
        comment: text,
        ranges,
        annotator_schema_version,
        reviewed: isAdmin ? "verified" : "pending"
      });
      const issuePromise = issue
        ? Issue.create({
            open: true,
            annotation_id: newComment.id
          })
        : null;
      const tagPromises = Promise.map(tags, async tag => {
        const [tagInstance, created] = await Tag.findOrCreate({
          where: { name: tag }
        });
        return newComment.addTag(tagInstance.id);
      });
      const ownerPromise = newComment.setOwner(req.user.id);
      await Promise.all([tagPromises, ownerPromise, issuePromise]);
      newComment = await Comment.scope({
        method: ["flatThreadByRootId", { where: { id: newComment.id } }]
      }).findOne();
      sendNotificationToSlack(newComment);
      res.send(newComment);
    } catch (err) {
      next(err);
    }
  }
);

router.get("/search", async (req, res, next) => {
  try {
    var comments = await Comment.findAll({
      where: {
        uri: req.query.uri,
        survey_question_id: req.query.survey_question_id,
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
});
