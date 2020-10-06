var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const config = require('./config');
var usersRouter = require('./routes/route.user');
const passport = require('passport');
var logger = require('morgan');
var session = require('express-session');
var indexRouter = require('./routes/index');
var postRouter = require('./routes/route.post');
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

var app = express();

var corsOptions = {
  origin: "*"
};
app.use(cors(corsOptions));
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser());

app.use(passport.initialize());

// TODO: Include proper status codes in all response..
app.get('/', (req, res) => {
  res.redirect('/api/v1');
});
app.use('/api/v1/', indexRouter);
// TODO: change the user activity endpoint below to /api/auth
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/posts', postRouter);

// set up a wildcard route
app.get('*', (req, res) => {
  res.redirect('/api/v1');
});

app.use(express.static(path.join(__dirname, 'public')));

const mongoose = require('mongoose');

const localUrl = config.mongoUrl;
let liveUrl = process.env.DB_CONNECTION;
// replace liveUrl with localUrl to use local mongodb
const connect = mongoose.connect(liveUrl, {
  useUnifiedTopology: true, useNewUrlParser: true,
  useFindAndModify: false,
  useCreateIndex: true
});

// establish connection
connect.then((db) => {
  console.log('Connected to Database');
}, (err) => { console.log(err); });


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
