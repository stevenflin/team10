var router = require('express').Router();
var models = require('../models/models');
var Vineapple = require('vineapple');
var vine = new Vineapple();
var facebook = require('fb');

var bcrypt = require('bcrypt');
const saltRounds = 10;

var encryptor = require('simple-encryptor')(process.env.SECRET);

var twilio = require('../test/trigger.js');
var trigger = twilio.sendMessage;

var update = require('../update/update');
var updateDaily = update.updateDaily;
var updateFrequent = update.updateFrequent;
var clear1 = update.clearProfileSnaps;
var clear2 = update.clearPostSnaps;

var facebook = require('../update/facebook');
var facebookUpdate = facebook.facebookUpdate;

var vine = require('../update/vine');
var vineUpdate = vine.vineUpdate;

var instagram = require('../update/ig');
var instagramUpdate = instagram.instagramUpdate;

var twitter = require('../update/twitter');
var twitterUpdate = twitter.twitterUpdate;

var youtubeFunctions = require('../update/youtube');
var youtubeUpdate = youtubeFunctions.youtubeUpdate;

var models = require('../models/models');
var User = models.User;
var Profile = models.Profile;
var ProfileSnapshot = models.ProfileSnapshot;
var Post = models.Post;
var PostSnapshot = models.PostSnapshot;

/* GET home page. */

module.exports = function(passport) {

  router.get('/lock', function(req, res, next) {
    res.render('lock')
  });

  router.post('/lock', function(req, res, next) {
    if (req.body.key === process.env.KEY) {
      req.session.unlocked = true;
      req.session.unlockDate = new Date();
      res.redirect('/login');
    } else {
      res.redirect('/lock');
    }
  });

  //1ST WALL
  router.use(function(req, res, next) {
    // console.log("first wall");
    var threshold = 30 * 60 * 1000;
    var diff = new Date - new Date(req.session.unlockDate);
    if (!req.session.unlocked || diff > threshold ) {
      req.session.unlocked = false;
      return res.redirect('/lock');
    } else {
      return next();
    }
  });

  router.get('/register', function(req, res, next) {
      res.render('register');
  });

  router.post('/register', function(req, res, next) {

    var salt = bcrypt.genSaltSync(saltRounds);
    var hash = bcrypt.hashSync(req.body.password, salt);

    if (!req.body.username || !req.body.password || !req.body.phoneNumber || !req.body.passwordagain) {
      return res.render('register', {
        message: 'Missing fields required.'
      });
    }

    if (req.body.password !== req.body.passwordagain) {
      return res.render('register', {
        message: 'Passwords do not match.'
      });
    }

    new User({
      username: req.body.username,
      password: hash, 
      phoneNumber: req.body.phoneNumber
    }).save(function(err, user) {
      if (err) {
        return res.render('register', {
          message: 'Username is taken.'
        });
      } else {
        new Profile({
          userId: user._id
        }).save(function(err, profile) {
          if (err) return next(err);
          res.redirect('/login');
        })
      }
    });
  });

  router.get('/login', function(req, res, next) {
    res.render('login');
  });

  router.post('/login', 
    passport.authenticate('local', { failureRedirect: '/login' }),
    function(req, res, next) {

      Profile.findOne({userId: req.user._id}, function(err, profile) {
        if (err) return next(err);
        if(profile.youtube.displayName
        && profile.instagram.displayName
        && profile.vine.displayName
        && profile.facebook.displayName
        && profile.twitter.displayName) {
          res.redirect('/dashboard');
        } else {
          res.redirect('/integrate');
        }
      })
  });

  // 2ND WALL
  router.use(function(req, res, next) {
    if (!req.user) {
      return res.redirect('/login');
    } else {
      req.session.unlockDate = new Date();
      return next();
    }
  });

  // FACEBOOK
  router.get('/auth/facebook', passport.authenticate('facebook', {scope: 'email manage_pages read_insights', return_scopes: true})); //'manage_pages'
  router.get('/auth/facebook/cb', passport.authenticate('facebook', {
   failureRedirect:'/login',
   successRedirect: '/fbPageSelector'
 }));
  
  router.get('/auth/deleteFb', (req, res, next)=>{
    // facebook.api("/"+req.user.facebook.id+"/permissions", "delete");
    User.findById(req.user.id, function(err, user){
      user.facebook = null;
      user.save(function(err, success){
        if(err){
          console.log("Error saving user", err)
        }
        Profile.findOne({userId: user._id}, function(err, profile) {
          profile.facebook = null;
          profile.save(function(err, success){
            if(err){
              console.log("Error saving profile,", err)
            }
            else {
              ProfileSnapshot.remove({profileId: profile._id}, function(err, success) {
                if(err){
                  console.log("Error removing snapshot", err)
                }
                else{
                  // console.log("Success 3", success)
                  res.redirect('/integrate')
                }
              });
            }
          });
        });
      });
    });
  });


  // INSTAGRAM 
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
      res.redirect('/integrate');

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

  //VINE

  router.post('/auth/vine', function(req, res, next) {
    req.user.vine = {
      authToken: req.body.token,
      userId: req.body.id
    }
    req.user.save();
  })

  router.post('/integrate', function(req, res, next){
    req.session.unlockDate = new Date();

    var encrypted = encryptor.encrypt(req.body.password);

    req.user.vine = {
      username: req.body.username,
      password: encrypted,
    }
    req.user.save(function(err, user) {
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