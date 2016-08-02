var mongoose = require('mongoose');
var findOrCreate = require('mongoose-findorcreate');

var user = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
<<<<<<< HEAD
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

=======
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
  }
});

user.plugin(findOrCreate)
>>>>>>> 4adca418076d47bb77a42cb56966a8b3c66ea8e2

module.exports = {
  User: mongoose.model('User', user)
}
