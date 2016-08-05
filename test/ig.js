var ig = require('instagram-node').instagram()
console.log("AT:", process.env.AT);
console.log("ID:", process.env.ID);
console.log("INSTAGRAM_CLIENT_ID:", process.env.INSTAGRAM_CLIENT_ID);
console.log("INSTAGRAM_CLIENT_SECRET:", process.env.INSTAGRAM_CLIENT_SECRET);
ig.use({ access_token: '440696783.81b5f2a.5695d0ac66d64e74ad13a5247ea31176' });
var bigArr = [];
function instagramInformation(req){
    ig.user_media_recent('440696783', function(err, medias, pagination, remaining, limit) {
        console.log("medias", medias.length);
        bigArr = bigArr.concat(medias);

        if(pagination.next) {
            pagination.next(instagramInformation); // Will get second page results 
         } else {
            console.log(bigArr.length);
         }
        console.log("pagination", pagination);
    });
}
instagramInformation();