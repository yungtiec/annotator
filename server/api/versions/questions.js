const router = require("express").Router({ mergeParams: true });
const db = require("../../db");
const {
  Version,
  VersionQuestion,
  VersionAnswer,
  Comment
} = require("../../db/models");
const permission = require("../../access-control")["Disclosure"];
const { ensureAuthentication } = require("../utils");

const _ = require("lodash");
Promise = require("bluebird");
module.exports = router;

router.get("/", async (req, res, next) => {
  try {
    var rawVersion = await Version.scope({
      method: ["byIdWithVersionQuestions", req.params.versionId]
    }).findOne();
    console.log(rawVersion, req.params.versionId)
    var version_questions = rawVersion.version_questions.map(vq => {
      vq = vq.toJSON();
      vq.history = vq.ancestors
        .concat(_.omit(vq, ["ancestors"]))
        .concat(vq.descendents);
      delete vq["ancestors"];
      delete vq["descendents"];
      vq.version_answers[0].history = vq.version_answers[0].ancestors
        .concat(_.omit(vq.version_answers[0], ["ancestors"]))
        .concat(vq.version_answers[0].descendents);
      delete vq.version_answers[0]["ancestors"];
      delete vq.version_answers[0]["descendents"];
      return vq;
    });
    var version = _.assignIn(rawVersion.toJSON(), { version_questions });
    res.send(version);
  } catch (err) {
    next(err);
  }
});

router.post("/", ensureAuthentication, async (req, res, next) => {
  try {
    var version = await Version.scope({
      method: ["byIdWithMetadata", Number(req.params.versionId)]
    }).findOne();
    const canVersion = permission(
      "Version",
      { project: version.document.project, disclosure: version.document },
      req.user
    );
    if (!canVersion) {
      res.sendStatus(403);
      return;
    }
    if (!req.body.reverting) {
      var currentVersionQuestion = await VersionQuestion.findOne({
        where: { id: req.body.versionQuestionId },
        include: [
          { model: VersionQuestion, as: "descendents", require: false }
        ],
        order: [
          [
            { model: VersionQuestion, as: "descendents" },
            "hierarchyLevel",
            "DESC"
          ]
        ]
      });
      var latestVersionQuestion =
        currentVersionQuestion.descendents &&
        currentVersionQuestion.descendents.length
          ? currentVersionQuestion.descendents[0]
          : currentVersionQuestion;
      var [
        newlyAddedVersionQuestion,
        currentVersionQuestion
      ] = await Promise.all([
        VersionQuestion.create({
          version_id: latestVersionQuestion.version_id,
          order_in_version: latestVersionQuestion.order_in_version,
          markdown: req.body.markdown,
          latest: true
        }).then(async nq => {
          await nq.setParent(latestVersionQuestion.id);
          return nq;
        }),
        currentVersionQuestion.update({ latest: false })
      ]);
      var [versionAnswers, comments] = await Promise.all([
        VersionAnswer.update(
          { version_question_id: newlyAddedVersionQuestion.id },
          { where: { version_question_id: req.body.versionQuestionId } }
        ),
        Comment.update(
          { version_question_id: newlyAddedVersionQuestion.id },
          { where: { version_question_id: req.body.versionQuestionId } }
        )
      ]);
      newlyAddedVersionQuestion = await VersionQuestion.findOne({
        where: { id: newlyAddedVersionQuestion.id },
        include: [
          {
            model: VersionAnswer,
            where: { latest: true },
            include: [
              {
                model: db.model("version_answer"),
                as: "ancestors",
                attributes: ["id", "createdAt"],
                required: false
              },
              {
                model: db.model("version_answer"),
                as: "descendents",
                attributes: ["id", "createdAt"],
                required: false
              }
            ],
            order: [
              [
                {
                  model: db.model("version_answer"),
                  as: "descendents"
                },
                "hierarchyLevel",
                "DESC"
              ],
              [
                {
                  model: db.model("version_answer"),
                  as: "ancestors"
                },
                "hierarchyLevel",
                "DESC"
              ]
            ]
          },
          {
            model: VersionQuestion,
            as: "ancestors",
            attributes: ["id", "createdAt"]
          }
        ],
        order: [
          [
            { model: VersionQuestion, as: "ancestors" },
            "hierarchyLevel",
            "DESC"
          ]
        ]
      });
      newlyAddedVersionQuestion = newlyAddedVersionQuestion.toJSON();
      newlyAddedVersionQuestion.history = (
        newlyAddedVersionQuestion.ancestors || []
      )
        .concat([_.omit(newlyAddedVersionQuestion, ["ancestors"])])
        .concat(newlyAddedVersionQuestion.descendents || []);
      newlyAddedVersionQuestion.version_answers[0].history = (
        newlyAddedVersionQuestion.version_answers[0].ancestors || []
      )
        .concat([
          _.omit(newlyAddedVersionQuestion.version_answers[0], ["ancestors"])
        ])
        .concat(newlyAddedVersionQuestion.version_answers[0].descendents || []);

      res.send(newlyAddedVersionQuestion);
    } else {
      var [versionAnswer, prevVersionQuestion] = await Promise.all([
        (VersionAnswer.update(
          { version_question_id: req.body.versionQuestionId },
          { where: { version_question_id: req.body.prevVersionQuestionId } }
        ),
        VersionQuestion.update(
          { latest: false },
          { where: { id: req.body.prevVersionQuestionId } }
        ))
      ]);
      var versionQuestion = await VersionQuestion.findOne({
        where: { id: req.body.versionQuestionId },
        include: [
          {
            model: db.model("version_answer"),
            where: { latest: true },
            include: [
              {
                model: db.model("version_answer"),
                as: "ancestors",
                attributes: ["id", "createdAt"],
                required: false
              },
              {
                model: db.model("version_answer"),
                as: "descendents",
                attributes: ["id", "createdAt"],
                required: false
              }
            ],
            order: [
              [
                {
                  model: db.model("version_answer"),
                  as: "descendents"
                },
                "hierarchyLevel",
                "DESC"
              ],
              [
                {
                  model: db.model("version_answer"),
                  as: "ancestors"
                },
                "hierarchyLevel",
                "DESC"
              ]
            ]
          }
        ]
      }).then(vq => vq.update({ latest: true }));
      versionQuestion = versionQuestion.toJSON();
      versionQuestion.version_answers[0].history = (
        versionQuestion.version_answers[0].ancestors || []
      )
        .concat(_.omit(versionQuestion.version_answers[0], ["ancestors"]))
        .concat(versionQuestion.version_answers[0].descendents || []);
      res.send(versionQuestion);
    }
  } catch (err) {
    console.log(err);
    next(err);
  }
});
