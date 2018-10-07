const RateLimit = require("express-rate-limit");
const sendmail = require("../sendmail");
const welcome = require("../templates/welcome");
const config = require("../config");
const utilUser = require("../util/user");
const rateLimit = new RateLimit(config.rateLimit.newUser);

module.exports = ({ app, authorize, pool }) => {
  app
    .route("/user")
    // POST - register a new user
    .post(rateLimit, async (req, res, next) => {
      try {
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
        res.status(500).send({ error: "Unknown error" });
      }
    })
    // PUT - update or activate a user
    .put(rateLimit, authorize, async (req, res, next) => {
      try {
        let rc;
        if (req.body.activation_key) {
          rc = await utilUser.activateUser(
            pool,
            req.user,
            req.body.activation_key
          );
        } else {
          rc = await utilUser.updateUser(pool, req.user, req.body);
        }
        res.status(rc.code).send(rc.content);
      } catch (err) {
        console.log(err);
        res.status(500).send({ error: "Unknown error" });
      }
    });
};
