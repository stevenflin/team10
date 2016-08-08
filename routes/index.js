var router = require('express').Router();
var passport = require('passport');
var FB = require('fb');
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

router.get('/update', (req, res, next) => {
  var socialPromises = Object.keys(socialFunctions).map((socialFunction) => {
    return socialFunctions[key]();
  });

  Promise
  .all(socialPromises)
  .then((allTheDataEver) => {
    console.log("[all the data like ever]", allTheDataEver);
  })
  .catch(console.log.bind(this, "[social function err]"));
})

router.get('/youtube', function(req, res, next) {
  getYoutubeData(req.user.youtube.profile.id)
  .then((data) => {
  	console.log('[DO THESE HAVE VIDEO IDS?', data)
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


module.exports = router;