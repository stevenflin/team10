var router = require('express').Router();
var passport = require('passport');
var FB = require('fb');

var vine = require('../test/vine.js');
var instagram = require('../test/ig.js');
var ig = require('instagram-node').instagram()
var facebook = require('../facebook-test.js')
FB.setAccessToken('EAAYsgV1owZC0BAEMGZAdeR0LqZAc97sa9BVWBrkGp1Xmub80rh94JyHxWXzIqZCXh1a2TaAtZAM2rwidFTgfwGdJqe22hWBK8jpAGPk9lCIT9eoCuIbZCuFzP20RqaJgYXiUpYsw9EgLhi2YlY3pwFyzDjvpl5hMRMwl0ky92FbwZDZD');




var vine = require('../update/vine.js');
var instagram = require('../update/ig.js');

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
//dashboard and dashboard/id that takes id of each client user
// update route that always pings 
router.get('/update', function(req, res, next){  //should be /update/page
	// executing all 'get data/statistics'
	
	var test = facebook.time(3);
	var pageId = req.user.facebook.pages[0].pageId;
	var functions= [ 
			facebook.pageImpressions(28, pageId),
			facebook.pageViewsTotal(28, pageId),
			facebook.pagePostImpressions(28, pageId),
			facebook.pagePosts(28, pageId)
		]
	console.log("FACEBOOK ID ",req.user.facebook.pages[0].pageId)
	FB.setAccessToken('EAAYsgV1owZC0BAEMGZAdeR0LqZAc97sa9BVWBrkGp1Xmub80rh94JyHxWXzIqZCXh1a2TaAtZAM2rwidFTgfwGdJqe22hWBK8jpAGPk9lCIT9eoCuIbZCuFzP20RqaJgYXiUpYsw9EgLhi2YlY3pwFyzDjvpl5hMRMwl0ky92FbwZDZD');
	Promise
	.all([test, functions[0], functions[1], functions[2]])
	.then((result)=>{
		console.log("RESULT", result)
	})	
	res.render('dashboard', {test: test.since, })
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



var i = 0;

router.get('/update/instagram', function(req, res, next){
	console.log("[instagram update] iteration:", i);
	i += 1;

	// Find social media profile
	Profile.findOne({userId: req.user._id}, function(err, profile){
		if(err)return next( err)

		// Get instagram data
		instagram.instagramInformation(process.env.ID, process.env.AT)
		.then(function(data) {
			// console.log('instagramprofile id',req.user.instagram.instagramProfile.id);
			// console.log('WHAT IS MY TYPE', typeof req.user.instagram.instagramProfile.id)

			console.log("[instagram] data length:", data.length);

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
							postId: postData.id,
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

router.get('/dashboard', function(req, res, next) {
	Profile.findOne({userId: req.user._id}, function(err, profile) {
		if (err) return next(err);
		ProfileSnapshot.find({profileId: profile._id}, function(err, psnaps) {
			if (err) return next(err);
			var dashboard = {};
			psnaps.forEach(function(p) {
				if (!dashboard[p.platform]) {
					dashboard[p.platform] = [p.followers];
				} else {
					dashboard[p.platform].push(p.followers);
				}
			});
			console.log('[DASHBOARD]', dashboard);
			console.log('[YOUTUBE]', dashboard.youtube);
			res.render('dashboard', {
				dashboard
			});
		});
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