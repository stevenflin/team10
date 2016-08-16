// setInterval(function(){$.ajax({xhrFields:{withCredentials:true}, url:"http://localhost:3000/update"})}, 1000*60)
var request = require('request');

// this also happens every 20 but doesn't do anything when it gets to the server lol
request.get(process.env.HOST +`${process.env.PORT}/update/trigger`, function(err, resp, body) {
	if (err) {
		console.log("lmao you suck")
	}

	console.log("nice job")
})