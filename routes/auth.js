var router = require('express').Router();
var models = require('../models/models');
var Vineapple = require('vineapple');
var User = models.User;
var Profile = models.Profile;
var vine = new Vineapple();
var facebook = require('fb');

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
      new Profile({
        userId: user._id
      }).save(function(err, profile) {
        if (err) return next(err);
        res.redirect('/login');
      })

  	});
  });

  router.get('/login', function(req, res, next) {
    res.render('login');
  });

  router.post('/login', 
    passport.authenticate('local', { failureRedirect: '/login' }),
    function(req, res) {
      res.redirect('/integrate');
  });

  // FACEBOOK
  router.get('/auth/facebook', passport.authenticate('facebook', {scope: 'email manage_pages read_insights', return_scopes: true})); //'manage_pages'
  router.get('/auth/facebook/cb',
    passport.authenticate('facebook', {failureRedirect:'/login'}),
      function(req, res){
        console.log('Yoyo')
        res.redirect('/fbPageSelector')
    })

//INSTAGRAM 
  router.get('/auth/instagram',
  passport.authorize('instagram', { scope: 'public_content follower_list basic'}));

  router.get('/auth/instagram/callback', 
    passport.authenticate('instagram', { failureRedirect: '/login' }),
    function(req, res) {
      // Successful authentication, redirect home.
      res.redirect('/integrate');
  });

  // YOUTUBE
  router.get('/auth/youtube', 
    passport.authorize('youtube'));

  router.get('/auth/youtube/callback',
    passport.authenticate('youtube', {failureRedirect: '/login'}),
    function(req, res) {
      res.redirect('/youtube');

    }
  );
  
  //TWITTER
  router.get('/auth/twitter',
    passport.authorize('twitter'));

  router.get('/auth/twitter/callback', 
  passport.authenticate('twitter', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/integrate');
  });


  router.use(function(req, res, next) {
    if (!req.user) {
      return res.redirect('/login');
    } else {
      return next();
    }
  });

  //VINE

  router.get('/integrate', function(req, res, next){
    res.render('integrate')
  });

  router.post('/integrate', function(req, res, next){

    req.user.vine = {
      username: req.body.username,
      password: req.body.password,
    }
    req.user.save(function(err, user) {
      console.log(err);
      console.log("vine user", user)
      if (err) return next(err);
      Profile.findOne({userId: user._id}, function(err, p){
        p.vine.displayName = user.vine.username;
        p.save(function(err){
          if(err) return next(err);
        })
      })  
        res.redirect('/integrate');
    });
});


  router.get('/logout', function(req, res, next){
    req.logout();
    res.redirect('/login');
  }); 

  return router;
}