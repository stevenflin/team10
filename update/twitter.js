var Twitter = require('twitter');


function twitterInformation(accessToken, accessTokenSecret, id){
	return new Promise(function(resolve, reject){
		var client = new Twitter({
		  consumer_key: process.env.TWITTER_CONSUMER_KEY,
		  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
		  access_token_key: accessToken,
		  access_token_secret: accessTokenSecret
		});
		var params = {user_id: id};
		client.get('statuses/user_timeline', params, function(error, tweets, response) {

		  if (error) return next(error); 
		  // console.log("tweets", tweets)
		  	resolve(tweets)
		});
	});		
}

// twitterInformation(console.log("fuck"));

// }

// client.get('favorites/list', function(error, tweets, response) {
//   if(error) throw error;
//   console.log(tweets);  // The favorites. 
//   // console.log(response);  // Raw response object. 
// });
// client.get('search/tweets', {q: 'node.js'}, function(error, tweets, response) {
//    console.log(tweets);
// });

// client.get('search/tweets', function(error, tweets, response) {
//   if(error) throw error;
//   console.log(tweets);  // The favorites. 
  // console.log(response);  // Raw response object. 
// });
// client.post('statuses/update', {status: 'I am a tweet'}, function(error, tweet, response) {
//   if (!error) {
//     console.log(tweet);
//   }
// });
// client.get('', function(error, tweet, response){
// 	if(!error){
// 		console.log(tweet);
// 	}
// })
module.exports = {
	twitterInformation: twitterInformation
}