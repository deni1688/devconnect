const express = require("express");
const router = express.Router();
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");
const passport = require('passport');

// load User model
const User = require("../../models/User");

/*
 * @route   GET api/users/register
 * @desc    Register user
 * @access  Public
 */
router.post("/register", (req, res) => {
  // verify that user is not already registerd
  User.findOne({ email: req.body.email }).then(user => {
    if (user) {
      return res.status(400).json({ email: "Email already registered" });
    } else {
      // get the gravater associated with email
      const avatar = gravatar.url(req.body.email, {
        s: "200",
        r: "pg",
        d: "mm"
      });

      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        avatar,
        password: req.body.password
      });

      // hash password and add new user to db
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser
            .save()
            .then(user => res.json(user))
            .catch(err => console.log(err));
        });
      });
    }
  });
});

/*
 * @route   GET api/users/login
 * @desc    Login user and return jwt token
 * @access  Public
 */
router.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  // find user
  User.findOne({ email }).then(user => {
    if (!user) {
      return res.status(404).json({ email: "User not found" });
    }

    // user exists - validate password
    bcrypt.compare(password, user.password).then(isMatch => {
      if (isMatch) {
        // jwt payload
        const payload = {
          id: user.id,
          name: user.name,
          avatar: user.avatar
        };

        // sign new token
        jwt.sign(payload, keys.secretOrKey, { expiresIn: 3600 }, (err, token) => {
          res.json({
            success: true,
            token: `Bearer ${token}`
          });
        });
      } else {
        return res.status(400).json({ password: "Password incorrect" });
      }
    });
  });
});

/*
 * @route   GET api/users/current
 * @desc    return current user
 * @access  Private
 */
 router.get('/current', passport.authenticate('jwt', { session: false }), (req, res) => {
    res.json({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email
    });
 });

module.exports = router;
