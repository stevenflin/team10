var ig = require('instagram-node').instagram()

console.log("AT:", process.env.AT);
console.log("ID:", process.env.ID);
console.log("INSTAGRAM_CLIENT_ID:", process.env.INSTAGRAM_CLIENT_ID);
console.log("INSTAGRAM_CLIENT_SECRET:", process.env.INSTAGRAM_CLIENT_SECRET);


function instagramInformation(id, accessToken){
	return new Promise(function(resolve, reject){
		var bigArr = [];
		var instagramPages = function (err, medias, pagination, remaining, limit) {
			// console.log("medias", medias)
		 	bigArr = bigArr.concat(medias);
			if(pagination.next) {
			    pagination.next(instagramPages); // Will get second page results 
			 } else {
			 	resolve(bigArr);
			 	console.log(bigArr.length);
			 }
			}
			
		ig.use({ access_token: process.env.AT });
		ig.user_media_recent(process.env.ID, {cursor: 30}, instagramPages);

	})


}
// instagramInformation(process.env.ID, process.env.AT).then(function(data){console.log("bigArr", data)});

module.exports={
	instagramInformation: instagramInformation
}
