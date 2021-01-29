const Posts = require('../models/post.model');

const postHandler = {
  getAllPost: async (req, res, next) => {
    try {
      const post = await Posts.find({})
        .populate('author')
        .populate('comments.author');
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(post);
    } catch (error) {
      next(error);
    }
  },
  createPost: async (req, res, next) => {
    req.body.author = req.user;
    try {
      const post = await Posts.create(req.body);
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(post);
    } catch (error) {
      next(error);
    }
  },
  deleteAllPosts: async (req, res, next) => {
    try {
      const response = await Posts.deleteMany({});
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(response);
    } catch (error) {
      next(error);
    }
  },
  getOnePost: async (req, res, next) => {
    try {
      const post = await Posts.findById(req.params.postId)
        .populate('author')
        .populate('comments.author');
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(post);
    } catch (error) {
      next(error);
    }
  },
  updatePost: async (req, res, next) => {
    try {
      const post = await Posts.findById(req.params.postId);
      if (req.user._id.equals(post.author._id)) {
        try {
          const returnedPost = await Posts.findByIdAndUpdate(
            req.params.postId,
            { $set: req.body },
            { new: true },
          );
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(returnedPost);
        } catch (error) {
          next(error);
        }
      } else {
        const err = new Error(
          'You are not authorized to perform this operation',
        );
        err.statusCode = 403; // operation not supported
        return next(err);
      }
    } catch (error) {
      next(error);
    }
  },
  deleteOnePost: async (req, res, next) => {
    try {
      const post = await Posts.findById(req.params.postId);
      if (req.user._id.equals(post.author._id)) {
        try {
          const returnedPost = await Posts.findByIdAndRemove(
            req.params.postId,
            { $set: req.body },
            { new: true },
          );
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(returnedPost);
        } catch (error) {
          next(error);
        }
      } else {
        const err = new Error(
          'You are not authorized to perform this operation',
        );
        err.statusCode = 403; // operation not supported
        return next(err);
      }
    } catch (error) {
      next(error);
    }
  },
  getAllComments: async (req, res, next) => {
    try {
      const post = await Posts.findById(req.params.postId)
        .populate('comments.author');
      if (post != null) {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(post.comments);
      } else {
        // create new error
        const err = new Error(`Post ${req.params.postId} not found`);
        err.status = 404;
        return next(err);
      }
    } catch (error) {
      next(error);
    }
  },
  createComment: async (req, res, next) => {
    try {
      const post = await Posts.findById(req.params.postId);
      if (post != null) {
        req.body.author = req.user._id; // add author id to req body
        post.comments.push(req.body);
        post.save();
        const post_ = await Posts.findById(post._id);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(post_);
        // TODO: return the first post value
      }
    } catch (error) {
      next(error);
    }
  },
  deleteAllComments: async (req, res, next) => {
    try {
      const post = await Posts.findById(req.params.postId);
      if (post != null) {
        // delete all comments and save the document
        // looping through the array from end to start and deleting
        // eslint-disable-next-line no-plusplus
        for (let i = post.comments.length - 1; i >= 0; i--) {
          post.comments.id(post.comments[i]._id).remove();
        }
        post.save();
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(post);
      } else {
        // create new error
        const err = new Error(`Post ${req.params.postId} not found`);
        err.status = 404;
        return next(err);
      }
    } catch (error) { next(error); }
  },
  getOneComment: async (req, res, next) => {
    try {
      const post = await Posts.findById(req.params.postId)
        .populate('comments.author');
      if (post != null && post.comments.id(req.params.commentId) != null) {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        // return the particular comment
        res.json(post.comments.id(req.params.commentId));
      } else if (post == null) {
        // create new error
        const err = new Error(`Post ${req.params.postId} not found`);
        err.status = 404;
        return next(err);
      } else {
        const err = new Error(`Comment ${req.params.commentId} not found`);
        err.status = 404;
        return next(err);
      }
    } catch (error) {
      next(error);
    }
  },
  updateComment: async (req, res, next) => {
    try {
      const post = await Posts.findById(req.params.postId);
      if (
        req.user._id.equals(
          post.comments.id(req.params.commentId).author._id,
        )
      ) {
        if (
          post != null
          && post.comments.id(req.params.commentId) != null
        ) {
          // only allow updates for the comment
          if (req.body.comment) {
            post.comments.id(req.params.commentId).comment = req.body.comment;
          }
          post.save();
          const post_ = await Posts.findById(post._id)
            .populate('comments.author');
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(post_);
        } else if (post == null) {
          // create new error
          const err = new Error(`Post ${req.params.postId} not found`);
          err.status = 404;
          return next(err);
        } else {
          const err = new Error(`Comment ${req.params.commentId} not found`);
          err.status = 404;
          return next(err);
        }
      } else {
        const err = new Error(
          'You are not authorized to perform this operation',
        );
        err.statusCode = 403; // operation not supported
        return next(err);
      }
    } catch (error) {
      next(error);
    }
  },
  deleteOneComment: async (req, res, next) => {
    try {
      const post = await Posts.findById(req.params.postId);
      // only post author and comment author can delete a comment
      if (
        req.user._id.equals(
          post.comments.id(req.params.commentId).author._id,
        )
        || req.user._id.equals(post.author._id)
      ) {
        if (
          post != null
          && post.comments.id(req.params.commentId) != null
        ) {
          post.comments.id(req.params.commentId).remove();
          post
            .save()
            .then(
              // eslint-disable-next-line no-shadow
              (post) => {
                Posts.findById(post._id)
                  .populate('comments.author')
                  // eslint-disable-next-line no-shadow
                  .then((post) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(post);
                  });
              },
              (err) => next(err),
            )
            .catch((err) => next(err));
        } else if (post == null) {
          // create new error
          const err = new Error(`Post ${req.params.postId} not found`);
          err.status = 404;
          return next(err);
        } else {
          const err = new Error(`Comment ${req.params.commentId} not found`);
          err.status = 404;
          return next(err);
        }
      } else {
        const err = new Error(
          'You are not authorized to perform this operation',
        );
        err.statusCode = 403; // operation not supported
        return next(err);
      }
    } catch (error) {
      next(error);
    }
  },
};

module.exports = postHandler;
