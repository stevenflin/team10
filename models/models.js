var mongoose = require('mongoose');
var findOrCreate = require('mongoose-findorcreate');

var user = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  facebook: {
    id: String,
    token: String,
    name: String,
    manage_pages: String,
    email: String
  },
  instagram: {
    AccessToken: String,
    RefreshToken: String
  },
  twitter: {
    twitterToken: String,    
    twitterTokenSecret: String
  },
  youtube: {
    // title: String,
    // subscriberCount: String,
    // videoCount: String,
    // videos: [{
    //   title: String,
    //   desc: String,
    //   likes: String,
    //   dislikes: String,
    //   commentCount: String,
    //   favoriteCount: String
    // }]
    profile: Object,
    accessToken: String,
    refreshToken: String
  }
});

user.plugin(findOrCreate)

module.exports = {
  User: mongoose.model('User', user)
}
