var express = require('express');
const bodyParser = require('body-parser');
const User = require('../models/user');
var router = express.Router();
const passport = require('passport');
var authenticate = require('../authenticate');

router.use(bodyParser.json());

/* GET users listing. */
router.get('/', authenticate.varifyUser, authenticate.varifyAdmin, (req, res, next) => {
  // res.send('respond with a resource');
  User.find({})
    .then((user) => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(user);
    }, (err) => next(err))
    .catch((err) => next(err));
});

// route to signup new users
router.post('/signup', (req, res, next) => {
  // check if user exist
  User.register(new User(
    {
      username: req.body.username,
      email: req.body.email
    }),
    req.body.password,
    (err, user) => {
      // check
      if (err) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.json({ err: err });
      } else {
        if (req.body.firstname)
          user.firstname = req.body.firstname;
        if (req.body.lastname)
          user.lastname = req.body.lastname;
        // user.email = req.body.email;
        user.save((err, user) => {
          if (err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.json({ err: err });
            return;
          }
          passport.authenticate('local')(req, res, () => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json({
              success: true,
              status: 'Registration Successful!'
            });
          });
        });
      }
    });
});

//login user 
// add a passport middleware to authenticate login
router.post('/login', passport.authenticate('local'), (req, res, next) => {
  // create a token
  var token = authenticate.getToken({ _id: req.user._id });
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json({
    success: true,
    token: token,
    status: 'Login Successful!'
  });
});


// logout user
router.get('/logout', (req, res, next) => {
  // check if session exist
  if (req.session) {
    // remove all cookie data
    req.session.destroy();
    res.clearCookie('session-id');
    res.redirect('/');
  } else {
    let err = new Error('You are not logged in.');
    err.status = 403;
    return next(err);
  }
});

module.exports = router;
