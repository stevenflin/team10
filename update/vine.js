var Vineapple = require('vineapple');

function vineInformation(){
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
	        console.log("user", user);
	    });

	});

	vine.me(function(err, user){
		// console.log("vineapple error", err);
		console.log("vineapple user", user);

	})
}
vineInformation();


module.exports={
	vineInformation: vineInformation
}