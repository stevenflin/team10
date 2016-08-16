var router = require('express').Router();
var passport = require('passport');
var FB = require('fb');
var ig = require('instagram-node').instagram();

var twilio = require('../test/trigger.js');
var trigger = twilio.sendMessage;

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
	
	
	new Promise(function(resolve, reject){

		FB.setAccessToken(req.user.facebook.token);

		
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

				  // console.log("RESPONSE   ", res.data[2].values); //get's 28 day values 
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

router.get('/update/facebook', function(req, res, next) {  //should be /update/page
	User.find(function(err, users) {
		users.forEach((user) => {
			facebookUpdate(user)
			.then(() => res.redirect('/integrate'));
		});
	});
});

router.get('/update/instagram', function(req, res, next) {
	User.find(function(err, users) {
		users.forEach((user) => {
			instagramUpdate(user)
			.then(() => res.redirect('/integrate'));
		});
	});
});

router.get('/update/youtube', function(req, res, next) {
	User.find(function(err, users) {
		users.forEach((user) => {
			youtubeUpdate(user)
			.then(() => res.redirect('/integrate'));
		});
	});
});

router.get('/update/twitter', function(req, res, next) {
	User.find(function(err, users) {
		users.forEach((user) => {
			twitterUpdate(user)
			.then(() => res.redirect('/integrate'));
		});
	});
});

router.get('/update/vine', function(req, res, next) {
	User.find(function(err, users) {
		users.forEach((user) => {
			vineUpdate(user)
			.then(() => res.redirect('/integrate'));
		});
	});
});

router.get('/update', (req, res, next) => {
	User.find(function(err, users) {
		users.forEach(function(user) {
			instagramUpdate(user)
			.then(() => {
				console.log('instagram......success');
				youtubeUpdate(user)
			})
			.then(() => {
				console.log('youtube........success');
				twitterUpdate(user)
			})
			.then(() => {
				console.log('twitter........success');
				vineUpdate(user)
			})
			.then(() => {
				console.log('vine...........success');
				facebookUpdate(user)
			}) //fix pauses the update route
			.then(() => {
				console.log('facebook.......success');
				res.sendStatus(200);
			});
		});
	});
});

// call this FUNction every 20 minutes, does not make snapshots

router.get('/update/frequent', (req, res, next) => {
    User.find(function(err, users) {
        users.forEach(function(user) {
            var isTwenty = true;
            instagramUpdate(user, isTwenty)
            .then(() => {
                console.log('instagram......success');
                youtubeUpdate(user, isTwenty)
            })
            .then(() => {
                console.log('youtube........success');
                twitterUpdate(user, isTwenty)
            })
            .then(() => {
                console.log('twitter........success');
                vineUpdate(user, isTwenty)
            })
            .then(() => {
                console.log('vine...........success');
                facebookUpdate(user, isTwenty)
            })
            .then(() => {
                console.log('facebook.......success');
                res.sendStatus(200);
            });
        });
    });
});

router.use(function(req, res, next) {
	if (req.user._id || req.user.isAdmin) {
		return next();
	} else {
		return res.redirect('/login');
	}
});

router.get('/update/trigger', (req, res, next) => {
	User.find(function(err, users) {
		if (err) return next(err);
		users.forEach((user)=> {
			var userTrigger = user.triggerFrequency;
			var msg = "You're behind on posting to the following channels: ";
			if(userTrigger.youtube.turnedOn) {
				userTrigger.youtube.upToDate ? console.log("Nothing was sent") : msg = msg + " Youtube ("+userTrigger.youtube.lastPost+" Days)";
			}
			if(userTrigger.instagram.turnedOn) {
				userTrigger.instagram.upToDate ? console.log("Nothing was sent") : msg = msg + " Instagram ("+userTrigger.instagram.lastPost+" Days)";
			}
			if(userTrigger.twitter.turnedOn) {
				userTrigger.twitter.upToDate ? console.log("Nothing was sent") : msg = msg + " Twitter ("+userTrigger.twitter.lastPost+" Days)";
			}
			if(userTrigger.facebook.turnedOn) {
				userTrigger.facebook.upToDate ? console.log("Nothing was sent") : msg = msg + " Facebook ("+userTrigger.facebook.lastPost+" Days)";
			}
			if(userTrigger.vine.turnedOn) {
				userTrigger.vine.upToDate ? console.log("Nothing was sent") : msg = msg + " Vine ("+userTrigger.vine.lastPost+" Days)";
			}
			trigger(msg, user);
			res.sendStatus(200);
		});
	});
});

// DASHBOARD ROUTES

router.get('/dashboard', function(req, res, next) {
	res.redirect('/dashboard/'+req.user._id);
})

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

router.get('/remind', function(req, res, next) {
	triggerMeTimbers()
	.then(() => res.redirect('/integrate'));
});

module.exports = router;


