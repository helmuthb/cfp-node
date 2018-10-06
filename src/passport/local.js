const bcrypt = require("bcrypt");
const LocalStrategy = require("passport-local").Strategy;
const uuid = require("uuid/v4");

const generateHash = password =>
  bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
const verifyHash = (password, passwordHash) =>
  bcrypt.compareSync(password, passwordHash);

const localConfig = {
  usernameField: "email",
  passwordField: "password",
  passReqToCallback: true // allows us to pass back the entire request to the callback
};

module.exports = {
  generateHash,
  verifyHash,
  setup(passport, pool) {
    passport.use(
      "local-signup",
      new LocalStrategy(localConfig, (req, email, password, done) => {
        const emailLowerCase = email.toLowerCase();
        pool.query(
          'select * from "user" where email = $1',
          [emailLowerCase],
          (err, res) => {
            if (err) {
              return done(err);
            }
            const user = res.rows[0];
            // check to see if theres already a user with that email
            if (user) {
              return done(null, false, {
                message: "Email address already registered"
              });
            }
            const { first_name, last_name } = req.body;
            pool.query(
              'insert into "user" ' +
                "(first_name, last_name, email, password, activation_key) " +
                "values ($1, $2, $3, $4, $5) returning *",
              [
                first_name,
                last_name,
                emailLowerCase,
                generateHash(password),
                uuid()
              ],
              (err, res) => (err ? done(err) : done(null, res.rows[0]))
            );
          }
        );
      })
    );

    passport.use(
      "local-login",
      new LocalStrategy(localConfig, (req, email, password, done) => {
        if (!password) {
          return done(null, false);
        }
        const emailLowerCase = email.toLowerCase();
        pool.query(
          'select * from "user" where email = $1',
          [emailLowerCase],
          (err, res) => {
            if (err) {
              return done(err);
            }
            const user = res.rows[0];

            if (
              user &&
              user.activation_key &&
              user.activation_key === req.body.activation_key &&
              verifyHash(password, user.password)
            ) {
              // activate first time users
              pool.query(
                'update "user" set activation_key = NULL, updated_at = now() where id = $1',
                [user.id],
                (err, res) => {
                  if (err) {
                    return done(err);
                  }
                  // auth passed
                  done(null, user);
                }
              );
            } else if (
              !user ||
              user.activationKey ||
              !verifyHash(password, user.password)
            ) {
              // auth failed
              done(null, false);
            } else {
              // auth passed
              done(null, user);
            }
          }
        );
      })
    );
  }
};
