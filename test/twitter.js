var Twitter = require('twitter');


function twitterInformation(req){
	var client = new Twitter({
	  consumer_key: process.env.TWITTER_CONSUMER_KEY,
	  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
	  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
	  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
	});
	var params = {user_id: process.env.TWITTER_ID};
	client.get('statuses/user_timeline', params, function(error, tweets, response) {
	  if (!error) {
	    console.log(tweets);
	  }
	});
}

twitterInformation();

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