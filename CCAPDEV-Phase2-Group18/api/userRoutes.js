const user = require("../schemas/userSchema");
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

router.get('/create_acc', function(req,resp){
    resp.render('create-acc',{
        title: 'Register | Coffee Lens'
    });
}); 

router.get('/edit_profile', function(req,resp){
    const userId = req.query.userId;
    user.findOne({userid: userId}).lean().then(function(user){
        console.log(user);
        resp.render('edit-profile',{
            title: 'Edit Profile | Coffee Lens',
            'user-data': user,
            'userPfp': loggedInUserPfp,
            loggedInUserId: loggedInUserId
        });
    }).catch(errorFn);
}); 

router.get('/view_profile', function(req,resp){
    let userId = req.query.userId;

    user.findOne({userid: userId}).lean().then(function(profile){
        post.find({authorid: userId}).lean().then(function(posts){
            var isLoggedIn
            if(loggedInUserId === profile.userid){
                isLoggedIn = true;
            } else{
                isLoggedIn = false;
            }
            resp.render('view-profile',{
                title: 'Profile | Coffee Lens',
                'posts': posts,
                'user-data': profile,
                userPfp: loggedInUserPfp,
                'isLoggedIn': isLoggedIn,
                loggedInUserId: loggedInUserId
            });
            
        }).catch(errorFn);
    }).catch(errorFn);
}); 

module.exports = router;