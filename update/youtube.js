const Youtube = require("youtube-api");

var minutes = 1000 * 60;
var hours = minutes * 60;
var days = hours * 24;
var years = days * 365;

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
					Youtube.search.list({ part: "snippet", channelId: channelId, maxResults: 1, order: 'date', pageToken: pageToken}, (err, list) => {
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

// getYoutubeData('UC3ZrFUfjAjYvMd1HLTuHN8w').then((data) => {
// 	console.log("[youtube] data:", data);
// 	console.log("[youtube] # of videos:", data.videos.length);
// });

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
  getYoutubeData: getYoutubeData,
  getDay: getDay,
  getWeek: getWeek,
  getMonth: getMonth,
  getYear: getYear
}