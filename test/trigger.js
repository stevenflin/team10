var twilio = require('twilio');

function sendMessage(triggerMessage){
	return new Promise(function(resolve, reject){
	var client = new twilio.RestClient(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
		client.sms.messages.create({
		    to:'+18137657071',
		    from:process.env.TWILIO_NUMBER,
		    body: triggerMessage
		}, function(error, message) {
		    if (!error) {
		        console.log('Success!');
		        console.log('Message sent on:' + message.dateCreated);
		        resolve()
		    } else {
		        console.log('Oops! There was an error sending the message your highness.', error);
		        reject(error);
		    }
		});
	})
}
// triggerMeTimbers()

module.exports = {
	sendMessage: sendMessage
}