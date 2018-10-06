const path = require("path");
const fs = require("fs");
const express = require("express");
const morgan = require("morgan");
const { Pool } = require("pg");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const session = require("express-session");
const RateLimit = require("express-rate-limit");
const passport = require("passport");
const PgSession = require("connect-pg-simple")(session);
const authorize = require("./passport/authorize");
const passportSetup = require("./passport");
const routePassword = require("./routes/password.js");
const routeSession = require("./routes/session.js");
const routeUser = require("./routes/user.js");

module.exports = config => {
  // create the app
  const app = express();
  if (!config.isTest) {
    app.use(morgan("tiny"));
  }

  // rate limit api calls
  app.enable("trust proxy");
  var apiLimiter = new RateLimit(config.rateLimit.api);
  app.use("/", apiLimiter);

  // setup cookie and body parsing
  app.use(cookieParser());
  app.use(bodyParser.json());

  // connect to the db
  const pool = new Pool(config.db);

  // manage sessions
  app.use(
    session({
      resave: false,
      saveUninitialized: false,
      secret: config.sessionKey,
      cookie: { maxAge: config.sessionTimeout },
      store: new PgSession({ pool })
    })
  );

  // setup passport authentication
  passportSetup(passport, pool);
  app.use(passport.initialize());
  app.use(passport.session());

  routePassword({ app, pool, passport, config, authorize });
  routeSession({ app, pool, passport, config, authorize });
  routeUser({ app, pool, passport, config, authorize });

  // return the app
  return app;
};
