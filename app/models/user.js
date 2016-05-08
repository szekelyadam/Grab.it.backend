var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Ad = require('./ad.js');

var UserSchema = new Schema({
	_id: String,
	name: { first: String, last: String },
	email: String,
	phone: String,
	saved_ads: [Ad],
	image_url: String
});

module.exports = mongoose.model('User', UserSchema);
