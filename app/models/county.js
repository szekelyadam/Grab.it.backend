var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CountySchema = new Schema({
	_id: Number,
	name: String
});

module.exports = mongoose.model('County', CountySchema);