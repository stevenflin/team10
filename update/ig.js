var ig = require('instagram-node').instagram()




function instagramInformation(id, accessToken){
	return new Promise(function(resolve, reject){
		var bigArr = [];
		var instagramPages = function (err, medias, pagination, remaining, limit) {
			// console.log("medias", medias)
		 	bigArr = bigArr.concat(medias);
			if(pagination.next) {
			    pagination.next(instagramPages); // Will get second page results 
			  } else {
			 	ig.user(id, function(err, result, remaining, limit) {
			 		if(err) return next(err);
			 			resolve({bigArr, profile: result.counts.followed_by})
			 	});
			  }
			}
			
		ig.use({ access_token: accessToken });
		ig.user_media_recent(id, {cursor: 30}, instagramPages);
	})
}
// instagramInformation(process.env.ID, process.env.AT).then(function(data){console.log("bigArr", data)});

module.exports={
	instagramInformation: instagramInformation
}
