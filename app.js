const createError = require('http-errors');
const express = require('express');
const path = require('path');
const logger = require('morgan');
const passport = require('passport');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const config = require('./config');
const usersRouter = require('./routes/auth.route');
// const indexRouter = require('./routes/index');
const postRouter = require('./routes/post.route');

dotenv.config();

const app = express();

const corsOptions = {
  origin: '*',
};

app.use(cors(corsOptions));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(passport.initialize());

// TODO: Include proper status codes in all response..

app.get('/api/v1', (req, res) => {
  // res.redirect('/api/v1');
  res.json({ status: 'success', message: 'Welcome To EduCrib API' });
});

// TODO: change the user activity endpoint below to /api/v1/auth
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/posts', postRouter);

// set up a wildcard route
app.get('*', (req, res) => {
  res.redirect('/api/v1');
});

app.use(express.static(path.join(__dirname, 'public')));

// eslint-disable-next-line no-unused-vars
const localUrl = config.mongoUrl;
const liveUrl = process.env.DB_CONNECTION;
// replace liveUrl with localUrl to use local mongodb
const connect = mongoose.connect(localUrl, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useFindAndModify: false,
  useCreateIndex: true,
});

// establish connection
connect.then(
  // eslint-disable-next-line no-unused-vars
  (db) => {
    console.log('Database connected');
  },
  (err) => {
    console.log(err);
  },
);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
