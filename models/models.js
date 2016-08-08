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
    instagramProfile: Object
  },
  twitter: {
    twitterToken: String,    
    twitterTokenSecret: String, 
    twitterProfile: Object
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
    refreshToken: String,
    profile: Object
  },
  vine: {
    username: String,
    password: String, 
    profile: Object
  }
});

var profile = new mongoose.Schema({
  all 1 time info for a profile 
  reference User
  array of posts
})

var snapshotProfile = new mongoose.Schema({
  platformID: {
    type: String
  },
  platform: {
    facebook twitter, etc

  },
  displayName: {
    type: String
  }, 
  followers: {
    type: Number
  },
  date: {
    type: Date
  }, 
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
  profileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile',
    required: true
  }
})

var post = new mongoose.Schema({
  one time post info ie description or media assets, links, refer to profile 
})

var postSnapshot = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
   profileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile',
    required: true
  },
  comments:{
    type: Number
  }, 
  likes:{
    type: Number 
  },
  post_type: {
    videos: {
      type: String
    }, 
    post: {
      type: String
    }
  }, 
  favorites: {
    type: String
  }, 
  views: {
    type: Number
  }, 
  dislikes: {
    type: Number
  }, 
  snapshot_date: {
    type: Date
  } 
})


user.plugin(findOrCreate)

module.exports = {
  User: mongoose.model('User', user), 
  snapshotUser: mongoose.model('snapshotUser', snapshotUser),
  postSnapShot: mongoose.model('postSnapShot', postSnapShot)
}


