var router = require('express').Router();
var passport = require('passport');
var FB = require('fb');
var ig = require('instagram-node').instagram()

var facebook = require('../facebook-test.js')
var facebookUpdate = facebook.facebookUpdate;

var vine = require('../update/vine.js');
var vineUpdate = vine.vineUpdate;

var instagram = require('../update/ig.js');
var instagramUpdate = instagram.instagramUpdate;

var twitter = require('../update/twitter.js');
var twitterUpdate = twitter.twitterUpdate;

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

		req.user.facebook.pages.push({pageId: req.query.pageId, pageName: req.query.name})
		req.user.save(function(err, success){
			console.log("Running")
			if(err){
				console.log("ERROR ", err)
			}
			console.log("YO BITCH",success)
		});
		res.render('integrate')	
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
			// console.log('SNAPS~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~', snaps)
			// console.log('followers~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~', followers)
			// console.log('REcent ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~', recent)
			// console.log('Change~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~', change)



			// console.log('these are the data results..............', followers)

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
				Post.find({profileId: profile._id, type: p})
				.sort({'date': 1})
				.populate('snapshots')
				.exec(function(err, posts) {
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
			console.log('hopefully this works on the first try.......', data);
			console.log('what does this look like....................', data[0].posts[0])
			res.send('hi');
		}).catch((err) => console.log(err));
	});
})			

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
	
// DAILY SNAPSHOTS

router.get('/update/facebook', function(req, res, next){  //should be /update/page
	facebookUpdate(req.user._id)
	.then(() => res.redirect('/integrate'));
})

router.get('/update/instagram', function(req, res, next){
	// Find social media profile
	instagramUpdate(req.user._id)
	.then(() => res.redirect('/integrate'));
})

router.get('/update/youtube', function(req, res, next) {
	youtubeUpdate(req.user._id)
	.then(() => res.redirect('/integrate'));
});

router.get('/update/twitter', function(req, res, next){
	twitterUpdate(req.user._id)
	.then(() => res.redirect('/integrate'));	
})

router.get('/update/vine', function(req, res, next){
	vineUpdate(req.user._id)
	.then(() => res.redirect('/integrate'));
})

router.get('/update', (req, res, next) => {
	var id = req.user._id;
	instagramUpdate(id)
	.then(() => youtubeUpdate(id))
	.then(() => twitterUpdate(id))
	.then(() => vineUpdate(id))
	.then(() => facebookUpdate(id))
	.then(() => res.redirect('/integrate'));
})

router.get('/dashboard', function(req, res, next) {
	res.redirect('/dashboard/1');
})

module.exports = router;