const express = require('express');
const passport = require('passport');
// const uploadUtil = require('../utils/multer.config');
const authController = require('../controllers/auth.controller');
const authenticate = require('../authenticate');
// const upload = uploadUtil;

const router = express.Router();

/* GET users listing. */
router.route('/').get(authenticate.varifyAdmin, authController.getAllUsers);

// route to signup new users
router
  .route('/signup')
  .post(authController.signUp);

// login user
// add a passport middleware to authenticate login
router
  .route('/login')
  .post(passport.authenticate('local'), authController.login);

// logout user
router.route('/logout').get(authController.logout);

// find user by id
router.route('/:userId').get(authController.getUserById);

router.route('/by/username/:username').get(authController.getUserbyUsername);

module.exports = router;
