const LocalStrategy = require("passport-local").Strategy;
const utilUser = require("../util/user");

const localConfig = {
  usernameField: "email",
  passwordField: "password",
  passReqToCallback: true // allows us to pass back the entire request to the callback
};

module.exports = {
  setup: (passport, pool) => {
    passport.use(
      "local-login",
      new LocalStrategy(localConfig, async (req, email, password, done) => {
        try {
          // either the user or null
          const user = await utilUser.verifiedUser(pool, email, password);
          done(null, user);
        } catch (err) {
          done(err);
        }
      })
    );
  }
};
