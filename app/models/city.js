var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CitySchema = new Schema({
	_id: Number,
	countyId: Number,
	zip: Number,
	name: String
});


module.exports = mongoose.model('City', CitySchema);
