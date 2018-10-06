const sendmail = require("../sendmail");
const passwordChanged = require("../templates/passwordChanged");
const { generateHash, verifyHash } = require("../passport/local");

module.exports = ({ app, pool, config, authorize }) => {
  app.put("/password", authorize, (req, res) => {
    if (!verifyHash(req.body.password, req.user.passwordHash)) {
      return res.sendStatus(401);
    }
    pool.query(
      'update "user" set password = $2, updated_at = now() where id = $1',
      [req.user.id, generateHash(req.body.new_password)],
      (err, result) => {
        if (err) {
          console.error("failed to change password", err);
          return res.status(500).send({ error: "Unxpected Error" });
        }
        sendmail(req.user, passwordChanged);
        res.sendStatus(200);
      }
    );
  });
};
