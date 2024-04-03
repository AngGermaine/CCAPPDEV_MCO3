const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    upvote: { type: Number }, 
    downvote: {type: Number},
    content: {type: String},
    authorid: {type: Number}, 
    dateposted: {type: String},
    postid: {type: Number},
    likedby: [Number]
},{ versionKey: false });

const commentModel = mongoose.model('comment',commentSchema, 'comments');
module.exports = commentModel; 