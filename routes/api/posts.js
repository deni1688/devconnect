const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

// load User model
const Post = require("../../models/Post");
// load User model
const Profile = require("../../models/Profile");

// load validation for post inputs
const validatePostInput = require("../../validation/post");

/*
 * @route   GET api/posts
 * @desc    Get Posts
 * @access  Public
 */
router.get("/", (req, res) => {
  const errors = {};
  Post.find({})
    .sort({ date: -1 })
    .then(posts => {
      if(!posts){
        errors.noPosts = "No posts found";  
        return res.status(404).json(errors);
      }
      res.json(posts);
    })
    .catch(err => res.status(404).json({noPosts: "No posts found"}));
});

/*
 * @route   GET api/posts/:id
 * @desc    Get Post by id
 * @access  Public
 */
router.get("/:id", (req, res) => {
  const errors = {};
  Post.findById(req.params.id)
    .then(post => {
      if(!post){
        errors.noPost = "That post does not exist";  
        return res.status(404).json(errors);
      }
      res.json(post);
    })
    .catch(err => res.status(404).json({noPost: "That post does not exist"}));
});

/*
 * @route   POST api/posts
 * @desc    Create Post
 * @access  Private
 */
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);

    // return errors if validation errors
    if (!isValid) {
      return res.status(400).json(errors);
    }

    const newPost = new Post({
      text: req.body.text,
      name: req.body.name,
      avatar: req.body.avatar,
      user: req.user.id
    });

    newPost.save().then(post => res.json(post));
  }
);

/*
 * @route   DELETE api/posts/:id
 * @desc    Get Post by id
 * @access  Private
 */
router.delete("/:id", passport.authenticate("jwt", {session: false }), (req, res) => {
  const errors = {};
  Profile.findOne({ user: req.user.id })
    .then( profile => {
      Post.findById(req.params.id)
        .then(post => {
            // verify post owner
            if(post.user.toString() !== req.user.id){
              return res.status(401).json({notAuthorized: "User not authorized"})
            }

            post.remove()
              .then(() => res.json({success: true}))
        })
        .catch(err => res.status(404).json({noPost: "Post not found" }))
    })
});

module.exports = router;
