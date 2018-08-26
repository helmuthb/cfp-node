const express = require('express');
const jwt = require('jsonwebtoken');
const debug = require('debug')('localRoute');

const setup = (pool, jwtKey) => {
  const userUtil = require('../util/user').setup(pool);
  const tokenUtil = require('../util/token').setup(jwtKey);
  const router = express.Router();

  /* Login user */
  router.post('/login', async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const user = await userUtil.verifyLogin(email, password);
    if (user) {
      tokenUtil.signAndSend( { id: user.id }, res);
    }
    else {
      res.status(401).send({ error: 'Login not found or password wrong'});
    }
  });

  /* Register user */
  router.post('/register', async (req, res) => {
    debug('Register', req.body);
    const email = req.body.email;
    const password = req.body.password;
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const rc = await userUtil.registerUser(email, password, firstName, lastName);
    if (rc === userUtil.OK) {
      res.send({ message: 'User registered - please activate'});
    }
    else if (rc === userUtil.USER_ALREADY_REGISTERED) {
      res.status(400).send({ error: 'User is already registered'});
    }
    else if (rc === userUtil.USER_ATTRIBUTES_MISSING) {
      res.status(400).send({ error: 'User attributes missing'});
    }
    else {
      res.status(500).send({ error: 'Unknown error'});
    }
  });

  /* Activate user */
  router.post('/activate', async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const activationKey = req.body.activationKey;
    const user = await userUtil.activateUser(email, password, activationKey);
    if (user) {
      tokenUtil.signAndSend( { id: user.id }, res);
    }
    else {
      res.status(401).send({ error: 'Login not found, password wrong, or activationKey wrong'});
    }
  });

  /* Forgot password */
  router.post('/forgot-password', async (req, res) => {
    const email = req.body.email;
    await userUtil.requestReset(email);
    res.send({ message: 'Reset link sent if found' });
  });

  /* Reset password */
  router.post('/reset-password', async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const resetKey = req.body.resetKey;
    const result = await userUtil.resetLogin(email, password, resetKey);
    if (result) {
      res.send({ message: 'ok' });
    }
    else {
      res.status(401).send({ message: 'failed' });
    }
  });

  /* Change password */
  router.post('/change-password', async (req, res) => {
    const email = req.body.email;
    const oldPassword = req.body.oldPassword;
    const newPassword = req.body.newPassword;
    const result = await userUtil.changePassword(email, oldPassword, newPassword);
    if (result) {
      res.send({ message: 'ok' });
    }
    else {
      res.status(401).send({ message: 'failed' });
    }
  });

  return router;
}

module.exports = { setup };