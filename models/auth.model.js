/* eslint-disable linebreak-style */
const mongoose = require('mongoose');

const { Schema } = mongoose;
const passportLocalMongoose = require('passport-local-mongoose');

const User = new Schema({
  firstname: {
    type: String,
    default: '',
  },
  lastname: {
    type: String,
    default: '',
  },
  email: {
    type: String,
    required: true,
  },
  admin: {
    type: Boolean,
    default: false,
  },
  image: {
    type: String,
    default: 'default.png', // use a default image from /public/images folder
  },
});

// use the passport plugin to add
// username and password schema
User.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', User);
