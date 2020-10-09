const express = require("express");
const bodyParser = require("body-parser");
const authenticate = require("../authenticate");
const Posts = require("../models/model.post");

// MUTLER
const multer = require("multer");

// configure multer

var storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "public/images"); // image destination
  },
  filename: (req, file, callback) => {
    callback(null, file.originalname + "-" + Date.now()); // originalname = same name as the client stored the name
  },
});

//filter the kind of image you want

const imageFileFilter = (req, file, callback) => {
  // check file extention;
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return callback(new Error("You can upload only image files"), false);
  }
  callback(null, true);
};

// use configuration in application

const upload = multer({ storage: storage, fileFilter: imageFileFilter });

const postRouter = express.Router();

postRouter.use(bodyParser.json());

postRouter
  .route("/")
  .get((req, res, next) => {
    Posts.find({})
      .populate("author")
      .populate("comments.author")
      .then(
        (posts) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(posts);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  }) // when using upload.array, response is saved in req.files with an (s) for multiple upload = req.file without the (s)
  // TODO: Allow user upload multiple images with a post
  .post(authenticate.varifyUser, (req, res, next) => {
    req.body.author = req.user;
    Posts.create(req.body)
      .then(
        (post) => {
          // let obj = req.files;
          // let result = Object.keys().forEach((key) => {
          //     console.log(obj[key]);
          // })
          // TODO: extract the filenames into an array
          // console.log(result);
          // console.log((req.files).find(obj => obj.filename == 'filename'));
          // if (req.files) post.images = req.file.filename;
          // req.body.author = req.user._id;
          // console.log(req.user);
          // req.user will contain the user document from the authorization token
          // post.author = req.user._id;
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(post);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .put(authenticate.varifyUser, authenticate.varifyAdmin, (req, res, next) => {
    res.statusCode = 403; // operation not supported
    res.end("PUT operation not supported on /posts");
  })
  .delete(
    authenticate.varifyUser,
    authenticate.varifyAdmin,
    (req, res, next) => {
      Posts.deleteMany({})
        .then(
          (response) => {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(response);
          },
          (err) => next(err)
        )
        .catch((err) => next(err));
    }
  );

postRouter
  .route("/:postId")
  .get((req, res, next) => {
    Posts.findById(req.params.postId)
      .populate("author")
      .populate("comments.author")
      .then(
        (dish) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(dish);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .post(authenticate.varifyUser, (req, res, next) => {
    res.statusCode = 403; // operation not supported
    res.end(`POST operation not supported on /posts/${req.params.postId}`);
  })
  .put(authenticate.varifyUser, (req, res, next) => {
    Posts.findById(req.params.postId)
      .then(
        (post) => {
          if (req.user._id.equals(post.author._id)) {
            Posts.findByIdAndUpdate(
              req.params.postId,
              { $set: req.body },
              { new: true }
            )
              .then(
                (post) => {
                  res.statusCode = 200;
                  res.setHeader("Content-Type", "application/json");
                  res.json(post);
                },
                (err) => next(err)
              )
              .catch((err) => next(err));
          } else {
            var err = new Error(
              "You are not authorized to perform this operation"
            );
            err.statusCode = 403; // operation not supported
            return next(err);
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .delete(authenticate.varifyUser, (req, res, next) => {
    Posts.findById(req.params.postId)
      .then(
        (post) => {
          if (req.user._id.equals(post.author._id)) {
            Posts.findByIdAndRemove(req.params.postId)
              .then(
                (response) => {
                  res.statusCode = 200;
                  res.setHeader("Content-Type", "application/json");
                  res.json(response);
                },
                (err) => next(err)
              )
              .catch((err) => next(err));
          } else {
            var err = new Error(
              "You are not authorized to perform this operation"
            );
            err.statusCode = 403; // operation not supported
            return next(err);
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  });

postRouter
  .route("/:postId/comments")
  .get((req, res, next) => {
    Posts.findById(req.params.postId)
      .populate("comments.author")
      .then(
        (post) => {
          if (post != null) {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(post.comments);
          } else {
            // create new error
            err = new Error(`Post ${req.params.postId} not found`);
            err.status = 404;
            return next(err);
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .post(authenticate.varifyUser, (req, res, next) => {
    Posts.findById(req.params.postId)
      .then(
        (post) => {
          if (post != null) {
            req.body.author = req.user._id; // add author id to req body
            post.comments.push(req.body);
            post.save().then(
              (post) => {
                Posts.findById(post._id)
                  // .populate('comments.author')
                  .then((post) => {
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(post);
                  });
              },
              (err) => next(err)
            );
          } else {
            err = new Error(`Post ${req.params.postId} not found`);
            err.status = 404;
            return next(err);
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .put(authenticate.varifyUser, (req, res, next) => {
    res.statusCode = 403; // operation not supported
    res.end(
      `PUT operation not supported on /post/${req.params.postId}/comments`
    );
  })
  .delete(
    authenticate.varifyUser,
    authenticate.varifyAdmin,
    (req, res, next) => {
      Posts.findById(req.params.postId)
        .then(
          (post) => {
            if (post != null) {
              // delete all comments and save the document
              // looping through the array fron end to start and deleting
              for (var i = post.comments.length - 1; i >= 0; i--) {
                post.comments.id(post.comments[i]._id).remove();
              }
              post.save().then(
                (post) => {
                  res.statusCode = 200;
                  res.setHeader("Content-Type", "application/json");
                  res.json(post);
                },
                (err) => next(err)
              );
            } else {
              // create new error
              err = new Error(`Post ${req.params.postId} not found`);
              err.status = 404;
              return next(err);
            }
          },
          (err) => next(err)
        )
        .catch((err) => next(err));
    }
  );

postRouter
  .route("/:postId/comments/:commentId")
  .get((req, res, next) => {
    Posts.findById(req.params.postId)
      .populate("comments.author")
      .then(
        (post) => {
          if (post != null && post.comments.id(req.params.commentId) != null) {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            // return the particular comment
            res.json(post.comments.id(req.params.commentId));
          } else if (post == null) {
            // create new error
            err = new Error(`Dish ${req.params.postId} not found`);
            err.status = 404;
            return next(err);
          } else {
            err = new Error(`Comment ${req.params.commentId} not found`);
            err.status = 404;
            return next(err);
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .post(authenticate.varifyUser, (req, res, next) => {
    res.statusCode = 403; // operation not supported
    res.end(
      `POST operation not supported on /posts/${req.params.postId}/comments/${req.params.commentId}`
    );
  })
  .put(authenticate.varifyUser, (req, res, next) => {
    Posts.findById(req.params.postId)
      .then(
        (post) => {
          if (
            req.user._id.equals(
              post.comments.id(req.params.commentId).author._id
            )
          ) {
            if (
              post != null &&
              post.comments.id(req.params.commentId) != null
            ) {
              // only allow updates for the rating and comment
              if (req.body.rating) {
                post.comments.id(req.params.commentId).rating = req.body.rating;
              }
              if (req.body.comment) {
                post.comments.id(req.params.commentId).comment =
                  req.body.comment;
              }
              post.save().then(
                (post) => {
                  Posts.findById(post._id)
                    .populate("comments.author")
                    .then((dish) => {
                      res.statusCode = 200;
                      res.setHeader("Content-Type", "application/json");
                      res.json(dish);
                    });
                },
                (err) => next(err)
              );
            } else if (post == null) {
              // create new error
              let err = new Error(`Post ${req.params.postId} not found`);
              err.status = 404;
              return next(err);
            } else {
              let err = new Error(`Comment ${req.params.commentId} not found`);
              err.status = 404;
              return next(err);
            }
          } else {
            var err = new Error(
              "You are not authorized to perform this operation"
            );
            err.statusCode = 403; // operation not supported
            return next(err);
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .delete(authenticate.varifyUser, (req, res, next) => {
    Posts.findById(req.params.postId)
      .then(
        (post) => {
          // only post author and comment author can delete a comment
          if (
            req.user._id.equals(
              post.comments.id(req.params.commentId).author._id
            ) ||
            req.user._id.equals(post.author._id)
          ) {
            if (
              post != null &&
              post.comments.id(req.params.commentId) != null
            ) {
              post.comments.id(req.params.commentId).remove();
              post
                .save()
                .then(
                  (post) => {
                    Posts.findById(post._id)
                      .populate("comments.author")
                      .then((post) => {
                        res.statusCode = 200;
                        res.setHeader("Content-Type", "application/json");
                        res.json(post);
                      });
                  },
                  (err) => next(err)
                )
                .catch((err) => next(err));
            } else if (post == null) {
              // create new error
              let err = new Error(`Post ${req.params.postId} not found`);
              err.status = 404;
              return next(err);
            } else {
              let err = new Error(`Comment ${req.params.commentId} not found`);
              err.status = 404;
              return next(err);
            }
          } else {
            var err = new Error(
              "You are not authorized to perform this operation"
            );
            err.statusCode = 403; // operation not supported
            return next(err);
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  });

module.exports = postRouter;
