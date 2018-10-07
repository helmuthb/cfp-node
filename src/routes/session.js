const RateLimit = require("express-rate-limit");
const config = require("../config");
const rateLimit = new RateLimit(config.rateLimit.login);

const sendUser = (req, res) => {
  const first_name = req.user.first_name;
  const last_name = req.user.last_name;
  const email = req.user.email;
  const admin = req.user.admin;
  res.status(200).send({
    user: { first_name, last_name, email, admin }
  });
};

module.exports = ({ app, pool, authorize, passport }) => {
  app
    .route("/session")
    .get(authorize, sendUser)
    .delete(authorize, (req, res) => {
      req.logout();
      res.sendStatus(200);
    })
    .post(rateLimit, passport.authenticate("local-login"), sendUser);
};
