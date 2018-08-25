const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const crypto = require('crypto');
const pg = require('pg');
const debug = require('debug')('app');
const camelCase = require('camelcase-keys');

pg.types.setTypeParser(1114,
    stringValue => new Date(Date.parse(stringValue + "+0000"))
);
pg.types.setTypeParser(1184,
    stringValue => new Date(Date.parse(stringValue + "+0000"))
);
const pool = new pg.Pool();

(async () => {
    const res = await pool.query('select * from "user"');
    debug('All users', res);
    debug('First User', res.rows[0]);
    debug('First user camel-case', camelCase(res.rows[0]));
})();

const jwtKey = process.env.JWT_KEY || crypto.randomBytes(32).toString('base64');
const passport = require('./passport').setup(pool, jwtKey);

const indexRouter = require('./routes/index');
const tokenRouter = require('./routes/token').setup(passport, jwtKey);
const localRouter = require('./routes/local').setup(pool, jwtKey);
const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/token', tokenRouter);
app.use('/local', localRouter);

module.exports = app;
