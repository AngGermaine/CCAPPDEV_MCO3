const user = require("../schemas/userSchema");
const comment = require("../schemas/commentSchema");
const cafe = require("../schemas/cafeSchema");
const post = require("../schemas/postSchema");

const express = require("express");
const router = express.Router();

// current logged in user
var loggedInUser = "cinnamoroll";
var loggedInUserPfp = "https://i.pinimg.com/736x/96/c6/5d/96c65d40ec3d11eb24b73e0e33b568f7.jpg";
var loggedInUserId = 1001;

function errorFn(err){
    console.log('Error found');
    console.error(err);
}

// for testing retrieval of data
router.get('/', function(req,resp){
    //console.log("logged in user: "+loggedInUser); //to check the currently logged in user 
    const searchQuery = {};
    const searchQueryLoggedInuser = { username: loggedInUser };
    comment.find(searchQuery).lean().then(function(comments){
        cafe.find(searchQuery).lean().then(function(cafes){
            user.find(searchQuery).lean().then(function(users){
                post.find(searchQuery).lean().then(function(posts){
                    
                    cafes.sort((a, b) => b.rating - a.rating);
                    resp.render('main', {
                        layout: 'index',
                        title: 'Home | Coffee Lens',
                        'comments-data': comments,
                        'cafe-data': cafes,
                        'user-data': users, 
                        'post-data': posts,
                        userPfp: loggedInUserPfp,
                        loggedInUserId: loggedInUserId
                    });
                    
                }).catch(errorFn);  // postmodel fn
            }).catch(errorFn);  // usermodel fn
        }).catch(errorFn);      //cafemodel fn
    }).catch(errorFn); // commentmodel fn
});

router.get('/about', function(req,resp){
    resp.render('about',{
        title: 'About | Coffee Lens',
        userPfp: loggedInUserPfp,
        loggedInUserId: loggedInUserId
    });
}); 

router.get('/search', function(req,resp){

    resp.render('search',{
        title: 'Search Results | Coffee Lens',
        userPfp: loggedInUserPfp,
        loggedInUserId: loggedInUserId
    });
}); 


module.exports = router;
