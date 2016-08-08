var router = require('express').Router();
var passport = require('passport');
var FB = require('fb');
var vine = require('../update/vine.js');
var instagram = require('../update/ig.js');
var models = require('../models/models')
var Profile = models.Profile;
var ProfileSnapshot = models.ProfileSnapshot;
var Post = models.Post;
var PostSnapshot = models.PostSnapshot;

var socialFunctions = require('../social');
var getYoutubeData = socialFunctions.getYoutubeData;
var getDay = socialFunctions.getDay;
var getWeek = socialFunctions.getWeek;
var getMonth = socialFunctions.getMonth;
var getYear = socialFunctions.getYear;

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





router.get('/update/instagram', function(req, res, next){
	instagram.instagramInformation(process.env.ID, process.env.AT)
	.then(function(data) {
		Profile.findOne({userId: req.user._id}, function(err, profile){
			if(err)return next( err)
				// console.log('instagramprofile id',req.user.instagram.instagramProfile.id);
				// console.log('WHAT IS MY TYPE', typeof req.user.instagram.instagramProfile.id)
			new ProfileSnapshot({
				platformID: req.user.instagram.instagramProfile.id,
				platform: 'instagram', 
				followers: JSON.parse(req.user.instagram.instagramProfile._raw).data.counts.followed_by, 
				posts: JSON.parse(req.user.instagram.instagramProfile._raw).data.counts.media,
				date: new Date(),
				profileId: profile._id
			})
			.save(function(err, p){
				if(err) return next(err);


			 	console.log(data.length);

				data.forEach(function(post, i){
					var desc = null;
					if(post.caption){
						desc = post.caption.text
					}
					Post.findOrCreate({postId: post.id}, {
						description: desc,
						postId: post.id,
						type: 'instagram',
						profileId: profile._id
					}, function(err, postData){
						if(err) return next(err);
						console.log("creating post for:", post.id);

						new PostSnapshot({
							profileId: p._id, 
							postId: postData.id,
							comments: post.comments.count,
							likes: post.likes.count,
							date: p.date
						})
						.save(function(err, psnap){
							if(err) return next(err);

							console.log("creating post snapshots for:", post.id);
							postData.snapshots.push(psnap._id);
							postData.save(function(err){
								if(err) return next(err);
								if(i === data.length -1){
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




router.get('/update/youtube', (req, res, next) => {
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
    // console.log('[ALL VIDEOS]', data.videos);
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
