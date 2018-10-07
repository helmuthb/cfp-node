const RateLimit = require("express-rate-limit");
const config = require("../config");
const utilUser = require("../util/user");
const rateLimit = new RateLimit(config.rateLimit.newUser);

module.exports = ({ app, pool, authorize }) => {
  app
    .route("/password")
    .delete(rateLimit, (req, res) => {
      utilUser
        .requestPasswordReset(pool, req.body.email)
        .then(rc => {
          res.status(rc.code).send(rc.content);
        })
        .catch(err => {
          res.status(500).send({ error: "Unknown error" });
        });
    })
    .post((req, res) => {
      utilUser
        .performPasswordReset(
          pool,
          req.body.email,
          req.body.reset_key,
          req.body.new_password
        )
        .then(rc => {
          res.status(rc.code).send(rc.content);
        })
        .catch(err => {
          res.status(500).send({ error: "Unknown error" });
        });
    })
    .put(authorize, (req, res) => {
      utilUser
        .updatePassword(
          pool,
          req.user,
          req.body.password,
          req.body.new_password
        )
        .then(rc => {
          res.status(rc.code).send(rc.content);
        })
        .catch(err => {
          res.status(500).send({ error: "Unknown error" });
        });
    });
};
