var Vineapple = require('vineapple');
var models = require('../models/models');
var User = models.User;
var Profile = models.Profile;
var ProfileSnapshot = models.ProfileSnapshot;
var Post = models.Post;
var PostSnapshot = models.PostSnapshot;

function vineInformation(username, password){
	return new Promise(function(resolve, reject){
		var vineArr = [];
		var vine = new Vineapple();
		var user1;
		// Authenticate the Vine user
		vine.login(username, password, function (error, client) {
			// console.log("login error", error);
		    // Make an API request
		    client.me(function (error, user) {
		        // Handle failure
		        var userId = user.userId;
		        if (error) {
		            throw new Error(error);
		         }

		         function getVideos(page) {
		         	client.user(userId, {page:page, size:20}, function(error, data){
			         	if (error) return reject(error);
			         		// console.log("actual fucking data", data)
			         		// console.log("data", data.records[0].likes);
		         		resolve({user, data});

			        })
		         }

		         getVideos(1)
		        
		    });

		});
	})
	// .then((results) => console.log(results.data.records[0].likes))
}


function vineUpdate(user, twentyMinUpdate){
	return new Promise(function(resolve, reject) {
		Profile.findOne({userId: user._id}, function(err, profile){
			if (err) return next(err);

			if (!user.vine.username) {
				return resolve();
			}

			vineInformation(user.vine.username, user.vine.password)
			.then(function(data){
				// console.log('what does this look like........', data)

				if (!twentyMinUpdate) {
					profile.vine.last = data.user.followerCount;
					profile.save();
					new ProfileSnapshot({
						platformID: data.userId,
						platform: 'vine', 
						followers: data.user.followerCount, 
						posts: data.user.postCount,
						date: new Date(),
						profileId: profile._id
					}).save(function(err, p){
						if(err) return next(err);
						// console.log('what does this look like.......', p);
						// console.log('what about this................', p.followers);

						data.data.records.forEach(function(postData, i){

							Post.findOrCreate({postId: postData.postId}, {
							description: postData.description,
							postId: postData.postId,
							type: 'vine',
							profileId: profile._id,
							date: new Date(postData.created).getTime()
						}, function(err, post){
							if(err) return next(err);

							new PostSnapshot({
								profileId: p._id, 
								postId: post.postId,
								comments: postData.comments.count,
								shares: postData.reposts.count,
								likes: postData.likes.count,
								views: postData.loops.count, 
								date: p.date
							})
							.save(function(err, psnap){
								if(err) return next(err);

								post.snapshots.push(psnap._id);
								post.save(function(err){
									if(err) return next(err);
									resolve();
									})	
								})
							})
						})
					})
				} else {
					profile.vine.followers = data.user.followerCount;
					profile.save();
					data.data.records.forEach(function(postData, i) {
						Post.findOrCreate({postId: postData.postId}, {
							description: postData.description,
							postId: postData.postId,
							type: 'vine',
							profileId: profile._id,
							date: new Date(postData.created).getTime()
						}, function(err, post){
							if (err) return console.log(err);

							post.comments = postData.comments.count;
							post.shares = postData.reposts.count;
							post.likes = postData.likes.count;
							post.views = postData.loops.count; 

							post.save(function(err) {
								if (err) return console.log(err);
								resolve();
							})
						})
					})
				}
			}).catch((err) => next(err));
		})
	})
}





module.exports={
	vineInformation: vineInformation,
	vineUpdate: vineUpdate
}