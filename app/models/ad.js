var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ImageSchema = require('./image.js').schema;

var AdSchema = new Schema({
	title: { type: String, required: true },
	description: { type: String, required: true },
	price: { type: Number, required: true },
	images: [ImageSchema],
	city_id: { type: Number, required: true },
	user_id: { type: Schema.ObjectId, required: true },
	category_id: { type: Schema.ObjectId, required: true },
	created: { type: Date, default: Date.now },
	updated: { type: Date, default: Date.now } 
});

module.exports = mongoose.model('Ad', AdSchema);
