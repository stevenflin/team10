
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

  //ROUTER WALL
  router.use(function(req, res, next) {
   if (!req.user) {
     res.redirect('/login');
   } else {
      next()
   }
  })

  // FACEBOOK
  router.get('/auth/facebook', passport.authorize('facebook'));

  router.get('/auth/facebook/cb',
    passport.authenticate('facebook', {
      successRedirect: '/integrate', 
      failureRedirect: '/' 
    })
  );

  return router;
}

