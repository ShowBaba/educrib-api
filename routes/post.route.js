const express = require('express');
const bodyParser = require('body-parser');
const authenticate = require('../authenticate');
const uploadUtil = require('../utils/multer.config');
const postController = require('../controllers/post.controller');
const Posts = require('../models/post.model');

const upload = uploadUtil;

const Router = express.Router();

Router.use(bodyParser.json());

Router
  .route('/')
  .get(postController.getAllPost)
  /** when using upload.array, response is saved in req.files with an (s) for multiple
  upload = req.file without the (s)
  TODO: Allow user upload multiple images within a post */
  .post(authenticate.varifyUser, postController.createPost)
  .put(authenticate.varifyUser, authenticate.varifyAdmin, (req, res) => {
    res.statusCode = 403; // operation not supported
    res.end('PUT operation not supported on /posts');
  })
  .delete(
    authenticate.varifyUser,
    authenticate.varifyAdmin,
    postController.deleteAllPosts
  );

Router
  .route('/:postId')
  .get(postController.getOnePost)
  .post(authenticate.varifyUser, (req, res) => {
    res.statusCode = 403; // operation not supported
    res.end(`POST operation not supported on /posts/${req.params.postId}`);
  })
  .put(authenticate.varifyUser, postController.updatePost)
  .delete(authenticate.varifyUser, postController.deleteOnePost);

Router
  .route('/:postId/comments')
  .get(postController.getAllComments)
  .post(authenticate.varifyUser, postController.createComment)
  .put(authenticate.varifyUser, (req, res) => {
    res.statusCode = 403;
    res.end(
      `PUT operation not supported on /post/${req.params.postId}/comments`,
    );
  })
  .delete(
    authenticate.varifyUser,
    authenticate.varifyAdmin,
    postController.deleteAllComments
  );

Router
  .route('/:postId/comments/:commentId')
  .get(postController.getOneComment)
  .post(authenticate.varifyUser, (req, res) => {
    res.statusCode = 403; // operation not supported
    res.end(
      `POST operation not supported on /posts/${req.params.postId}/comments/${req.params.commentId}`,
    );
  })
  .put(authenticate.varifyUser, postController.updateComment)
  .delete(authenticate.varifyUser, postController.deleteOneComment);

module.exports = Router;
