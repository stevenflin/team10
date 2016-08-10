var Vineapple = require('vineapple');

function vineInformation(username, password){
	return new Promise(function(resolve, reject){
		var vineArr = [];
		var vine = new Vineapple();
		var user1;
		// Authenticate the Vine user
		vine.login(username, password, function (error, client) {
			// console.log("login error", error);
		    // Make an API request
		    client.me(function (error, user) {
		        // Handle failure
		        var userId = user.userId;
		        if (error) {
		            throw new Error(error);
		         }

		         function getVideos(page) {
		         	client.user(userId, {page:page, size:20}, function(error, data){
			         	if (error) return reject(error);
			         		// console.log("actual fucking data", data)
			         		// console.log("data", data.records[0].likes);
		         		resolve({user, data});

			        })
		         }

		         getVideos(1)
		        
		    });

		});
	})
	// .then((results) => console.log(results.data.records[0].likes))
}
vineInformation();


module.exports={
	vineInformation: vineInformation
}