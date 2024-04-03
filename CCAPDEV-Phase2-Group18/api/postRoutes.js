const post = require("../schemas/postSchema");
const user = require("../schemas/userSchema");
const cafe =  require("../schemas/cafeSchema");
const comment =  require("../schemas/commentSchema");
const archive = require("../schemas/archiveSchema");
const express = require("express");
const router = express.Router();

const databaseName = "mco";
const collectionName = "posts";

// current logged in user
var loggedInUser = "cinnamoroll";
var loggedInUserPfp = "https://i.pinimg.com/736x/96/c6/5d/96c65d40ec3d11eb24b73e0e33b568f7.jpg";
var loggedInUserId = 1001;

function errorFn(err){
    console.log('Error found');
    console.error(err);
}

router.get('/view_post', function(req, resp){
    const postId = req.query.postId;

    post.findById(postId).lean().then(function(post) {
        if (post) {
            user.findOne({ userid: post.authorid }).lean().then(function(poster) {
                comment.find({postid: post.postid}).lean().then(function(comments){
                    if(comments){
                        const authorIds = comments.map(comment => comment.authorid);
                        user.find({userid: { $in: authorIds }}).lean().then(function(users){
                            const commentsWithUserInfo = comments.map(comment =>{
                                const author = users.find(user => user.userid === comment.authorid);
                                return{
                                    ...comment,
                                    profpic: author ? author.profpic : null,
                                    username: author ? author.username : null,
                                    isOwner: author ? author.isOwner : false
                                };
                            });
                            var isLoggedIn;
                            if(post.authorid===loggedInUserId){
                                isLoggedIn = true;
                            } else{
                                isLoggedIn = false;
                            }
                            resp.render('view-post', {
                                title: 'View Promo | Coffee Lens',
                                'post-data': post,
                                'user-data' : poster,
                                'comments-data': commentsWithUserInfo,
                                userPfp: loggedInUserPfp,
                                'isLoggedIn': isLoggedIn,
                                loggedInUserId: loggedInUserId
                            });

                        }).catch(errorFn);
                    } else {
                        resp.status(404).send('Comments not found');
                    }
                }).catch(errorFn);
            }).catch(errorFn);
        } else {
            resp.status(404).send('Post not found');
        }
    }).catch(errorFn);
});

router.get('/edit_post', function(req,resp){
    const postId = req.query.postId;
    post.findById(postId).lean().then(function(post){
        if(post){
            user.findOne({ userid: post.authorid }).lean().then(function(poster){
                cafe.find({}).lean().then(function(cafes){
                    resp.render('edit-post',{
                        title: 'Edit Post | Coffee Lens',
                        'post-data': post,
                        'user-data': poster,
                        'cafe-list': cafes,
                        userPfp: loggedInUserPfp,
                        loggedInUserId: loggedInUserId
                    });
                }).catch(errorFn);
            }).catch(errorFn);
        } else{
            resp.status(404).send('Post not found');
        }
    }).catch(errorFn);
    
}); 

function formatDate(date) {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
}

router.get('/post_promo', function(req, resp){
    const searchQuery = {};
    const currentDate = new Date();
    cafe.find(searchQuery).lean().then(function(cafes){
        resp.render('post-promo', {
            title: 'Post A Promo | Coffee Lens',
            'cafe-data': cafes,
            currentDate: currentDate,
            userPfp: loggedInUserPfp,
            loggedInUserId: loggedInUserId
        });
    }).catch(errorFn);
});

router.get('/post_review', function(req, resp){
    const searchQuery = {};
    const currentDate = new Date();
    const formattedDate = formatDate(currentDate);
    cafe.find(searchQuery).lean().then(function(cafes){
        resp.render('post-review', {
            title: 'Post A Review | Coffee Lens',
            'cafe-data': cafes,
            currentDate: formattedDate,
            userPfp: loggedInUserPfp,
            user: loggedInUser,
            loggedInUserId: loggedInUserId
        });
    }).catch(errorFn);
});

// adding review
router.post('/post_review', async function(req, resp){
    const previousPost = await post.findOne().sort({postid: -1}).exec();
    let previousPostId;
    if (previousPost) {
        previousPostId = previousPost.postid + 1;
    } else {
        previousPostId = 3000;
    }

    let image;
    if (req.body.filename.startsWith('http')) {
        image = req.body.filename; 
    } else {
        // If it's a file, read and convert to base64
    }

    const rating = parseInt(req.body.rate);
    const storeid = req.body.cafeid.toString();

    const postInstance = new post({
        authorid: req.body.authorid,
        upvote: 0,
        downvote: 0,
        title: req.body.title,
        description: req.body.review_content,
        image: image,
        isPromo: false,
        storeid: storeid,
        postid: previousPostId,
        rating: rating,
        createdate: req.body.currentDate,
        updatedate: req.body.currentDate,
        dateposted: req.body.currentDate
    });

    postInstance.save().then(function() {
      resp.redirect('/?success=true');
    }).catch(errorFn);
});

router.get("/delete/:postId", async function (req, res) {
    const postId = req.params.postId;
    
    try {
        const deletedPost = await post.findByIdAndDelete(postId);
        if (deletedPost) {
            await archive.create({
                createdate: deletedPost.createdate,
                updatedate: deletedPost.updatedate,
                dateposted: deletedPost.dateposted,
                upvote: deletedPost.upvote,
                downvote: deletedPost.downvote,
                title: deletedPost.title,
                description: deletedPost.description,
                image: deletedPost.image,
                isPromo: deletedPost.isPromo,
                storeid: deletedPost.storeid,
                postid: deletedPost.postid,
                rating: deletedPost.rating
            });
            res.redirect("/");
        } else {
            res.status(404).send('Post not found');
        }
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).send('Error deleting post');
    }
});



router.post('/like_comment', function(req, resp){
    const commentId = req.body.commentId;
    const likeOrDislike = req.body.likeOrDislike;
    const userId = loggedInUserId;
    var commentInstance;
    comment.findById(commentId).lean().then(function(commentToUpdate){
        console.log(commentToUpdate);
        console.log(commentId);
        console.log(likeOrDislike);
        var isLiked = commentToUpdate.likedby.includes(userId);
        var isDisliked = commentToUpdate.dislikedby.includes(userId);
        if (likeOrDislike==='like'){
            if(!isLiked){
                if(isDisliked){
                    var dislikeIndex = commentToUpdate.dislikedby.indexOf(userId);
                    commentToUpdate.dislikedby.splice(dislikeIndex,1);
                    commentToUpdate.downvote = commentToUpdate.downvote-1;
                }
                commentToUpdate.likedby.push(userId);
                commentToUpdate.upvote = Number(commentToUpdate.upvote) +1;
                
                
            }
        } else if (likeOrDislike==='dislike'){
            if(!isDisliked){
                if(isLiked){
                    var likeIndex = commentToUpdate.dislikedby.indexOf(userId);
                    commentToUpdate.likedby.splice(likeIndex,1);
                    commentToUpdate.upvote = commentToUpdate.upvote-1;
                } 
                commentToUpdate.dislikedby.push(userId);
                commentToUpdate.downvote = Number(commentToUpdate.downvote) +1;
                
            }
        }
        commentInstance = new comment(commentToUpdate);
        comment.findByIdAndUpdate(commentId,commentToUpdate, {new:true}).then(function(updatedComment){
            console.log('Updated Successfully');
            console.log(updatedComment);
            resp.send({status: 'success'});
        });
    }).catch(errorFn);
});

module.exports = router;