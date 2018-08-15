const router = require("express").Router({ mergeParams: true });
const { ensureAuthentication } = require("./utils");
const { IncomingWebhook } = require("@slack/client");
const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;
const webhook = new IncomingWebhook(slackWebhookUrl);
module.exports = router;

router.post("/", ensureAuthentication, async (req, res, next) => {
  try {
    if (process.env.NODE_ENV === "production")
      webhook.send(req.body.feedback, function(err, result) {
        if (err) {
          next(err);
        } else {
          res.sendStatus(200);
        }
      });
    else res.sendStatus(200);
  } catch (err) {
    next(err);
  }
});
