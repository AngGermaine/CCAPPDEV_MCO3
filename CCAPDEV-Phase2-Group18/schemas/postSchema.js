const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    authorid: {type: Number},
    createdate: {type: Date, default: Date.now},
    updatedate: {type: Date, default: Date.now},
    dateposted: {type: Date, default: Date.now},
    upvote: { type: Number, default: 0}, 
    downvote: {type: Number, default: 0},
    title: {type: String},
    description: {type: String},
    image: {type: String},
    isPromo: {type: Boolean},
    storeid: {type: Number},
    postid: {type: Number},
    rating: {type: Number}
 },{ versionKey: false });

const postModel = mongoose.model('post',postSchema);
module.exports = mongoose.models.post || post; 