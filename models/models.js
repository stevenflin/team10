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
    name: String
  },
  instagram: {
    id: String,
    AccessToken: String,
    RefreshToken: String,
    name: String
  },
  twitterToken: {
    twitterToken: String,    
    twitterTokenSecret: String
  }
});

user.plugin(findOrCreate)

module.exports = {
  User: mongoose.model('User', user)
}
