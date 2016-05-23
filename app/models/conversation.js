var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ConversationSchema = new Schema({
	sender: {
		_id: String,
		name: String
	},
	receiver: {
		_id: String,
		name: String
	},
	messages: [{
		sender_id: { type: String, required: true },
		receiver_id: { type: String, required: true },
		message: { type: String, required: true }
	}],
	updated: { type: Date, required: true }
});


module.exports = mongoose.model('Conversation', ConversationSchema);
