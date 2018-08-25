const passport = require('passport');
const passportJWT = require('passport-jwt');
const debug = require('debug')('passport');

const ExtractJwt = passportJWT.ExtractJwt;
const JwtStrategy = passportJWT.Strategy;


const setup = (pool, jwtKey) => {

    const userUtil = require('./util/user').setup(pool);

    debug('Key: '+ jwtKey);
    const jwtOptions = {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: jwtKey
    };
    
    const strategy = new JwtStrategy(jwtOptions, async (payload, next) => {
      debug('payload received', payload);
      const user = await userUtil.getUserById(payload.id);
      next(null, user);
    });
    
    passport.use(strategy);
    passport.initialize();
    return passport;
};

module.exports = { setup };
