var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AdSchema = new Schema({
	title: String,
	created: { type: Date, default: Date.now },
	updated: { type: Date, default: Date.now },
	price: Number,
	_locationId: Schema.type.ObjectId,
	_ownerId: Schema.type.ObjectId,
	description: String 
});

module.exports = mongoose.model('Ad', AdSchema);
