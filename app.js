var express = require('express');
var passport = require('passport');
var util = require('util');


var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var session = require('express-session');
var bodyParser = require('body-parser');
var MongoStore = require('connect-mongo')(session);


var app = express();

//** for passport auth **
var passport = require('passport'); //not installed
var LocalStrategy = require('passport-local').Strategy;//not installed

var FacebookStrategy = require('passport-facebook'); //not installed
var YoutubeStrategy = require('passport-youtube-v3').Strategy;
var InstagramStrategy = require('passport-instagram').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;

//** end passport auth **

//Checks if all the process.env tokensar e there
var REQUIRED_ENV = "MONGODB_URI SECRET FB_CLIENT_ID FB_CLIENT_SECRET".split(" ");
REQUIRED_ENV.forEach(function(el) {
  if (!process.env[el])
    throw new Error("Missing required env var " + el);
});

var mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI);
var mongoStore = new MongoStore({mongooseConnection: mongoose.connection});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: process.env.SECRET,
  store: mongoStore
}));


var models = require('./models/models');
var User = models.User;


app.use(passport.initialize());
app.use(passport.session());

// YOUR CODE HERE
passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

// Tell passport how to read our user models
passport.use(new LocalStrategy(function(username, password, done) {
  // Find the user with the given username
    User.findOne({ username: username }, function (err, user) {
      // if there's an error, finish trying to authenticate (auth failed)
      if (err) {
        return done(err);
      }
      // if no user present, auth failed
      if (!user) {
        return done(null, false);
      }
      // if passwords do not match, auth failed
      if (user.password !== password) {
        return done(null, false);
      }
      // auth has has succeeded
      console.log('LOGGED IN');
      return done(null, user);
    });
  }
));

passport.use(new FacebookStrategy({
    clientID: process.env.FB_CLIENT_ID,
    clientSecret: process.env.FB_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/facebook/cb", //fix when callback URL is updated
    passReqToCallback: true
  },
  // facebook will send back the token and profile
  function(req, token, refreshToken, profile, done) {
    // check if the user is already logged in

    // asynchronous
    process.nextTick(function() {

      if (!req.user) {
        throw new Error("Gotta be logged in maaaaaaan");
      } else {
        console.log("Updating user with facebook creds: ")
        // user already exists and is logged in, we have to link accounts
        var user = req.user; // pull the user out of the session
        // update the current users facebook credentials
        user.facebook.id = profile.id;
        user.facebook.token = token;
        user.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName;
        // user.facebook.email = profile.emails[0].value;
        // save the user
        user.save(function(err) {
          if (err)
            throw err;
          return done(null, user);
        });
      }
    });
  }
));

passport.use(new YoutubeStrategy({
    clientID: process.env.YOUTUBE_CLIENT_ID,
    clientSecret: process.env.YOUTUBE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/youtube/callback",
    scope: 'https://www.googleapis.com/auth/youtube',
    passReqToCallback: true
  },
  function(req, accessToken, refreshToken, profile, done) {
    if (!req.user) {
      throw new Error("lmao gotta log in bro")
    }
    console.log("[YT profile]", profile)

    var user = req.user;
    console.log('[INITIAL USER STATE]', user)
    user.youtube.accessToken = accessToken;
    user.youtube.refreshToken = refreshToken;
    user.youtube.profile = profile;

    console.log('[MEDIUM USER STATE]', user);

    user.save(function(err, user) {
      if (err) {
        console.log("err", err)
      }
      console.log('[REQ.USER STATE]', req.user);
      console.log('[NEW USER STATE]', user);
      return done(null, user);
    })
  }
));


passport.use(new InstagramStrategy({
    clientID: process.env.INSTAGRAM_CLIENT_ID,
    clientSecret: process.env.INSTAGRAM_CLIENT_SECRET,
    callbackURL: process.env.INSTAGRAM_CALLBACK_URL,
    passReqToCallback: true
  },
  function(req, accessToken, refreshToken, profile, done) {
    // console.log("token", accessToken);
    // console.log("refreshToken", refreshToken);
    console.log("profile", profile);
    // console.log("fuck", profile._json.data.counts);
    if(!req.user){
      throw new Error ("Error please login")
    } else{
      req.user.instagram.AccessToken = accessToken;
      req.user.instagram.RefreshToken = refreshToken;
      req.user.instagram.instagramProfile = profile;
    }
    req.user.save(function () {
      return done(null, req.user);
    });
  }
));

passport.use(new TwitterStrategy({
    consumerKey: process.env.TWITTER_CONSUMER_KEY,
    consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
    callbackURL: "http://localhost:3000/auth/twitter/callback", 
     passReqToCallback: true
  },
  function(req, token, tokenSecret, profile, cb) {
    // console.log("profile", profile);
    // console.log("followers", profile._json.followers_count);
    // console.log("retweet count", profile._json.status.retweet_count);
    // console.log("retweeted status", profile._json.favourites_count);
    if(!req.user){
      throw new Error("twitter failed to login")
    } else {
      req.user.twitter.twitterToken = token;
      req.user.twitter.twitterTokenSecret = tokenSecret;
      req.user.twitter.twitterProfile = profile;
      req.user.save(function (err, user) {
        return cb(err, req.user);
      });
    }
  }
));


var auth = require('./routes/auth');
var routes = require('./routes/index');

app.use('/', auth(passport));
app.use('/', routes);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
}); 

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
