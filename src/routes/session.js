const RateLimit = require("express-rate-limit");
const config = require("../config");
const rateLimit = new RateLimit(config.rateLimit.login);

const sendUser = (req, res) => {
  const first_name = req.user.first_name;
  const last_name = req.user.last_name;
  const email = req.user.email;
  const admin = req.user.admin;
  const is_activated = !req.user.activation_key;
  res.status(200).send({
    user: { first_name, last_name, email, admin, is_activated }
  });
};

module.exports = ({ app, authorize, passport }) => {
  app
    .route("/session")
    .get(authorize, sendUser)
    .delete(authorize, (req, res) => {
      req.logout();
      res.sendStatus(200);
    })
    .post(rateLimit, passport.authenticate("local-login"), sendUser);
};
