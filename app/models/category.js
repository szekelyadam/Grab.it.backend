var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CategorySchema = new Schema({
	name: { type: String, required: true, unique: true },
	parent_id: Schema.ObjectId,
	icon: String
});

module.exports = mongoose.model('Category', CategorySchema);
