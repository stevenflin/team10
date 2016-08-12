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
  isAdmin:{
    type: Boolean,
    default: false
  },
  facebook: {
    id: String,
    token: String,
    name: String,
    manage_pages: String,
    pages: [{
      pageId: String,
      pageName: String
    }]
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
  // all 1 time info for a profile 
  // reference User
  // array of posts
  youtube: {
    displayName: String,
    followers: Number,
    last: Number
  },
  instagram: {
    displayName: String,
    followers: Number,
    last: Number
  },
  vine: {
    displayName: String,
    followers: Number,
    last: Number
  },
  twitter: {
    displayName: String,
    followers: Number,
    last: Number
  },
  facebook: {
    displayName: String,
    followers: Number,
    last: Number
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
})
var profileSnapshot = new mongoose.Schema({
  platformID: {
    type: String
  },
  platform: {
    type: String,
    enum: ['youtube', 'instagram', 'vine', 'twitter', 'facebook']
  },
  followers: {
    type: Number
  },
  posts: {
    type: Number
  },
  views: {
    type: Number
  },
  date: {
    type: Date
  }, 
  profileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile',
    required: true
  }
})
var post = new mongoose.Schema({
  // one time post info ie description or media assets, links, refer to profile
  title: {
    type: String
  },
  description: {
    type: String
  },
  postId: {
    type: String
  },
  type: {
    type: String,
    enum: ['youtube', 'instagram', 'vine', 'twitter', 'facebook']
  },
  comments: {
    type: Number
  }, 
  likes: {
    type: Number 
  }, 
  favorites: {
    type: String
  }, 
  views: {
    type: Number
  }, 
  shares: {
    type:Number
  },
  dislikes: {
    type: Number
  }, 
  date: {
    type: Number,
    index: true
  },
  profileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile'
  },
  snapshots: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PostSnapshot'
  }]
})
var postSnapshot = new mongoose.Schema({
  profileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProfileSnapshot',
    required: true
  },
  postId: {
    type: String
  },
  comments: {
    type: Number
  }, 
  likes: {
    type: Number 
  }, 
  favorites: {
    type: String
  }, 
  views: {
    type: Number
  }, 
  shares: {
    type:Number
  },
  dislikes: {
    type: Number
  }, 
  date: {
    type: Date
  } 
})
var triggerFrequency = new mongoose.Schema({
  youtube: {
    type: Boolean,
    frequency: Number
  },
  instagram: {
    type: Boolean,
    frequency: Number
  },
  vine: {
    type: Boolean,
    frequency: Number
  },
  twitter: {
    type: Boolean,
    frequency: Number
  },
  facebook: {
    type: Boolean,
    frequency: Number
  }
  
})
user.plugin(findOrCreate);
post.plugin(findOrCreate);
profile.plugin(findOrCreate);

module.exports = {
  User: mongoose.model('User', user), 
  Profile: mongoose.model('Profile', profile),
  ProfileSnapshot: mongoose.model('ProfileSnapshot', profileSnapshot),
  Post: mongoose.model('Post', post),
  PostSnapshot: mongoose.model('PostSnapshot', postSnapshot),
  triggerFrequency: mongoose.model('triggerFrequency', triggerFrequency)
}