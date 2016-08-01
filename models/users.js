// var mongoose = require('mongoose');
// // var findOrCreate = require('mongoose-findorcreate'); //fix & install

// var userSchema = mongoose.Schema({
//   // We require one of (but not both of) username/password or facebookId
//   // Unclear how to check this with a Mongoose validator so we don't =\
//   username: String,
//   email: String,
//   password: String,
//   facebookId: String,
//   registrationCode: String,
//   sessionId: String,
//   isAdmin: {
//     type: Boolean,
//     default: true
//   }
// });
// // userSchema.plugin(findOrCreate);

// module.exports = mongoose.model('User', userSchema);