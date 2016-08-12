var router = require('express').Router();
var passport = require('passport');
var FB = require('fb');
var ig = require('instagram-node').instagram();

var twilio = require('../test/trigger.js');
var triggerMeTimbers = twilio.triggerMeTimbers;

var dashboardFunctions = require('../update/dashboard');
var getPosts = dashboardFunctions.getPosts;
var getGeneral = dashboardFunctions.getGeneral;

var facebook = require('../update/facebook')
var facebookUpdate = facebook.facebookUpdate;

var vine = require('../update/vine');
var vineUpdate = vine.vineUpdate;

var instagram = require('../update/ig');
var instagramUpdate = instagram.instagramUpdate;

var twitter = require('../update/twitter');
var twitterUpdate = twitter.twitterUpdate;

var youtubeFunctions = require('../update/youtube');
var youtubeUpdate = youtubeFunctions.youtubeUpdate;

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
	Profile.findOne({userId: req.user._id}, function(err, profile) {
		if (err) return next(err);
		console.log('profile..........', profile)
		res.render('integrate', {
			userId: req.user._id,
			profile
		});
	});
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
		return res.render('fbPageSelector', {result: result.data})
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
		});
	} else {
		res.status(400).json({
			message: "Kinda missing a pageId there bud"
		})
	}
	
})
	
// DAILY SNAPSHOTS

router.get('/update/facebook', function(req, res, next){  //should be /update/page
	User.find(function(err, users) {
		users.forEach((user) => {
			facebookUpdate(user)
			.then(() => res.redirect('/integrate'));
		})
	})
})

router.get('/update/instagram', function(req, res, next){
	// Find social media profile
	User.find(function(err, users) {
		users.forEach((user) => {
			instagramUpdate(user)
			.then(() => res.redirect('/integrate'));
		})
	})
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

// call this function everyday, does make snapshots

router.get('/update', (req, res, next) => {
	User.find(function(err, users) {
		users.forEach(function(user) {
			instagramUpdate(user)
			.then(() => youtubeUpdate(user))
			.then(() => twitterUpdate(user))
			.then(() => vineUpdate(user))
			.then(() => facebookUpdate(user)) //fix pauses the update route
			.then(() => res.redirect('/integrate'));
		});
	});
});

// call this FUNction every 20 minutes, does not make snapshots

router.get('/update/frequent', (req, res, next) => {
	User.find(function(err, users) {
		users.forEach(function(user) {
			var isTwenty = true;
			instagramUpdate(user, isTwenty)
			.then(() => youtubeUpdate(user, isTwenty))
			.then(() => twitterUpdate(user, isTwenty))
			.then(() => vineUpdate(user, isTwenty))
			.then(() => facebookUpdate(user, isTwenty))
			.then(() => res.redirect('/integrate'));
		});
	});
});

// router.get('/trigger', (req, res, next)=>{
// 	res.render('trigger')
// })

router.get('/update/trigger', (req, res, next)=>{
	console.log('user', user);
	var id = req.user.id;
	var types = ['youtube', 'instagram', 'vine', 'twitter', 'facebook'];
	
	Profile.findOne({userId: user._id}, function(err, profile) {

		types.map(function(p){
			return new Promise(function(resolve, reject){
				resolve(Post.find({profileId:profile._id, type: p }))
			})
			.then((posts)=>{ //because its a promise, posts are accessible throughout the route function
				console.log("posts", posts)
				types.map(function(platform){
					console.log("platform", platform)
					triggerFrequency.findOne({type:platform})
					//update models to only get triggerfrequency if the user is integrated with the platform
				})
				.then((triggerFrequencyPolicy)=>{
					//if statements here to check posts vs the policy

				})
			})
					

			
		})

	})

})
	
	// Schedule once a day, sometime in the morning
	// 1 find posts by id
	// 2. find trigger frequency
	// 3. compare for each channel if post date is longer than allowed frequency
	// 4 send



// DASHBOARD ROUTES

router.get('/dashboard', function(req, res, next) {
	res.redirect('/dashboard/'+req.user._id);
})

//dashboard and dashboard/id that takes id of each client user
// update route that always pings 


router.use(function(req, res, next) {
	if (req.user._id || req.user.isAdmin) {
		return next();
	} else {
		return res.redirect('/');
	}
});

router.get('/dashboard/:id', function(req, res, next) {
	var id = req.params.id;
	User.findById(id, function(err, user) {
		return new Promise(function(resolve, reject) {
			if(req.user.isAdmin) {
				User.find((err, users) => {
					if (err) return reject(err);
					var userArray = users.map((users) => {return {id: users._id, username: users.username}})
					resolve(userArray)
				});
			} else {
				resolve([])
			}
		})
		.then((userArray) => {

			getGeneral(id) //gets subscriber, follower/data
			.then((platformData) => { 
				var platforms = ['youtube', 'instagram', 'vine', 'twitter', 'facebook'];
				var change = {};
				var direction = {};
				platforms.map((p) => {
					if (platformData.recent[p]) {
						change[p] = parseInt(((platformData.recent[p].followers - platformData.recent[p].last) / platformData.recent[p].last) * 100);
						if (change[p] > 0) {
							direction[p] = {
								up: true,
								down: false
							}
						} else if (change[p] < 0) {
							direction[p] = {
								up: false,
								down: true
							}
						} else {
							direction[p] = {
								up: false,
								down: false
							}
						}
					}
				})
				// console.log('what does this look like.......', direction.instagram.up)
				// console.log('and this.......................', direction.instagram.down)
				getPosts(id) //get posts for the person
				.then((postData) => {
					console.log('what does this look like......', postData.youtube.posts)
					res.render('dashboard', {
						platformData: platformData,
						postData: postData,
						user: user,
						userArray: userArray,
						me: req.user,
						change,
						direction
					});
				});
			}); //platform data
		});
	}).catch(console.log.bind(this, "[error]"));
});

router.get('/posts', function(req, res, next) {
	getPosts(req.user._id)
	.then((data) => {
		// console.log(data.youtube.posts)
		var arr = [];
		data.youtube.posts.forEach(function(d) {
			console.log(d[0].snapshots.map((snap) => snap.likes));
			arr.push(d[0].snapshots.map((snap) => snap.likes));
		});
		// console.log('what does arr look like', arr)
		res.render('posts', {
			data: arr[1]
		});
	});
});

router.get('/remind', function(req, res, next){
	triggerMeTimbers()
	.then(()=> res.redirect('/integrate'))
})	

module.exports = router;




