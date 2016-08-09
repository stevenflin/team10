var Vineapple = require('vineapple');

function vineInformation(username, password){
	return new Promise(function(resolve, reject){
		var vine = new Vineapple();
		var user1;
		// Authenticate the Vine user
		vine.login(process.env.VINE_USERNAME, process.env.VINE_PASSWORD, function (error, client) {
			// console.log("login error", error);
		    // Make an API request
		    client.me(function (error, user) {
		        // Handle failure
		        if (error) {
		            throw new Error(error);
		         }
		        // Handle success
		        // console.log(user)
		        resolve(user);
		    });

		});
	})
}
// vineInformation();


module.exports={
	vineInformation: vineInformation
}