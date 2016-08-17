var router = require('express').Router();
var models = require('../models/models');
var Vineapple = require('vineapple');
var vine = new Vineapple();
var facebook = require('fb');


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
  
  router.get('/register', function(req, res, next) {
      res.render('register');
  });

  router.post('/register', function(req, res, next) {
  	new User({
  	  username: req.body.username,
  	  password: req.body.password, 
      phoneNumber: req.body.phoneNumber
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

  // DAILY SNAPSHOTS

  router.get('/update/facebook', function(req, res, next) {  //should be /update/page
    User.find(function(err, users) {
      users.forEach((user) => {
        facebookUpdate(user)
        .then(() => res.redirect('/integrate'));
      });
    });
  });

  router.get('/update/instagram', function(req, res, next) {
    User.find(function(err, users) {
      users.forEach((user) => {
        instagramUpdate(user)
        .then(() => res.redirect('/integrate'));
      });
    });
  });

  router.get('/update/youtube', function(req, res, next) {
    User.find(function(err, users) {
      users.forEach((user) => {
        youtubeUpdate(user)
        .then(() => res.redirect('/integrate'));
      });
    });
  });

  router.get('/update/twitter', function(req, res, next) {
    User.find(function(err, users) {
      users.forEach((user) => {
        twitterUpdate(user)
        .then(() => res.redirect('/integrate'));
      });
    });
  });

  router.get('/update/vine', function(req, res, next) {
    User.find(function(err, users) {
      users.forEach((user) => {
        vineUpdate(user)
        .then(() => res.redirect('/integrate'));
      });
    });
  });

  router.get('/update', (req, res, next) => {
    clear1()
    .then(() => {
      console.log('clearing profile snaps................');
      clear2()
    })
    .then(() => {
      console.log('clearing post snaps....................');
      updateDaily()
    })
    .then(() => {
      console.log('updating all posts and snaps..............');
      res.sendStatus(200);
    });
  });

  // call this FUNction every 20 minutes, does not make snapshots

  router.get('/update/frequent', (req, res, next) => {
    updateFrequent()
    .then(() => res.sendStatus(200));
  });

  router.get('/update/trigger', (req, res, next) => {
    User.find(function(err, users) {
      if (err) return next(err);
      users.forEach((user)=> {
        var userTrigger = user.triggerFrequency;
        var msg = "You're behind on posting to the following channels: ";
        if(userTrigger.youtube.turnedOn) {
          userTrigger.youtube.upToDate ? console.log("Nothing was sent") : msg = msg + " Youtube ("+userTrigger.youtube.lastPost+" Day(s))";
        }
        if(userTrigger.instagram.turnedOn) {
          userTrigger.instagram.upToDate ? console.log("Nothing was sent") : msg = msg + " Instagram ("+userTrigger.instagram.lastPost+" Day(s))";
        }
        if(userTrigger.twitter.turnedOn) {
          userTrigger.twitter.upToDate ? console.log("Nothing was sent") : msg = msg + " Twitter ("+userTrigger.twitter.lastPost+" Day(s))";
        }
        if(userTrigger.facebook.turnedOn) {
          userTrigger.facebook.upToDate ? console.log("Nothing was sent") : msg = msg + " Facebook ("+userTrigger.facebook.lastPost+" Day(s))";
        }
        if(userTrigger.vine.turnedOn) {
          userTrigger.vine.upToDate ? console.log("Nothing was sent") : msg = msg + " Vine ("+userTrigger.vine.lastPost+" Day(s))";
        }
        trigger(msg, user);
        res.sendStatus(200);
      });
    });
  });

  // WALL
  router.use(function(req, res, next) {
    if (!req.user) {
      return res.redirect('/login');
    } else {
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
          else{
            console.log("Success", success)
          }
          Profile.findOne({userId: user._id}, function(err, profile) {
            profile.facebook = null;
            profile.save(function(err, success){
              if(err){
                console.log("Error saving profile,", err)
                }
              else{
                ProfileSnapshot.find({profileId: profile._id}).remove(function(err, success){
                  if(err){
                    console.log("Error removing snapshot", err)
                  }
                  else{
                    console.log("Success", success)
                    res.redirect('/integrate')

                  }
                });
              }
            })
          })
        })
      })
    }
  );


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