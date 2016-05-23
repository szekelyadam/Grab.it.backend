var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ImageSchema = new Schema({
    image: Buffer
}, { strict: true });

module.exports = mongoose.model('Image', ImageSchema);
