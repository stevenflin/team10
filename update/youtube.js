const Youtube = require("youtube-api");
var models = require('../models/models');
var User = models.User;
var Profile = models.Profile;
var ProfileSnapshot = models.ProfileSnapshot;
var Post = models.Post;
var PostSnapshot = models.PostSnapshot;

Youtube.authenticate({
  type: "key"
, key: process.env.API_KEY
})

// getYoutubeData
// function to get youtube channel/video data
// 
// @param: channelId: Id of the channel to grab all the video data from
// @return: _<Promise>: promise that resolves to youtube data
function getYoutubeData(channelId) {
	return new Promise(function(masterResolve, masterReject) {

		// Get channel stats
		Youtube.channels.list({ part: "statistics" , id: channelId }, (err, list) => {
			if (err) return masterReject(err);
			var channelStats = list.items[0].statistics;

			new Promise(function(interResolve, interReject) {

				// arr to hold all the videos
				var videoArr = [];

				// recurseSearch(pageToken)
				// 
				// recursively call a search as long is there is a pageToken
				// 
				function recurseSearch(pageToken) {

					// Get channel videos
					Youtube.search.list({ part: "snippet", channelId: channelId, maxResults: 50, order: 'date', pageToken: pageToken}, (err, list) => {
						// console.log('[NEW LIST]', list.items);
						if (err) return masterReject(err);

						// console.log("[search results for]", pageToken);

						// Filter for videos
						list.items = list.items.filter(function(item) {
							return item.id.kind === 'youtube#video'
						});

						// console.log("[search results]", list.items);

						// join together the list of videos
						videoArr = videoArr.concat(list.items);

						if (list.nextPageToken) {
							recurseSearch(list.nextPageToken);
						} else {
							interResolve(videoArr);
						}
						
					});

				}

				// start off the search
				recurseSearch();
			})
			.then((videoArr) => {

				// Turn items into promises
				videoArr = videoArr.map(function(video, i) {
					return new Promise(function(resolve, reject) {

						Youtube.videos.list({part: 'snippet, statistics, id', id: video.id.videoId}, (err, video) => {
							if (err) return reject(err);

							var id = video.items[0].id;
							var stats = video.items[0].statistics;
							var snippet = video.items[0].snippet

							resolve({
								id: id,
								snippet: snippet,
								stats: stats
							});
						});
					});
				});

				// get all data
				console.log("[exiting function]");
				Promise
				.all(videoArr)
				.then((results) => {
					// console.log({channel: channelStats, videos: results})
					// return {channel: channelStats, videos: results}
					masterResolve({channel: channelStats, videos: results});
				})
				.catch(masterReject);
			})
		})
	});
}

function youtubeUpdate(user, twentyMinUpdate) {
	return new Promise(function(resolve, reject) {
		getYoutubeData(user.youtube.profile.id)
		.then(function(data) {
			Profile.findOne({userId: user._id},function(err, profile) {
				if (err) return next(err);
				if (!twentyMinUpdate) {
					new ProfileSnapshot({
						platformID: user.youtube.profile.id,
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
								profileId: profile._id,
								date: new Date(video.snippet.publishedAt).getTime()
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
										resolve();
									});
								});
							});
						});
					});
				} else {
					profile.youtube.followers = data.channel.subscriberCount;
					profile.save();
					data.videos.forEach(function(video, i) {
						Post.findOrCreate({postId: video.id}, {
							postId: video.id,
							title: video.snippet.title,
							description: video.snippet.description,
							type: 'youtube',
							profileId: profile._id,
							date: new Date(video.snippet.publishedAt).getTime()
						}, function(err, post) {
							if (err) return console.log(err);

							post.comments = parseInt(video.stats.commentCount);
							post.likes = parseInt(video.stats.likeCount);
							post.favorites = parseInt(video.stats.favoriteCount);
							post.views = parseInt(video.stats.viewCount);
							post.dislikes = parseInt(video.stats.dislikeCount);

							post.save(function(err, p) {
								if (err) return console.log(err);
								resolve();
							})
						})
					})
				}
			});
		}).catch((err) => next(err));
	})
}

function getDay(videos) {
  var todayVids = [];
  for (var i = videos.length - 1; i >= 0; i--) {

	// video upload time
	var video = videos[i]
	var time = new Date(videos[i].snippet.publishedAt).getTime();

	// one day ago time
	var dayAgo = Date.now() - (days);
	// console.log('IS THIS THE TIME FROM ONE WEEK AGO?', new Date(weekAgo))
	// console.log('IS THIS THE TIME FROM ONE DAY AGO?', new Date(dayAgo))
	// console.log('TODAY\'S DATE', new Date())
	if (time > dayAgo) {
	  todayVids.push(video);
	  // console.log('[DAY VIDEOS]', video);
	}
  }
  console.log('[DAY VIDEOS]', todayVids);
  return todayVids;
}

function getWeek(videos) {
  // console.log('AM I HERE')
  var weekVids = [];
  for (var i = videos.length - 1; i >= 0; i--) {
	// console.log('AM I HERE')
	// video upload time
	var video = videos[i]
	var time = new Date(videos[i].snippet.publishedAt).getTime();

	// one week ago time
	var weekAgo = Date.now() - (days * 7);
	// console.log('VIDEO PUBLISHED AT', time)
	// console.log('ONE WEEK AGO WAS', weekAgo)
	if (time > weekAgo) {
	  // console.log('AM I HERE')
	  weekVids.push(video);
	  // console.log('[WEEK VIDEOS]', video);
	} else {
	  // console.log('AM I HERE')
	  // break;
	}
  }
  // console.log('[WEEK VIDEOS]', weekVids);
  return weekVids;
}

function getMonth(videos) {
  var monthVids = [];
  for (var i = videos.length - 1; i >= 0; i--) {

	// video upload time
	var video = videos[i]
	var time = new Date(videos[i].snippet.publishedAt).getTime();

	// one month ago time
	var monthAgo = Date.now() - (days * 30);
	if (time > monthAgo) {
	  monthVids.push(video);
	  // console.log('[MONTH VIDEOS]', video);
	} else {
	  break;
	}
  }
  // console.log('[MONTH VIDEOS]', monthVids);
  return monthVids;
}

function getYear(videos) {
  var yearVids = [];
  for (var i = videos.length - 1; i >= 0; i--) {

	// video upload time
	var video = videos[i]
	var time = new Date(videos[i].snippet.publishedAt).getTime();

	// one year ago time
	var yearAgo = Date.now() - (years);
	if (time > yearAgo) {
	  yearVids.push(video);
	  // console.log('[YEAR VIDEOS]', video);
	} else {
	  break;
	}
  }
  // console.log('[YEAR VIDEOS]', yearVids);
  return yearVids;
}

module.exports = {
  youtubeUpdate: youtubeUpdate,
}