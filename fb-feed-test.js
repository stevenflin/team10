var FB = require('fb');
function time(days){
  var until = Math.floor(Date.now() / 1000); //datenow
  var since = until - days*24*60*60;
  return {until: until, since: since}
}
	var timeframe = time(3);

function pagePostEverything(days, pageId){
	var timeframe = time(days);
	return new Promise(function(resolve, reject){
		FB.api(
			  "/"+pageId+"/posts?,fields=message,shares,likes.summary(true),comments.summary(true)",
			   //handles pagination by time
			  {
			      "period": "days_28"
			  },
			  function (response) {
			  	console.log("COOL",response)
			  })
			    
		
	})
};