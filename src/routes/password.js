const RateLimit = require("express-rate-limit");
const sendmail = require("../sendmail");
const passwordChanged = require("../templates/passwordChanged");
const passwordReset = require("../templates/passwordReset");
const { generateHash, verifyHash } = require("../passport/local");
const uuid = require("uuid/v4");

const rateLimit = new RateLimit(config.rateLimit.newUser);

module.exports = ({ app, pool, authorize }) => {
  app
    .route("/password")
    .delete(rateLimit, (req, res) => {
      // add a password-reset info to user or retrieve existing one
      pool.query(
        'select * from "user" where email = $1',
        [req.body.email],
        (err, result) => {
          if (err) {
            console.error("failed to request password reset", err);
            return res.status(500).send({ error: "Unxpected Error" });
          }
          if (result.rows.length > 0) {
            const user = result.rows[0];
            const lastChanged = Date.now() - user.updated_at.getTime();
            // Do nothing if last change was less than one minute ago
            if (lastChanged < config.resetPassword.minChangedTime) {
              return res
                .sendStatus(425)
                .send({ error: "User modified just recently" });
            }
            // Re-create reset token if too old
            const expired = Date.now() - config.resetPassword.expiration;
            let sqlQuery;
            let sqlArgs;
            if (!user.reset_time || user.reset_time.getTime() < expired) {
              user.reset_time = new Date();
              user.reset_key = uuid();
              sqlQuery =
                "update user " +
                " set reset_key = $2, reset_time = $3, updated_at = now() " +
                " where email = $1";
              sqlArgs = [user.email, user.reset_key, user.reset_time];
            } else {
              sqlQuery = "update user set updated_at = now()";
              sqlArgs = [user.email];
            }
            pool.query(sqlQuery, sqlArgs, (err, res) => {
              if (err) {
                return res.sendStatus(500).send({ error: "Unexpected Error" });
              }
              sendmail(user, resetPasswordRequest);
              return res.sendStatus(200);
            });
          } else {
            res.sendStatus(200);
          }
        }
      );
    })
    .post((req, res) => {
      // check the password reset key
      pool.query(
        'select * from "user" where email = $1',
        [req.body.email],
        (err, result) => {
          if (err) {
            console.error("failed to get password reset info", err);
            return res.status(500).send({ error: "Unxpected Error" });
          }
          if (result.rows.length > 0) {
            const user = result.rows[0];
            const expired = Date.now() - config.resetPassword.expiration;
            if (
              user.reset_time &&
              user.reset_time > expired &&
              user.reset_key &&
              user.reset_key === req.body.reset_key
            ) {
              // perform password reset
              pool.query(
                'update "user" set password = $2, updated_at = now() where id = $1',
                [user.id, generateHash(req.body.new_password)],
                (err, res) => {
                  if (err) {
                    console.error("failed to reset password", err);
                    return res.status(500).send({ error: "Unexpected Error" });
                  }
                  sendmail(user, passwordChanged);
                  return res.sendStatus(200);
                }
              );
              // response done in promise
              return;
            }
          }
          // wrong email, no reset key or wrong key provided - error
          return res.sendStatus(401);
        }
      );
    })
    .put(authorize, (req, res) => {
      if (!verifyHash(req.body.password, req.user.password)) {
        return res.sendStatus(401);
      }
      pool.query(
        'update "user" set password = $2, updated_at = now() where id = $1',
        [req.user.id, generateHash(req.body.new_password)],
        (err, res) => {
          if (err) {
            console.error("failed to change password", err);
            return res.status(500).send({ error: "Unexpected Error" });
          }
          sendmail(req.user, passwordChanged);
          res.sendStatus(200);
        }
      );
    });
};
