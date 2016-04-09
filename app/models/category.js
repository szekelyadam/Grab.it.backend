var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CategorySchema = new Schema({
	name: String,
	parent_id: Schema.ObjectId,
	icon: {
		type: Schema.ObjectId,
		ref: 'Image'
	}
});

module.exports = mongoose.model('Category', CategorySchema);