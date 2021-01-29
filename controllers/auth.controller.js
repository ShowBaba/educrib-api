const passport = require('passport');
const authenticate = require('../authenticate');
const User = require('../models/auth.model');

const authHandler = {
  getAllUsers: async (req, res, next) => {
    try {
      const users = await User.find({});
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json({
        data: users,
      });
    } catch (error) {
      next(error);
    }
  },
  signUp: async (req, res, next) => {
    try {
      await User.register(
        new User({
          username: req.body.username,
          email: req.body.email,
        }),
        req.body.password,
        (err, user) => {
          if (err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.json({ err });
          } else {
            if (req.body.firstname) user.firstname = req.body.firstname;
            if (req.body.lastname) user.lastname = req.body.lastname;
            user.save((err_, user_) => {
              if (err_) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.json({ err_ });
                return;
              }
              passport.authenticate('local')(req, res, () => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json({
                  success: true,
                  status: 'Registration Successful!',
                });
              });
            });
          }
        }
      );
    } catch (error) {
      next(error);
    }
  },
  login: async (req, res, next) => {
    try {
      const token = await authenticate.getToken({ _id: req.user._id });
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json({
        success: true,
        token,
        status: 'Login Successful!',
      });
    } catch (error) {
      next(error);
    }
  },
  logout: async (req, res) => {
    delete req.session;
    req.logOut();
    return res.redirect('/');
  },
  getUserById: async (req, res, next) => {
    try {
      const user = await User.findById(req.params.userId);
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json({
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },
  getUserbyUsername: async (req, res, next) => {
    try {
      const param = req.params.username;
      const user = await User.find({ username: new RegExp(`^${param}$`, 'i') });
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json({
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = authHandler;
