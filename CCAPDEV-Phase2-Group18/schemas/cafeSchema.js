const mongoose = require('mongoose');

const cafeSchema = new mongoose.Schema({
    cafeid: {type: Number}, 
    cafename: {type: String},
    ownerid: {type: Number}, 
    logo: {type: String},
    rating: {type: Number},
    cafedesc: {type: String}
 },{ versionKey: false });

 const cafeModel = mongoose.model('store',cafeSchema);
 module.exports = mongoose.models.store || store; 