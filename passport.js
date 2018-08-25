const passport = require('passport');
const passportJWT = require('passport-jwt');
const debug = require('debug')('passport');

const ExtractJwt = passportJWT.ExtractJwt;
const JwtStrategy = passportJWT.Strategy;


const setup = (jwtKey) => {

    debug('Key: '+ jwtKey);
    const jwtOptions = {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: jwtKey
    };
    
    const strategy = new JwtStrategy(jwtOptions, (payload, next) => {
      debug('payload received', payload);
      // usually this would be a database call:
      if (payload.id === 1) {
          const user = {
              id: 1,
              login: 'test@example.com',
              firstName: 'Max',
              lastName: 'Testuser'
          };
          next(null, user)
      }
      else {
          next(null, false);
      }
    });
    
    passport.use(strategy);
    passport.initialize();
    return passport;
};

module.exports = { setup };
