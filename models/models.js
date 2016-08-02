var mongoose = require('mongoose');
var findOrCreate = require('mongoose-findorcreate');

var user = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String
  }, 
  facebookId: {
    type: String
  }, 
  instagramId: {
    type: String
  },
  instagramAccessToken: {
    type: String
  }, 
  instagramRefreshToken: {
    type: String
  }, 
  twitterToken: {
    type: String
  }, 
  twitterTokenSecret: {
    type: String
  }
});

user.plugin(findOrCreate)

module.exports = {
  User: mongoose.model('User', user)
}
