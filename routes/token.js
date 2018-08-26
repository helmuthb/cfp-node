const express = require('express');

const setup = (passport, jwtKey) => {
  const router = express.Router();
  const tokenUtil = require('../util/token').setup(jwtKey);

  /* renew the token */
  router.get(
    '',
    passport.authenticate('jwt', { session: false }),
    (req, res, next) => {
      const payload = {id: req.user.id};
      tokenUtil.signAndSend(payload, res);
  });

  return router;
}

module.exports = { setup };