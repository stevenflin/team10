var ig = require('instagram-node').instagram()

console.log("AT:", process.env.AT);
console.log("ID:", process.env.ID);
console.log("INSTAGRAM_CLIENT_ID:", process.env.INSTAGRAM_CLIENT_ID);
console.log("INSTAGRAM_CLIENT_SECRET:", process.env.INSTAGRAM_CLIENT_SECRET);


function instagramInformation(cb){
	var bigArr = [];
	ig.use({ access_token: process.env.AT });
	ig.user_media_recent(process.env.ID, {cursor: 30}, function instagramPages(err, medias, pagination, remaining, limit) {
		console.log("medias", medias)
	 	bigArr = bigArr.concat(medias);
		if(pagination.next) {
		    pagination.next(instagramPages); // Will get second page results 
		    console.log("lkdsa;lkjdsa")
		 } else {
		 	cb(bigArr);
		 	console.log(bigArr.length);
		 }
		
	});

}
instagramInformation(function(bigArr){console.log(bigArr)});

module.exports={
	instagramInformation: instagramInformation
}


