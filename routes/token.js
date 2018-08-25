const express = require('express');
const jwt = require('jsonwebtoken');


const setup = (passport, jwtKey) => {
  const router = express.Router();

  const signAndSend = (payload, res) => {
    jwt.sign(payload, jwtKey, { expiresIn: '30m' }, (err, token) => {
      if (err) {
        res.status(500).send({error: err});
      }
      else {
        res.send({message: 'ok', token: token});
      }
    });
  };

  /* get initial token */
  router.get('/login-dummy', (req, res, next) => {
    const payload = {id: 1};
    signAndSend(payload, res);
  });

  /* renew the token */
  router.get(
    '/renew',
    passport.authenticate('jwt', { session: false }),
    (req, res, next) => {
      const payload = {id: req.user.id};
      signAndSend(payload, res);
  });

  /* show auth content */
  router.get(
    '/me',
    passport.authenticate('jwt', { session: false }),
    (req, res, next) => {
      res.send({message: "ok", user: req.user });
    });

  return router;
}

module.exports = { setup };