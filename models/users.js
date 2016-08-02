// var mongoose = require('mongoose');
// var findOrCreate = require('mongoose-findorcreate'); //fix & install


var userSchema = mongoose.Schema({
  // We require one of (but not both of) username/password or facebookId
  // Unclear how to check this with a Mongoose validator so we don't =\
  username: String,
  email: String,
  password: String,
  facebook: {
    id: String,
    token: String,
    email: String,
    name: String
  },
  twitter: {
    id: String,
    token: String,
    email: String,
    name: String
  },
  youtube: {
    id: String,
    token: String,
    email: String,
    name: String
  },
  sessionId: String,
});
userSchema.plugin(findOrCreate);


// module.exports = mongoose.model('User', userSchema);