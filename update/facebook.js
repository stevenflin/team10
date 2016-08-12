var FB = require('fb');
var models = require('../models/models');
var User = models.User;
var Profile = models.Profile;
var ProfileSnapshot = models.ProfileSnapshot;
var Post = models.Post;
var PostSnapshot = models.PostSnapshot;


function pageViewsTotal(days, pageId){
	var timeframe = time(days);
	return new Promise(function(resolve, reject){
		FB.api('/'+pageId+'/insights/page_views_total?since='+timeframe.since+'&until='+timeframe.until, 
			function (response) {
			  if(!response || response.error) {
			   // console.log(!response ? 'error occurred' : response.error);
			   reject(error);
			  }
			  // console.log("PAGE VIEWS TOTAL",response.data[2].values)
			  resolve (response.data[2].values); //get's 28 day values
		})
	})
}
	//GETS PAGE IMPRESSIONS OVER 1 MONTH, PERIOD (**, week, day) 
	//~~~~~~~~~~~~~~FUNCTION TO GET TIME IN UNIX BY NUMBER OF DAYS
function time(days){
  var until = Math.floor(Date.now() / 1000); //datenow
  var since = until - days*24*60*60;
  return {until: until, since: since}
}

// ~~~~~~~~~~~~~~FUNCTION TO GET IMPRESSIONS PER DAY FOR XX DAYS
function pageImpressions(days, pageId){
	var timeframe = time(days);
	return new Promise(function(resolve, reject){
		FB.api(
			  "/"+pageId+"/insights/page_impressions?since="+timeframe.since+"&until="+timeframe.until, //handles pagination by time

			  function (response) {
			  	// console.log("COOL",response)
			    var arr = [];
			    if (response && !response.error) {
			      response.data[0].values.forEach(function(day){
			        arr.push({value: day.value, end_time: day.end_time}) 
			      })
			    }
			    // console.log("arrarrarr",arr)
			    resolve(arr);
			  }
		)
	})
};
function pagePosts(days, pageId){
	var timeframe = time(days);
	return new Promise(function(resolve, reject){
		FB.api(
			  "/"+pageId+"/posts?since="+timeframe.since+"&until="+timeframe.until+"&fields=message,created_time,shares,likes.summary(true),comments.summary(true)",
			   //handles pagination by time
			  function (response) {
			  	var arr = [];
			  	var index= 0;
			  	console.log("COOL SHIT", response.data);
			  	var data = response.data.map(function(post){
			  		return {postId: post.id, message: post.message, shares: (post.shares) ? post.shares.count : 0, date: new Date(post.created_time).getTime(),
			  				likes: (post.likes)? post.likes.data.length : 0, comments: (post.comments)? post.comments.data.length : 0}
			  	})
			  	// if(response && !response.error){
			  	// 	response.data.forEach(function(post){
			  	// 	if(post.id)
			  	// 		arr.push({postId: post.id || "otherValue", message: post.message, shares:post.shares.data.length, 
			  	// 			likes: post.likes.data.length, comments:post.comments.data.length})
			  	// 		index++
			  	// 	}) 
			  	// }
			  	console.log("123123123123", arr)
			  	resolve(data)
			  })
		
	})
};
// ~~~~~~~~~~~~~~FUNCTION TO GET NUMBER OF IMPRESSIONS THAT CAME FROM ALL YOUR POSTS
function pagePostImpressions(days, pageId){
	return new Promise(function(resolve, reject){
		var timeframe = time(days);
		FB.api(
		  "/"+pageId+"/insights/page_posts_impressions?since="+timeframe.since+"&&+until="+timeframe.until, //handles pagination by time
		  
		  function (response) {
		    var arr = [];
		    if (response && !response.error) {
		      response.data[0].values.forEach(function(day){
		        arr.push({value: day.value, end_time: day.end_time}) 
		      })
		      /* handle the result */ 
		    }resolve(arr);
		 })
	});
};



// //~~~~~~~~~~~~~~FUNCTION TO GET LIKES/COMMENTS/SHARES PER DAY FOR PAST 28 DAYS

// postArr.forEach(function(post){FB.api( //might have to use post id and not blog id
//       "/"+post.postId+"/insights/post_stories", //The number of stories generated about your Page post ('Stories')
//       function (response) {
//         if (response && !response.error) {
//           /* handle the result */
//           storiesArr.push({time: post.time, stories: response.data[0].values[0].value})

//           console.log("post_stories",response.data[0].values)
           
//         }
//       }
//   );
// })
// console.log("yo",storiesArr); //asynchronous
function postImpressions(days, postId){
	var timeframe = time(days);
	FB.api( //might have to use post id and not blog id
	      "/"+postId+"/insights/post_impressions?since="+timeframe.since+"&until="+timeframe.until, //The number of impressions per post
	      //MAP OR PUSH TO AN ARRAY 
	      function (response) {
	        if (response && !response.error) {
	          /* handle the result */
	          console.log("post_impressions",response)
	        }
	      }
	);
}
// FB.api( //might have to use post id and not blog id
//       "/1688425971402749/insights/post_video_views", //The number of impressions per post
//       function (response) {
//         if (response && !response.error) {
//           /* handle the result */
//           console.log("post_impressions",response)
//         }
//       }
//   );
// FB.api( //might have to use post id and not blog id
//       "/1688425971402749/insights/post_engaged_users", //The number of impressions per post
//       function (response) {
//         if (response && !response.error) {
//           /* handle the result */
//           console.log("post_impressions",response)
//         }
//       }
//   );
// FB.api(
//       "/1688425971402749/insights/post_storytellers_by_country", //The number of stories generated about your Page post ('Stories')
//       {
//           "period": "days_28"
//       },
//       function (response) {
//         if (response && !response.error) {
//           /* handle the result */
//           console.log("post_storytellers_by_country",response)
//         }
//       }
//   );
// FB.api(
//       "/1688425971402749/insights/post_storytellers_by_city", //The number of People Talking About the Page by user city
//       {
//           "period": "days_28"
//       },
//       function (response) {
//         if (response && !response.error) {
//           /* handle the result */
//           console.log("post_storytellers_by_city",response)
//         }
//       }
//   );

// FB.api(
//       "/1688425971402749/insights/post_storytellers_by_gender", //The number of People Talking About the Page by user age and gender

//       {
//           "period": "days_28"
//       },
//       function (response) {
//         if (response && !response.error) {
//           /* handle the result */
//           console.log("post_storytellers_by_gender",response)
//         }
//       }
//   );
function pageFanAdds(days, pageId){
	FB.api(
      "/"+pageId+"/insights/page_fan_adds?since="+timeframe.since+"&until="+timeframe.until, //The number of People Talking About the Page by user age and gender
      function (response) {
        if (response && !response.error) {
          /* handle the result */
          resolve(response)
        }
      }
  	);
}
//~~~~~~~~~~~~~~~~~~~~~ page_fans
function pageFans(days, pageId){
	var timeframe = time(days);
	return new Promise(function(resolve, reject){
		FB.api(
	      "/"+pageId+"/insights/page_fans?"+timeframe.since+"&until="+timeframe.until, //The number of People Talking About the Page by user age and gender
	      function (response) {
	        if (response && !response.error) {
	          /* handle the result */
	          var numLikes = response.data[0].values[response.data[0].values.length-1].value
	          // console.log("yomane", numLikes)
	          resolve(numLikes);
	        }
	        else{ 

	        }
	      }
	 	);
	 })
}
// // PAGE LIKES
// //https://graph.facebook.com/{{pagename}}/insights/page_views?access_token={{access_token_key}}&since=1420070400&until=1421625600 (UNIX TIME)

// FB.api(
//     "/{page-id}/likes",
//     function (response) {
//       if (response && !response.error) {
//         /* handle the result */
//       }
//     }
// );
// }


function facebookUpdate(user, twentyMinUpdate) {
	return new Promise(function(resolve, reject) {
		Profile.findOne({userId: user._id}, function(err, profile) {
			FB.setAccessToken(user.facebook.token)
			if(err) return next(err)
			var test = time(3);
			var pageId = user.facebook.pages[0].pageId;
			var functions= [ 
				pageImpressions(92, pageId),
				pageViewsTotal(92, pageId), //fix- currently only had last 3 days
				pagePostImpressions(92, pageId), 
				pagePosts(92, pageId), //
				pageFans(92, pageId) //fix-undefiened
			]

			// console.log("FACEBOOK ID ", user.facebook.pages[0].pageId)

			Promise
			.all([functions[0], functions[1], functions[2], functions[3], functions[4]])
			.then((result) => { // create profile and profile snapshot here
				// console.log("$$0")

				try {
					if (!twentyMinUpdate) {
						new ProfileSnapshot({
							platformId: user.facebook.id,
							platform: 'facebook',
							followers: result[4],
							views: result[0][result[0].length-1].value,
							posts: result[3].length,
							date: new Date(),
							profileId: profile._id
						})
						.save(function(err, p) {

							console.log('$$1')
							if(err) return next(err);

							result[3].forEach(function(post, i) {

								Post.findOrCreate({postId: post.postId}, {
									description: post.message,
									postId: post.postId,
									type: 'facebook',
									date: post.date,
									profileId: profile._id
								}, function(err, postData) {
									if(err) return next(err);

									// console.log("asdf;sdfksdlfasdfsdfsdfsdfsdfsdfsdfsdfsdfsdf:", postData);

									// snapshot it
									new PostSnapshot({
										profileId: p._id, 
										postId: postData.postId,
										comments: post.comments,
										likes: post.likes,
										shares: post.shares,
										date: p.date
									})
									.save(function(err, psnap) {

										// console.log('$$3')
										if(err) return next(err);

										postData.snapshots.push(psnap._id);
										postData.save(function(err) {
											if(err) return next(err);
											resolve();		
										})				
									})
								})
							})	
						})
					} else {
						profile.facebook.followers = result[4];
						profile.save();
						result[3].forEach(function(post, i) {

							Post.findOrCreate({postId: post.postId}, {
								description: post.message,
								postId: post.postId,
								type: 'facebook',
								date: post.date,
								profileId: profile._id
							}, function(err, postData) {
								if (err) return console.log(err);

								postData.comments = post.comments;
								postData.likes = post.likes;
								postData.shares = post.shares;

								postData.save(function(err, p) {
									if (err) return console.log(err);
									resolve();
								})
							})
						})
					}
				}
				catch (error) {
					console.log(error);
				}
			}).catch((err) => console.log(err))
		})
	})
}

module.exports = {
  time: time,
  pageImpressions: pageImpressions,
  pageViewsTotal: pageViewsTotal,
  pagePostImpressions: pagePostImpressions,
  pagePosts: pagePosts,
  pageFans: pageFans,
  pageFanAdds: pageFanAdds,
  facebookUpdate: facebookUpdate

}
//make function for rendering page names by id, and then adding that page to the dashboard by id