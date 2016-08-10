var router = require('express').Router();
var passport = require('passport');
var FB = require('fb');


var ig = require('instagram-node').instagram()
var facebook = require('../facebook-test.js')
FB.setAccessToken('EAAYsgV1owZC0BAEMGZAdeR0LqZAc97sa9BVWBrkGp1Xmub80rh94JyHxWXzIqZCXh1a2TaAtZAM2rwidFTgfwGdJqe22hWBK8jpAGPk9lCIT9eoCuIbZCuFzP20RqaJgYXiUpYsw9EgLhi2YlY3pwFyzDjvpl5hMRMwl0ky92FbwZDZD'); //put into function themselves or process.env




var vine = require('../update/vine.js');
var instagram = require('../update/ig.js');
var twitter = require('../update/twitter.js');

var youtubeFunctions = require('../update/youtube');
var getYoutubeData = youtubeFunctions.getYoutubeData;
var youtubeUpdate = youtubeFunctions.youtubeUpdate;
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
								postId: postData.postId,
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

router.get('/update/instagram', function(req, res, next){
	// Find social media profile
	instagram.instagramUpdate(req.user._id)
	.then(() => res.redirect('/integrate'));
})

router.get('/update/youtube', function(req, res, next) {
	youtubeUpdate(req.user._id)
	.then(() => res.redirect('/youtube'));
});

router.get('/update/twitter', function(req, res, next){
	twitter.twitterUpdate(req.user._id)
	.then(() => res.redirect('/integrate'));	
})

router.get('/update/vine', function(req, res, next){
	Profile.findOne({userId: req.user._id}, function(err, profile){
		if(err) return next(err);
		vine.vineInformation(req.user.vine.username, req.user.vine.password)
		.then(function(data){
			console.log('what does this look like........', data)

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
						profileId: profile._id
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

			
								if(i === data.data.records.length -1){
									res.redirect('/integrate');
								}
							})	
						})
					})
				})

			})
		}).catch((err) => next(err));
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
			console.log('these are the data results..............', followers)
			res.render('dashboard', {
				snaps,
				followers,
				recent,
				change
			});
		}).catch((err) => console.log(err));
	});
});

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
				console.log('what does this look like......', data.vine[0].snippet);
				console.log('what aboutthis look like......', data.vine[0].snaps);
				res.render('posts', {
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