var express = require('express');
var router = express.Router();
var User = require('../models/user');

module.exports = function(passport, mongoStore) {

  function restoreSession(req, res, next) {
    // Check for a saved session ID
    if (req.user.sessionId) {
      console.log("User has saved session ID: " + req.user.sessionId);
      mongoStore.get(req.user.sessionId, function(err, session) {
        if (err) console.error(err);
        if (session && session.cart) {
          console.log("Restoring cart from session:");
          console.log(session);

          // Just restore the cart
          req.session.cart = session.cart;

          // Save session ID to user object
          // We do this regardless of whether or not we restored a session
          User.findByIdAndUpdate(req.user._id, {sessionId: req.session.id}, function(err) {
            next(err);
          });
        }
      });
    } else {
      // Save session ID to user object
      // We do this regardless of whether or not we restored a session
      User.findByIdAndUpdate(req.user._id, {sessionId: req.session.id}, function(err) {
        next(err);
      });
    }
  }
  // FACEBOOK

  router.get('/auth/facebook',
    passport.authenticate('facebook'));

  router.get('/auth/facebook/callback',
    passport.authenticate('facebook', { failureRedirect: '/login' }),
    function(req, res) {
      // Successful authentication, redirect home.
      res.redirect('/');
    });

  return router;
};