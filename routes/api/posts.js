const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

// load User model
const Post = require("../../models/Post");

// load validation for post inputs
const validatePostInput = require("../../validation/post");

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

    newPost.save()
      .then(post => res.json(post));
    
  }
);

module.exports = router;
