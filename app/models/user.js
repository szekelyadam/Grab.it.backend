var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Ad = require('./ad.js');

var UserSchema = new Schema({
	name: { first: String, last: String },
	email: String,
	phone: String,
	address: {
		city: String,
		address: String,
		zip: Number
	},
	saved_ads: [Ad],
	image: {
		type: Schema.ObjectId,
		ref: 'Image'	
	}
});

module.exports = mongoose.model('User', UserSchema);