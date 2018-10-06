const setupLocal = require("./local").setup;

module.exports = (passport, pool) => {
  passport.serializeUser((user, done) => done(null, user.id));

  passport.deserializeUser((id, done) => {
    pool.query('select * from "user" where id = $1', [id], (err, res) => {
      done(err, res.rows[0]);
    });
  });

  setupLocal(passport, pool);
};
