var router = require('express').Router();
var passport = require('passport');
var FB = require('fb');
var ig = require('instagram-node').instagram();

var dashboardFunctions = require('../update/dashboard');
var getPosts = dashboardFunctions.getPosts;
var getGeneral = dashboardFunctions.getGeneral;

var update = require('../update/update');
var updateUser = update.updateUser;

// MODELS
var models = require('../models/models');
var User = models.User;
var Profile = models.Profile;
var ProfileSnapshot = models.ProfileSnapshot;
var Post = models.Post;
var PostSnapshot = models.PostSnapshot;

var facebook = require('../update/facebook');

var time = facebook.time; //DO NOT COMMENT THIS SHIT OUT **** !!!

/* GET home page. */
router.get('/', function(req, res, next) {
	res.redirect('/dashboard/'+req.user._id);
});


router.get('/integrate', function(req, res, next) {
	Profile.findOne({userId: req.user._id}, function(err, profile) {
		if (err) return next(err);
		// console.log('profile..........', profile)
		res.render('integrate', {
			userId: req.user._id,
			profile
		});
	});
});

router.get('/fbPageSelector', function(req, res, next) {
	new Promise(function(resolve, reject) {

		FB.setAccessToken(req.user.facebook.token);

		FB.api('/'+req.user.facebook.id+'/accounts', function (res) { //takes facebook user id and gets pages that they administer
			if(!res || res.error) {
				console.log(!res ? 'error occurred' : res.error);
				reject(res.error);
			}
			resolve(res);
		});
	})
	.then((result) => {
		return res.render('fbPageSelector', {result: result.data})
	})
	.catch((err) => console.log(err));
});

//GETS PAGE DATA FROM INDIVIDUAL FACEBOOK PAGE
router.get('/fbPageConfirmation/', function(req, res, next) {
	if (req.query.pageId) {
		FB.setAccessToken(req.user.facebook.token);

		req.user.facebook.pages.push({pageId: req.query.pageId, pageName: req.query.name})
		req.user.save(function(err, success) {
			if(err) {
				console.log("ERROR ", err);
			}
			new Promise(function(resolve, reject) {

				FB.api(`/${req.query.pageId}/insights/page_views_total`, function (res) {
					if(!res || res.error) {
						console.log(!res ? 'error occurred' : res.error);
						reject(res.error);
					}
				    resolve(res);
				});
			})
			.then(function(result){
				res.render('fbPageSelector')
			}).catch((err) => console.log(err))
		});
	} else {
		res.status(400).json({
			message: "Kinda missing a pageId there bud"
		});
	}
});

// DASHBOARD ROUTES

router.get('/dashboard', function(req, res, next) {
	console.log('did i make it here')
	updateUser(req.user)
	.then(() => res.redirect('/dashboard/'+req.user._id));
});

router.get('/dashboard/:id', function(req, res, next) {
	var id = req.params.id;
	User.findById(id)
	.lean() 
	.exec(function(err, user) {
		return new Promise(function(resolve, reject) {
			if(req.user.isAdmin) {
				User.find((err, users) => {
					if (err) return reject(err);
					var userArray = users.map((users) => {return {id: users._id, username: users.username}})
					resolve(userArray)
				});
			} else {
				resolve([]);
			}
		})
		.then((userArray) => {
			getGeneral(id) // gets subscriber, follower/data
			.then((platformData) => { 
				var platforms = ['youtube', 'instagram', 'vine', 'twitter', 'facebook'];
				var change = {};
				var direction = {};
				platforms.map((p) => {
					if (platformData.recent[p]) {
						change[p] = (((platformData.recent[p].followers - platformData.recent[p].last) / platformData.recent[p].last) * 100).toFixed(2);
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
				});
				getPosts(id) // get posts for the person
				.then((postData) => {
					var on = {};
					for (var key in user.triggerFrequency) {
						if (user.triggerFrequency[key].turnedOn) {
							on[key] = "true";
						}
					}
					// console.log('what does this look like......', platformData.snaps.youtube[0]);
					res.render('dashboard', {
						platformData: platformData,
						postData: postData,
						user: user,
						admin: req.user.isAdmin,
						userArray: userArray,
						me: req.user,
						change,
						direction,
						on
					});
				});
			});
		}).catch(console.log.bind(this, "[error]"));
	});
});

router.post('/dashboard/:id',(req, res, next)=>{
	User.findById(req.params.id, function(err, user){

	    if (req.body.youtube) {
	    	user.triggerFrequency.youtube.turnedOn = true;
	    	user.triggerFrequency.youtube.frequency = req.body.youtubeDays;
	    } else {
	    	user.triggerFrequency.youtube.turnedOn = false;
	    }
	    if (req.body.vine) {
	    	user.triggerFrequency.vine.turnedOn = true;
	    	user.triggerFrequency.vine.frequency = req.body.vineDays;
	    } else {
	    	user.triggerFrequency.vine.turnedOn = false;
	    }
	    if (req.body.instagram) {
	    	user.triggerFrequency.instagram.turnedOn = true;
	    	user.triggerFrequency.instagram.frequency = req.body.instagramDays;
	    } else {
	    	user.triggerFrequency.instagram.turnedOn = false;
	    }
	    if (req.body.twitter) {
	    	user.triggerFrequency.twitter.turnedOn = true;
	    	user.triggerFrequency.twitter.frequency = req.body.twitterDays;
	    } else {
	    	user.triggerFrequency.twitter.turnedOn = false;
	    }
	    if (req.body.facebook) {
	    	user.triggerFrequency.facebook.turnedOn = true;
	    	user.triggerFrequency.facebook.frequency = req.body.facebookDays;
	    } else {
	    	user.triggerFrequency.facebook.turnedOn = false;
	    }
	    user.save(function(err, user) {
	   	  	if (err) return console.log('asshole....', err);
	   	  	res.redirect('/dashboard/'+req.params.id);
	    });
	});
});

router.get("/privacy",function(req, res, next){
	res.render("privacy");
})

router.get("/terms",function(req, res, next){
	res.render("terms");
})

module.exports = router;


