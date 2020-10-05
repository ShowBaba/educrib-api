var express = require('express');
const bodyParser = require('body-parser');
const User = require('../models/user');
var router = express.Router();
const passport = require('passport');
var authenticate = require('../authenticate');

const userRouter = express.Router();

router.use(bodyParser.json());

/* GET users listing. */
userRouter.route('/')
  .get(authenticate.varifyUser, (req, res, next) => {
    User.find({})
      .then((users) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({
          data: users
        });
      }, (err) => next(err))
      .catch((err) => next(err));
  });

// route to signup new users
userRouter.route('/signup')
  .post((req, res, next) => {
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
userRouter.route('/login')
  .post(passport.authenticate('local'), (req, res, next) => {
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
userRouter.route('/logout')
  .get((req, res, next) => {
    delete req.session;
    req.logOut();
    return res.redirect('/');
  });


//find user by id
userRouter.route('/:userId')
  .get((req, res, next) => {
    User.findById(req.params.userId)
      .then((user) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({
          data: user
        });
      }, (err) => next(err))
      .catch((err) => next(err));
  });

userRouter.route('/by/username/:username')
  .get((req, res, next) => {
    let param = req.params.username;
    User.find({ username: new RegExp('^'+param+'$', "i") })
      .then((users) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({
          data: users
        });
      },
        (err) => next(err))
      .catch((err) => next(err));
  });

module.exports = userRouter;
