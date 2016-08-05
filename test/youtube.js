
const Youtube = require("youtube-api");


// Youtube.authenticate({
//     type: "oauth"
//   , token: process.env.YT_OAUTH
// });

Youtube.authenticate({
	type: "key"
,	key:  'AIzaSyAerkA1yiLo73ly8qv5nIfaR7-d6f5jcfI'
})

Youtube.search.list({
	part: "snippet"
,	channelId: "UC3ZrFUfjAjYvMd1HLTuHN8w"
}, (err, list) => {
	console.log("err", err);

	console.log("list", list);
	console.log("items", list.items);
	// console.log("stats", list.items[0].statistics);
})

// Youtube.videos.list({
// 	part: "statistics",
// 	id: "kBwnermSYDY"
// }, (err, list) => {
// 	console.log('err', err);
// 	console.log("VIDEO LIST", list.items[0].statistics);
// })
// const YT = function(opts) {
// 	switch (opts.type) {
// 		case "key":
// 		Youtube.authenticate({
// 			type: "key"
// 		,	key:  'AIzaSyAerkA1yiLo73ly8qv5nIfaR7-d6f5jcfI'
// 		})
// 	}

// };

// YT.prototype.getAllChannels = function() {
// 	function recurse() {
// 		Youtube.channels.list({
// 			part: "statistics, contentDetails, snippet"
// 		,	id: "UC3ZrFUfjAjYvMd1HLTuHN8w"
// 		}, (err, list) => {
// 			console.log("err", err);

// 			console.log("list", list);
// 			console.log("items", list.items);
// 			console.log("stats", list.items[0].statistics);
// 			recurse();
// 		})
// 	}
// 	return recurse();
// }