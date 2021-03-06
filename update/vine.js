var Vineapple = require('vineapple');
var encryptor = require('simple-encryptor')(process.env.SECRET);
var models = require('../models/models');
var User = models.User;
var Profile = models.Profile;
var ProfileSnapshot = models.ProfileSnapshot;
var Post = models.Post;
var PostSnapshot = models.PostSnapshot;

function vineInformation(username, password){
	// console.log('did i make it here x2')
	return new Promise(function(resolve, reject){
		var vineArr = [];
		var vine = new Vineapple();
		var user1;
		// Authenticate the Vine user
		var decrypted = encryptor.decrypt(password);
	
		vine.login(username, decrypted, function (error, client) {
			if (error) {
				resolve(false)
			}
			// console.log("login error", error);
		    // Make an API request
		    client.me(function (error, user) {
		        // Handle failure
		        
		        if (error) {
		            resolve('hello its me');
		         }
		         var userId = user.userId;
		         function getVideos(page) {
		         	client.user(userId, {page:page, size:20}, function(error, data){
			         	if (error) return reject(error);
			         	
		         		resolve({user, data});

			        })
		         }

		         getVideos(1)
		        
		    });

		});
	})
	// .then((results) => console.log(results.data.records[0].likes))
}


function vineUpdate(user, twentyMinUpdate) {
	console.log("vine 111", user.username)
	return new Promise(function(resolve, reject) {
		Profile.findOne({userId: user._id}, function(err, profile) {
			if (err) return next(err);

			if (!user.vine.username) {
				return resolve();
			}
			vineInformation(user.vine.username, user.vine.password)
			.then(function(data) {
				// console.log("DATA", data)
				user.url.vine = data.user.shareUrl;
				// console.log("USER YO", user.url.vine)
				user.save();
				// console.log("REACHED")
				return new Promise(function(interResolve, interReject) {

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
						}).save(function(err, p) {

							if(err) return next(err);
							var posts = [];
							data.data.records.forEach(function(postData, i) {

								Post.findOrCreate({postId: postData.postId}, {
									description: postData.description,
									postId: postData.postId,
									type: 'vine',
									profileId: profile._id,
									date: new Date(postData.created)
								}, function(err, post) {
									if(err) return next(err);

									new PostSnapshot({
										profileId: p._id, 
										postId: post.postId,
										comments: postData.comments.count,
										shares: postData.reposts.count,
										likes: postData.likes.count,
										views: postData.loops.count, 
										date: p.date,
										// engagement: ((postData.likes.count + postData.shares.count) / data.user.followerCount) * 100
									})
									.save(function(err, psnap) {
										if(err) return next(err);
										post.snapshots.push(psnap._id);
										post.save(function(err) {
											if(err) return next(err);

											posts.push(post);
											if (posts.length === data.data.records.length) {
												posts = posts.sort(function(a, b) {
													return b.date - a.date;
												});
												// console.log('post post post..........', posts)
												interResolve(posts[0]);
											}
											console.log('vine 333', user.username)
											resolve();
										});
									});
								});
							});
						});
					} else {
						profile.vine.followers = data.user.followerCount;
						profile.save();
						data.data.records.forEach(function(postData, i) {
							Post.findOrCreate({postId: postData.postId}, {
								description: postData.description,
								postId: postData.postId,
								type: 'vine',
								profileId: profile._id,
								date: new Date(postData.created)
							}, function(err, post){
								if (err) return console.log(err);

								post.comments = postData.comments.count;
								post.shares = postData.reposts.count;
								post.likes = postData.likes.count;
								post.views = postData.loops.count;

								var engagement = 0;
								if (post.likes) {
									engagement = engagement + postData.likes.count;
								}
								if (post.shares) {
									engagement = engagement + postData.reposts.count;
								}	
								post.engagement = ((engagement / data.user.followerCount) * 100).toFixed(2);

								post.save(function(err) {
									if (err) return console.log(err);
									console.log('vine 222', user.username)
									resolve();
								});
							});
						});
					}
				})
				.then((latestPost) => {

					if(user.triggerFrequency.vine.turnedOn){ 
						var daysSinceLastPost = Math.floor((new Date() - latestPost.date) / (1000 * 60 * 60 * 24)); // Current unix time - allowed number of days in unix
						user.triggerFrequency.vine.lastPost = daysSinceLastPost;
						// console.log("[apparently the days since last post]", daysSinceLastPost);

						// has this use updated within the last day?
						user.triggerFrequency.vine.upToDate = (daysSinceLastPost - user.triggerFrequency.vine.frequency > 0) ? false : true;
						user.save();
					}
				})	
			}).catch((err) => next(err));
		});
	});
}





module.exports={
	vineInformation: vineInformation,
	vineUpdate: vineUpdate
}