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
    email: String,
    name: String
  }
});

user.plugin(findOrCreate);


module.exports = {
  User: mongoose.model('User', user)
}
