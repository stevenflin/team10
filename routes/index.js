var router = require('express').Router();
var passport = require('passport');
var FB = require('fb');
var ig = require('instagram-node').instagram();

var twilio = require('../test/trigger.js');
var triggerMeTimbers = twilio.triggerMeTimbers;

var dashboardFunctions = require('../update/dashboard');
var getPosts = dashboardFunctions.getPosts;
var getGeneral = dashboardFunctions.getGeneral;

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
  console.log("USER ID~~~~~~~~~~~~~~~~~~", req.user._id)
  res.render('integrate', {
  	userId:req.user._id
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
			console.log("YO BITCH",success)

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

router.get('/tableTest', function(req, res, next){
	res.render('tableTest')
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

// call this function everyday, does make snapshots

router.get('/update', (req, res, next) => {
	var id = req.user._id;
	instagramUpdate(id)
	.then(() => youtubeUpdate(id))
	.then(() => twitterUpdate(id))
	.then(() => vineUpdate(id))
	.then(() => facebookUpdate(id)) //fix pauses the update route
	.then(() => res.redirect('/integrate'));
})

// call this FUNction every 20 minutes, does not make snapshots

router.get('/update/frequent', (req, res, next) => {
	var id = req.user._id;
	var isTwenty = true;
	instagramUpdate(id, isTwenty)
	.then(() => youtubeUpdate(id, isTwenty))
	.then(() => twitterUpdate(id, isTwenty))
	.then(() => vineUpdate(id, isTwenty))
	.then(() => facebookUpdate(id, isTwenty))
	.then(() => res.redirect('/integrate'));
})


router.get('/update/trigger', (req, res, next)=>{
	var id = req.user.id;
	var types = ['youtube', 'instagram', 'vine', 'twitter', 'facebook'];
	
	Profile.findOne({userId: user._id}, function(err, profile) {
		types.map(function(p){
			return new Promise(function(resolve, reject){
				resolve(Post.find({profileId:profile._id, type: p }))
			})
			.then((posts)=>{ //because its a promise, posts are accessible throughout the route function
				types.map(function(platform){
					triggerFrequency.findOne({type:platform})
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
	console.log("User~~~~", req.user._id)
	if (req.user._id || req.user.isAdmin) {

		return next();
	} else {
		return res.redirect('/');
	}
})
router.get('/dashboard/:id', function(req, res, next) {
	console.log("1")
	var id = req.params.id;
		User.findById(id, function(err, user) {
			console.log("2")
			return new Promise(function(resolve, reject){
				if(req.user.isAdmin){
					User.find({})
					.exec((err, users)=>{
						if (err) return reject(err);
						var userArray = users.map((users)=>{return {id: users._id, username: users.username}})
						resolve(userArray)
					})
				}
				else{resolve()}
			})
			.then((userArray)=>{

				console.log("3")
				getGeneral(id) //gets subscriber, follower/data
				.then((platformData) => { 
					console.log("4")

					// data["platformData"] = platformData;
					getPosts(id) //get posts for the person
					.then((postData) => {
				// console.log('did i do this right?...........', postData)
				// console.log('did i do this right?..........', postData.youtube);
				// console.log('what does this look like?........', platformData.recent.twitter);
				// console.log('what about this shit.............', postData.youtube.posts[0][2])
				console.log("5")

				if(req.user.isAdmin){
					console.log("USER Dats", platformData)
					console.log("USER ARRAY2", userArray)
										

					res.render('dashboard', {
						platformData: platformData,
						postData: postData,
						user: user,
						userArray: userArray
					})
				}
				else{
					console.log("7")

					res.render('dashboard', {
						platformData: platformData,
						postData: postData,
						user: user
					})
				};
			});
			}) //platform data
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
		})
		console.log('what does arr look like', arr)
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




