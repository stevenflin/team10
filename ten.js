// setInterval(function(){$.ajax({xhrFields:{withCredentials:true}, url:"http://localhost:3000/update"})}, 1000*60)
var request = require('request');


// the one that happens every 20 mins
request.get(`http://localhost:${process.env.PORT}/updateFrequent`, function(err, resp, body) {
	if (err) {
		console.log("lmao");
		throw new Error(err)
	}
	console.log("nice job boyo")
})