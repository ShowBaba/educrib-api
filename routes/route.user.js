/* eslint-disable no-underscore-dangle */
/* eslint-disable no-shadow */
/* eslint-disable no-param-reassign */
/* eslint-disable no-unused-vars */
/* eslint-disable consistent-return */
const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const passport = require('passport');
const User = require('../models/model.user');

const router = express.Router();
const authenticate = require('../authenticate');

// MUTLER

// configure multer

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'public/images'); // image destination
  },
  filename: (req, file, callback) => {
    callback(null, `${Date.now()}_${file.originalname}`); // originalname = same name as the client stored the name
  },
});

// filter the kind of image you want

const imageFileFilter = (req, file, callback) => {
  // check file extention;
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return callback(new Error('You can upload only image files'), false);
  }
  callback(null, true);
};

// use configuration in application

const maxSize = 2 * 1024 * 1024; // specify img max size

const upload = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: { fileSize: maxSize },
});

const userRouter = express.Router();

router.use(bodyParser.json());

/* GET users listing. */
userRouter.route('/').get(authenticate.varifyUser, (req, res, next) => {
  User.find({})
    .then(
      (users) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({
          data: users,
        });
      },
      (err) => next(err),
    )
    .catch((err) => next(err));
});

// route to signup new users
userRouter
  .route('/signup')
  .post(upload.single('imageFile'), (req, res) => {
    // check if user exist
    User.register(
      new User({
        username: req.body.username,
        email: req.body.email,
      }),
      req.body.password,
      (err, user) => {
        // check
        if (err) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.json({ err });
        } else {
          // console.log(`Filename : ${req.body}`);
          if (req.body.firstname) user.firstname = req.body.firstname;
          if (req.body.lastname) user.lastname = req.body.lastname;
          if (req.file) user.image = req.file.filename;
          user.save((err, user) => {
            if (err) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.json({ err });
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
      },
    );
  });

// login user
// add a passport middleware to authenticate login
userRouter
  .route('/login')
  .post(passport.authenticate('local'), (req, res, next) => {
    // create a token
    const token = authenticate.getToken({ _id: req.user._id });
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({
      success: true,
      token,
      status: 'Login Successful!',
    });
  });

// logout user
userRouter.route('/logout').get((req, res, next) => {
  delete req.session;
  req.logOut();
  return res.redirect('/');
});

// find user by id
userRouter.route('/:userId').get((req, res, next) => {
  User.findById(req.params.userId)
    .then(
      (user) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({
          data: user,
        });
      },
      (err) => next(err),
    )
    .catch((err) => next(err));
});

userRouter.route('/by/username/:username').get((req, res, next) => {
  const param = req.params.username;
  User.find({ username: new RegExp(`^${param}$`, 'i') })
    .then(
      (users) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({
          data: users,
        });
      },
      (err) => next(err),
    )
    .catch((err) => next(err));
});

module.exports = userRouter;
