
var router = require('express').Router();
var models = require('../models/models');
var User = models.User;

/* GET home page. */

module.exports = function(passport) {
  
  router.get('/register', function(req, res, next) {
  	res.render('register');
  });

  router.post('/register', function(req, res, next) {
  	new User({
  	  username: req.body.username,
  	  password: req.body.password
  	}).save(function(err, user) {
  	  console.log(err);
  	  if (err) return next(err);
  	  res.redirect('/login');
  	});
  });

  router.get('/login', function(req, res, next) {
    res.render('login');
  });

  router.post('/login', 
    passport.authenticate('local', { failureRedirect: '/login' }),
    function(req, res) {
      res.redirect('/');
  });

  // FACEBOOK
  router.get('/auth/facebook', passport.authorize('facebook'));

  router.get('/auth/facebook/cb',
    passport.authenticate('facebook', {
      successRedirect: '/integrate', 
      failureRedirect: '/' 
    })
  );


//INSTAGRAM 
  router.get('/auth/instagram',
  passport.authenticate('instagram'));

  router.get('/auth/instagram/callback', 
    passport.authenticate('instagram', { failureRedirect: '/login' }),
    function(req, res) {
      // Successful authentication, redirect home.
      res.redirect('/');
  });

  // YOUTUBE
  router.get('/auth/youtube', 
    passport.authorize('youtube'));

  router.get('/auth/youtube/callback',
    passport.authenticate('youtube', {failureRedirect: '/login'}),
    function(req, res) {
      res.redirect('/');
    }
  );

  //TWITTER
  router.get('/auth/twitter',
    passport.authorize('twitter'));

  router.get('/auth/twitter/callback', 
  passport.authenticate('twitter', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  });

  router.use(function(req, res, next) {
    if (!req.user) {
      res.redirect('/login');
    } else {
      next();
    }
  });

  router.get('/logout', function(req, res, next){
    req.logout();
    res.redirect('/login');
  }); 

  return router;
}

