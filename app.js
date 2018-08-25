const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const crypto = require('crypto');

const jwtKey = process.env.JWT_KEY || crypto.randomBytes(32).toString('base64');
const passport = require('./passport').setup(jwtKey);

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const tokenRouter = require('./routes/token').setup(passport, jwtKey);

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/token', tokenRouter);

module.exports = app;
