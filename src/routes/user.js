const RateLimit = require("express-rate-limit");
const sendmail = require("../sendmail");
const welcome = require("../templates/welcome");
const config = require("../config");
const utilUser = require("../util/user");
const rateLimit = new RateLimit(config.rateLimit.newUser);

module.exports = ({ app, pool }) => {
  app.route("/user").post(rateLimit, async (req, res, next) => {
    try {
      console.log(req);
      const rc = await utilUser.createUser(
        pool,
        req.body.email,
        req.body.password,
        req.body.first_name,
        req.body.last_name
      );
      res.status(rc.code).send(rc.content);
    } catch (err) {
      console.log(err);
      res.status(500).send({ error: err });
    }
  });
};
