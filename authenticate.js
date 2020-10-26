/* eslint-disable linebreak-style */
/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable no-underscore-dangle */
/* eslint-disable new-cap */
const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const { ExtractJwt } = require('passport-jwt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const User = require('./models/model.user');

dotenv.config();

// var config = require('./config');

// configure pssport with the new local strategy

exports.local = passport.use(new localStrategy(User.authenticate()));
// serialize and deserialize user info
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// method to create a token using the param
exports.getToken = (user) =>
// create token
  jwt.sign(user, process.env.secretKey,
    { expiresIn: 3600 });
// TODO: add { expiresIn: 3600 } to set token duration
// token expires in an hour

// specify how the token should be extracted from incoming
// request e.g fromHeader, fromBody, query params
// using the ExtrackJwt methods
const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.secretKey;

exports.jwtPassport = passport.use(new JwtStrategy(opts,
  (jwtPayload, done) => {
    // console.log(`Jwt payload: \n${jwtPayload}`);
    User.findOne({ _id: jwtPayload._id }, (err, user) => {
      if (err) {
        return done(err, false);
      } if (user) {
        // load the user document into the req body
        return done(null, user);
      }
      // you can create a new user instead of passing
      // false as the second parameter below
      return done(null, false);
    });
  }));

exports.varifyUser = passport.authenticate('jwt', { session: false });

exports.varifyAdmin = (req, res, next) => {
  // console.log(req.user);
  if (req.user.admin) {
    return next();
  }
  const err = new Error('You are not authorized to perform this operation');
  err.statusCode = 403; // operation not supported
  return next(err);
};
