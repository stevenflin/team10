var twilio = require('twilio');
 


 
function triggerMeTimbers(){
	return new Promise(function(resolve, reject){
	var client = new twilio.RestClient(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
		client.sms.messages.create({
		    to:'+19703710485',
		    from:process.env.TWILIO_NUMBER,
		    body:`Jake Paul: Update your shit or you're out of team10`
		}, function(error, message) {
		    if (!error) {
		        console.log('Success!');
		        console.log('Message sent on:');
		        console.log(message.dateCreated);
		        resolve()
		    } else {
		        console.log('Oops! There was an error.');
		        reject(error);
		    }
		});
	})
}
// triggerMeTimbers()

module.exports = {
	triggerMeTimbers: triggerMeTimbers
}