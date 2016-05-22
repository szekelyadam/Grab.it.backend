var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AdSchema = new Schema({
	title: { type: String, required: true },
	description: { type: String, required: true },
	price: { type: Number, required: true },
	image_url: String,
	city: { id: Number, name: String },
	user_id: { type: String, required: true },
	category: { id: Schema.ObjectId, name: String },
	created: { type: Date, default: Date.now },
	updated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Ad', AdSchema);
