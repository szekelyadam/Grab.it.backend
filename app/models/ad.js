var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Image = require('./image.js');

var AdSchema = new Schema({
	title: String,
	description: String,
	price: Number,
	images: [Image],
	city_id: Number,
	user_id: Schema.ObjectId,
	category_id: Schema.ObjectId,
	created: { type: Date, default: Date.now },
	updated: { type: Date, default: Date.now } 
});

module.exports = mongoose.model('Ad', AdSchema);
