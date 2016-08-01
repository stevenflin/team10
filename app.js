var express = require('express');
var passport = require('passport');
var util = require('util');


var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var session = require('express-session');
var bodyParser = require('body-parser');
var MongoStore = require('connect-mongo')(session);

var routes = require('./routes/index');


var app = express();

//** for passport auth **
var passport = require('passport'); //not installed
var LocalStrategy = require('passport-local').Strategy;//not installed
var FacebookStrategy = require('passport-facebook'); //not installed
var YoutubeStrategy = require('passport-youtube');
var InstagramStrategy = require('passport-instagram').Strategy;
//** end passport auth **

//Checks if all the process.env tokensar e there
var REQUIRED_ENV = "MONGODB_URI SECRET FB_CLIENT_ID FB_CLIENT_SECRET INSTAGRAM_CLIENT_ID INSTAGRAM_CLIENT_SECRET".split(" ");
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
    callbackURL: process.env.CALLBACK_URL //fix when callback URL is updated
  },
  function(accessToken, refreshToken, profile, callback) {
    User.findOrCreate({ facebookId: profile.id }, function (err, user) {
      return callback(err, user);
    });
  }
));

// passport.use(new YoutubeStrategy({
//     clientID: YOUTUBE_APP_ID,
//     clientSecret: YOUTUBE_APP_SECRET,
//     callbackURL: "http://localhost:3000/auth/youtube/callback"
//   },
//   function(accessToken, refreshToken, profile, done) {
//     User.findOrCreate({ userId: profile.id }, function (err, user) {
//       return done(err, user);
//     });
//   }
// ));



passport.use(new InstagramStrategy({
    clientID: process.env.INSTAGRAM_CLIENT_ID,
    clientSecret: process.env.INSTAGRAM_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/instagram/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    process.nextTick(function () {
      return done(null, profile);
    });
  }
));


app.use(passport.initialize());
app.use(passport.session());

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
