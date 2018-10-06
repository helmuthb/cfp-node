const RateLimit = require("express-rate-limit");
const sendmail = require("../sendmail");
const welcome = require("../templates/welcome");
const config = require("../config");

const rateLimit = new RateLimit(config.rateLimit.newUser);

module.exports = ({ app, passport }) => {
  app.post("/user", rateLimit, (req, res, next) =>
    passport.authenticate("local-signup", (err, user, info) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).send(info);
      }
      sendmail(user, welcome);
      return res.sendStatus(201);
    })(req, res, next)
  );
};
