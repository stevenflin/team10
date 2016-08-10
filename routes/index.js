var router = require('express').Router();
var passport = require('passport');
var FB = require('fb');


var ig = require('instagram-node').instagram()
var facebook = require('../facebook-test.js')




var vine = require('../update/vine.js');
var instagram = require('../update/ig.js');
var twitter = require('../update/twitter.js');

var youtubeFunctions = require('../update/youtube');
var getYoutubeData = youtubeFunctions.getYoutubeData;
var getDay = youtubeFunctions.getDay;
var getWeek = youtubeFunctions.getWeek;
var getMonth = youtubeFunctions.getMonth;
var getYear = youtubeFunctions.getYear;

// MODELS
var models = require('../models/models');
var User = models.User;
var Profile = models.Profile;
var ProfileSnapshot = models.ProfileSnapshot;
var Post = models.Post;
var PostSnapshot = models.PostSnapshot;

var time = facebook.time; //DO NOT COMMENT THIS SHIT OUT **** !!!

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


router.get('/integrate', function(req, res, next) {
  res.render('integrate');
});

router.get('/fbPageSelector', function(req, res, next) {
	console.log("REQ ", req.user.facebook.token);
	
	new Promise(function(resolve, reject){

		FB.setAccessToken(req.user.facebook.token);

		console.log("REQ ", req.user.facebook.id);

		FB.api('/'+req.user.facebook.id+'/accounts', function (res) { //takes facebook user id and gets pages that they administer
			if(!res || res.error) {
				console.log(!res ? 'error occurred' : res.error);
				reject(res.error);
			}
			console.log("here3")
			resolve(res);
		});
	})
	.then((result) => {
		console.log('here2')
		res.render('fbPageSelector', {result: result.data})
	})
	.catch(console.log)
});

//GETS PAGE DATA FROM INDIVIDUAL FACEBOOK PAGE
router.get('/fbPageConfirmation/', function(req, res, next) {
	if (req.query.pageId) {
		FB.setAccessToken(req.user.facebook.token);

		console.log("~~~~~~~~~~~~~~~~~~~~ ",req.query);
		console.log("~~~~~~~~XXXXXXXX~~~~~~~ ",req.user.facebook.pages);
		req.user.facebook.pages.push({pageId: req.query.pageId, pageName: req.query.name})
		console.log("~~~~~~~~XXXXXXXX~~~~~~~ ",req.user.facebook.pages);
		req.user.save(function(err, success){
			console.log("Running")
			if(err){
				console.log("ERROR ", err)
			}
			console.log("YO BITCH",success)
		});
		res.render('fbPageSelector', {result: result})	
		new Promise(function(resolve, reject){

			FB.api(`/${req.query.pageId}/insights/page_views_total`, function (res) {
				if(!res || res.error) {
					console.log(!res ? 'error occurred' : res.error);
					reject(res.error);
				}

			  console.log("RESPONSE   ", res.data[2].values); //get's 28 day values 
			  resolve(res);
			});
		})
		.then(function(result){
			res.render('fbPageSelector')
		})
		.catch(console.log)
	}
	
})


//GETS 

// router.get('/update', (req, res, next) => {
//   var socialPromises = Object.keys(socialFunctions).map((socialFunction) => {
//     return socialFunctions[key]();
//   });

//   Promise
//     .all(socialPromises)
//     .then((allTheDataEver) => {
//       console.log("[all the data like ever]", allTheDataEver);
//     })
//     .catch(console.log.bind(this, "[social function err]"));
// })


// { attribution: null,
//     tags: 
//      [ 'guerillamarketing',
//        'entrepreneur',
//        'pokemon',
//        'growthhacking' ],
//     type: 'image',
//     location: 
//      { latitude: 39.951695887205,
//        name: 'University of Pennsylvania',
//        longitude: -75.194293192075,
//        id: 180841 },
//     comments: { count: 0 },
//     filter: 'Reyes',
//     created_time: '1470431285',
//     link: 'https://www.instagram.com/p/BIvdVwDB8uc/',
//     likes: { count: 98 },
//     images: 
//      { low_resolution: [Object],
//        thumbnail: [Object],
//        standard_resolution: [Object] },
//     users_in_photo: [],
//     caption: 
//      { created_time: '1470431285',
//        text: 'Peep the bar in the truck bed. Only in Philly #guerillamarketing #growthhacking #entrepreneur #pokemon',
//        from: [Object],
//        id: '17860941652046758' },
//     user_has_liked: false,
//     id: '1310395054636387228_440696783',
//     user: 
//      { username: 'pakaplace',
//        profile_picture: 'https://scontent.cdninstagram.com/t51.2885-19/s150x150/13774404_1154932207906735_80316018_a.jpg',
//        id: '440696783',
//        full_name: 'Parker Place' } },



//dashboard and dashboard/id that takes id of each client user
// update route that always pings 
var i = 0;
router.get('/update/facebook', function(req, res, next){  //should be /update/page
	// executing all 'get data/statistics'
	console.log("kool", req.user._id);
	Profile.findOne({userId: req.user._id}, function(err, profile){
		console.log("hoesxx", profile)
		if(err) return next(err)
		var test = facebook.time(3);
		var pageId = req.user.facebook.pages[0].pageId;
		var functions= [ 
				facebook.pageImpressions(28, pageId),
				facebook.pageViewsTotal(28, pageId), //fix- currently only had last 3 days
				facebook.pagePostImpressions(28, pageId), 
				facebook.pagePosts(28, pageId), //
				facebook.pageFans(28, pageId) //fix-undefiened
			]
		console.log("FACEBOOK ID ",req.user.facebook.pages[0].pageId)
		FB.setAccessToken(req.user.facebook.token); //for testing purposes- EAAYsgV1owZC0BAEMGZAdeR0LqZAc97sa9BVWBrkGp1Xmub80rh94JyHxWXzIqZCXh1a2TaAtZAM2rwidFTgfwGdJqe22hWBK8jpAGPk9lCIT9eoCuIbZCuFzP20RqaJgYXiUpYsw9EgLhi2YlY3pwFyzDjvpl5hMRMwl0ky92FbwZDZD
		Promise
		.all([functions[0], functions[1], functions[2], functions[3], functions[4]])
		.then((result)=>{ // create profile and profile snapshot here
			console.log("$$0")

			try {

				new ProfileSnapshot({
					platformId: req.user.facebook.id,
					platform: 'facebook',
					followers: result[4],
					views: result[0][result[0].length-1].value,
					posts: result[3].length,
					date: new Date(),
					profileId: profile._id
				})
				.save(function(err, p){

					console.log('$$1')
					if(err) return next(err);

					result[3].forEach(function(post, i){

						Post.findOrCreate({postId: post.postId}, {
							description: post.message,
							postId: post.postId,
							type: 'facebook',
							profileId: profile._id
						}, function(err, postData){

							console.log('$$2')
							if(err) return next(err);

							console.log("[creating post] for:", post.postId);

							// snapshot it
							new PostSnapshot({
								profileId: p._id, 
								postId: postData.id,
								comments: post.comments,
								likes: post.likes,
								shares: post.shares,
								date: p.date
							})
							.save(function(err, psnap){

								console.log('$$3')
								if(err) return next(err);

								postData.snapshots.push(psnap._id);
								postData.save(function(err){
									if(err) return next(err);

									if (i === result[3].length-1) {

										res.render('dashboard')
									}
									
								})				
							})

					})

				})	
			})
			}
			catch (error) {
				console.log(error);
			}
		})
		.catch(console.log)
	})
	
})

var i = 0;

router.get('/update/instagram', function(req, res, next){
	// Find social media profile
	Profile.findOne({userId: req.user._id}, function(err, profile){
		if(err)return next( err)

		// Get instagram data
		instagram.instagramInformation(process.env.ID, process.env.AT)
		.then(function(data) {

			// Create new profile snapshot
			new ProfileSnapshot({
				platformID: req.user.instagram.instagramProfile.id,
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
						profileId: profile._id
					}, function(err, postData){
						if(err) return next(err);
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
								if(i === data.bigArr.length -1){
									res.redirect('/integrate');
								}
							})				
						})
					})
				})
			})
		})
	}).catch(function(err){ next(err)})
})

router.get('/update/youtube', function(req, res, next) {
	getYoutubeData(req.user.youtube.profile.id)
	.then(function(data) {
		Profile.findOne({userId: req.user._id},function(err, profile) {
			if (err) return next(err);

			new ProfileSnapshot({
				platformID: req.user.youtube.profile.id,
				platform: 'youtube',
				followers: data.channel.subscriberCount,
				posts: data.channel.videoCount,
				views: data.channel.viewCount,
				date: new Date(),
				profileId: profile._id
			}).save(function(err, p) {
				if (err) return next(err);

				data.videos.forEach(function(video, i) {

					Post.findOrCreate({postId: video.id}, {
						title: video.snippet.title,
						description: video.snippet.description,
						postId: video.id,
						type: 'youtube',
						profileId: profile._id
					}, function(err, post) {
						if (err) return next(err);

						new PostSnapshot({
							profileId: p._id,
							postId: post.postId,
							comments: parseInt(video.stats.commentCount),
							likes: parseInt(video.stats.likeCount),
							favorites: parseInt(video.stats.favoriteCount),
							views: parseInt(video.stats.viewCount),
							dislikes: parseInt(video.stats.dislikeCount),
							date: p.date
						}).save(function(err, psnap) {
							if (err) return next(err);

							post.snapshots.push(psnap._id);
							post.save(function(err) {
								if (err) return next(err);
								if (i === data.videos.length - 1) {
									res.redirect('/youtube');
								}
							});
						});
					});
				});
			});
		});
	}).catch((err) => next(err));
});

router.get('/update/twitter', function(req, res, next){
	// get user info
	Profile.findOne({userId: req.user._id}, function(err, profile){
		if(err) return next(err);

		// get twitter info
		twitter.twitterInformation(process.env.TWITTER_ACCESS_TOKEN_KEY, process.env.TWITTER_ACCESS_TOKEN_SECRET)
		.then(function(data){
		
			new ProfileSnapshot({
				platformID: req.user.twitter.twitterProfile._json.id,
				platform: 'twitter', 
				followers: data[0].user.followers_count, 
				posts: data[0].length,
				date: new Date(),
				profileId: profile._id
			})
			.save(function(err, p){
				if(err) return next(err);

				// iterate through posts
				data.forEach(function(postData, i){
					// console.log("postdata", postData)

					// If post doesn't exist, create it
					Post.findOrCreate({postId: postData.id}, {
						description: postData.text,
						postId: postData.id,
						type: 'twitter',
						profileId: profile._id
					}, function(err, post){
						if(err) return next(err);

						// snapshot it
						new PostSnapshot({
							profileId: p._id, 
							postId: post.postId,
							shares: postData.retweet_count,
							likes: postData.favourite_count,
							date: p.date
						})
						.save(function(err, psnap){
							if(err) return next(err);

							post.snapshots.push(psnap._id);
							post.save(function(err){
								if(err) return next(err);

			
								if(i === data.length -1){
									res.redirect('/integrate');
								}
							})				
						})
					})
				});
			});
		}).catch(function(err){
			console.log("[err]", err);
		})
	})
})

router.get('/update/vine', function(req, res, next){
	Profile.findOne({userId: req.user._id}, function(err, profile){
		if(err) return next(err);
		vine.vineInformation(process.env.VINE_USERNAME, process.env.VINE_PASSWORD)
		.then(function(data){
			console.log("User data", data);

			new ProfileSnapshot({
				platformID: data.userId,
				platform: 'vine', 
				followers: data.following, 
				posts: data.postCount,
				date: new Date(),
				profileId: profile._id
			})
		})
	})
})

router.get('/dashboard', function(req, res, next) {
	res.redirect('/dashboard/1');
})

router.get('/dashboard/:id', function(req, res, next) {
	var platforms = ['youtube', 'instagram', 'vine', 'twitter', 'facebook'];
	Profile.findOne({userId: req.user._id}, function(err, profile) {
		if (err) return next(err);
		platforms = platforms.map(function(p) {
			return new Promise(function(resolve, reject) {
				ProfileSnapshot.find({profileId: profile._id, platform: p})
				.limit(10)
				.exec(function(err, psnaps) {
					if (err) reject(err);
					var followers = [];
					psnaps.forEach(function(psnap) {
						followers.push(psnap.followers);
					})
					resolve({
						type: p,
						data: psnaps,
						followers
					});
				});
			});
		});


		Promise
		.all(platforms)
		.then((results) => {
			snaps = {};
			followers = {};
			recent = {};
			change = {};
			results.forEach(function(result, i) {
				snaps[result.type] = result.data;
				followers[result.type] = result.followers;
				recent[result.type] = result.data[result.data.length - 1];
				if (result.data.length > 1) {
					change[result.type] = parseInt(((result.data[result.data.length - 1].followers - result.data[result.data.length - 2].followers) / result.data[result.data.length - 2].followers) * 100);
				}
			})
			// console.log('[THESE ARE THE RESULTS THE RESULTS ARE THESE]', results);
			// console.log('[FORMATTED DATA]', followers)
			console.log('SNAPS~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~', snaps)
			console.log('followers~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~', followers)
			console.log('REcent ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~', recent)
			console.log('Change~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~', change)



			res.render('dashboard', {
				snaps,
				followers,
				recent,
				change
			});
		}).catch((err) => console.log(err));
	});
});
router.get('/tableTest', function(req, res, next){
	res.render('tableTest')
})
router.get('/posts', function(req, res, next) {
	var platforms = ['youtube', 'instagram', 'vine', 'twitter', 'facebook'];
	Profile.findOne({userId: req.user._id}, function(err, profile) {
		if (err) return next(err);
		platforms = platforms.map(function(p) {
			return new Promise(function(resolve, reject) {
				Post.find({profileId: profile._id, type: p}, function(err, posts) {
					if (err) reject(err);
					// console.log('these are the posts.......', posts);
					// console.log('did i make it here at least');
					resolve({
						type: p,
						posts: posts
					});
				});
			});
		});
		Promise
		.all(platforms)
		.then((data) => {
			// console.log('hopefully this works on the first try.......', data);
			// console.log('what does this look like.......', data[0].posts[0])

			var arr = data.map(function(platform) {
				return new Promise(function(resolve, reject) {
					if (platform.posts.length) {
						var bigArr = [];
						platform.posts.forEach(function(post, i) {
							PostSnapshot.find({postId: post.postId})
							.limit(10)
							.exec(function(err, postsnaps) {
								if (err) reject(err);
								bigArr = bigArr.concat({snippet: post, snaps: postsnaps});
								if (i === platform.posts.length - 1) {
									resolve({
										type: platform.type,
										posts: bigArr
									});
								}
							});
						});
					} else {
						resolve({
							type: platform.type,
							posts: []
						});
					}
				});
			});
			Promise
			.all(arr)
			.then((alldata) => {
				// console.log('hopefully this really did work.....', alldata);
				// console.log('what does this look like.....', alldata[0].posts[0]);
				// var youtube = {};
				// var instagram = {};
				// var vine = {};
				// var facebook = {};
				// var twitter = {};
				var data = {};
				alldata.forEach(function(d) {
					if (!data[d.type]) {
						data[d.type] = d.posts
					}
				})
				console.log('aksdjf;lkasjf;lasj;fjsdd......', data)
				res.render('tableTest', {
					data
				})
			}).catch((err) => console.log(err));
		}).catch((err) => console.log(err));
	});
});


					

router.get('/youtube', function(req, res, next) {
  getYoutubeData(req.user.youtube.profile.id)
  .then((data) => {
    console.log('[ALL VIDEOS]', data.videos);
    var daydata = getDay(data.videos);
    var weekdata = getWeek(data.videos);
    var monthdata = getMonth(data.videos);
    var yeardata = getYear(data.videos);
    res.render('youtube', {
    	channelName: req.user.youtube.profile.displayName,
    	channel: data.channel,
    	daydata,
    	weekdata,
    	monthdata,
    	yeardata
    })
  })
})
	




router.get('/update', (req, res, next) => {

	updateFacebook()
	.then(() => updateInstagram(req.user))
	.then(() => updateYoutube)
	.then(() => updateTwitter)
	.then(() => updateVine)
	.catch(console.log);

})



module.exports = router;