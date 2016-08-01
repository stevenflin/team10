var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

//** for passport auth **
var passport = require('passport'); //not installed
var LocalStrategy = require('passport-local');//not installed
var FacebookStrategy = require('passport-facebook'); //not installed
var mongoose = require('mongoose'); //not installed
var hbs = require('hbs'); //not installed

var constants = require('./constants');
var auth = require('./routes/auth');
var shop = require('./routes/shop');
var admin = require('./routes/admin');
var register = require('./routes/register');
var User = require('./models/user');
//** end passport auth **

//Checks if all the process.env tokensar e there
var REQUIRED_ENV = "MONGODB_URI SECRET FB_CLIENT_ID FB_CLIENT_SECRET".split(" ");
REQUIRED_ENV.forEach(function(el) {
  if (!process.env[el])
    throw new Error("Missing required env var " + el);
});

mongoose.connect(process.env.MONGODB_URI);
var mongoStore = new MongoStore({mongooseConnection: mongoose.connection});

app.use(session({
  secret: process.env.SECRET,
  store: mongoStore
}));


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done){
  done(null, user._id)
})
passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

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

app.use('/', auth(passport, mongoStore));
// error handlers

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
