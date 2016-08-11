var ig = require('instagram-node').instagram()
var models = require('../models/models');
var User = models.User;
var Profile = models.Profile;
var ProfileSnapshot = models.ProfileSnapshot;
var Post = models.Post;
var PostSnapshot = models.PostSnapshot;

function instagramInformation(id, accessToken){
	return new Promise(function(resolve, reject){
		var bigArr = [];
		var instagramPages = function (err, medias, pagination, remaining, limit) {
			// console.log("medias", medias)
		 	bigArr = bigArr.concat(medias);
			if(pagination.next) {
			    pagination.next(instagramPages); // Will get second page results 
			  } else {
			 	ig.user(id, function(err, result, remaining, limit) {
			 		if(err) return next(err);
			 			resolve({bigArr, profile: result.counts.followed_by})
			 	});
			  }
			}
			
		ig.use({ access_token: accessToken });
		ig.user_media_recent(id, {cursor: 30}, instagramPages);
	})
}

function instagramUpdate(id) {
	return new Promise(function(resolve, reject) {
		User.findById(id, function(err, user) {
			Profile.findOne({userId: user._id}, function(err, profile){
				if(err)return next( err)

				// Get instagram data
				instagramInformation(user.instagram.instagramProfile.id, user.instagram.AccessToken)
				.then(function(data) {

					// Create new profile snapshot
					new ProfileSnapshot({
						platformID: user.instagram.instagramProfile.id,
						platform: 'instagram', 
						followers: data.profile, 
						posts: data.bigArr.length,
						date: new Date(),
						profileId: profile._id
					})
					.save(function(err, p){
						if(err) return next(err);

						// Iterate through posts and create new snapshots
						data.bigArr.forEach(function(post, i){
							var desc = null;
							if(post.caption){
								desc = post.caption.text
							}


							// If post doesn't exist, create it
							Post.findOrCreate({postId: post.id}, {
								description: desc,
								postId: post.id,
								type: 'instagram',
								profileId: profile._id,
								date: parseInt(post.created_time)
							}, function(err, postData){
								// if(err) return console.log(err);
								if (err) return next(err);
								console.log("[creating post] for:", post.id);

								// snapshot it
								new PostSnapshot({
									profileId: p._id, 
									postId: postData.postId,
									comments: post.comments.count,
									likes: post.likes.count,
									date: p.date
								})
								.save(function(err, psnap){
									if(err) return next(err);
									postData.snapshots.push(psnap._id);
									postData.save(function(err){
										if(err) return next(err);
										resolve();
									})				
								})
							})
						})
					})
				}).catch(function(err){ next(err)})
			})
		})
	})
}

module.exports = {
	instagramInformation: instagramInformation,
	instagramUpdate: instagramUpdate
}
