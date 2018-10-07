const setupLocal = require("./local").setup;
const utilUser = require("../util/user");

module.exports = (passport, pool) => {
  passport.serializeUser((user, done) => done(null, user.id));

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await utilUser.getUserForId(pool, id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  setupLocal(passport, pool);
};
