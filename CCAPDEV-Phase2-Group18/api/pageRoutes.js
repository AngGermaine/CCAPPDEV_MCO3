const user = require("../schemas/userSchema");
const comment = require("../schemas/commentSchema");
const cafe = require("../schemas/cafeSchema");
const post = require("../schemas/postSchema");

const express = require("express");
const passport = require("passport");
const router = express.Router();

// current logged in user
var loggedInUser = "cinnamoroll";
var loggedInUserPfp = "https://i.pinimg.com/736x/96/c6/5d/96c65d40ec3d11eb24b73e0e33b568f7.jpg";
var loggedInUserId = 1001;

function errorFn(err){
    console.log('Error found');
    console.error(err);
}

function calculateAverageRating(posts) {
    let totalRating = 0;
    console.log('Number of posts:', posts.length);
    posts.forEach(post => {
        console.log('Rating of post:', post.rating);
        totalRating += post.rating;
    });
    console.log('Total rating:', totalRating);

    const averageRating = totalRating / posts.length;

    if (isNaN(averageRating)) {
        return 0;
    } else {
        return averageRating;
    }
}

// for testing retrieval of data
router.get('/', function(req, resp) {
    const searchQuery = {};
    const searchQueryLoggedInuser = { username: loggedInUser };
    comment.find(searchQuery).lean().then(function(comments) {
        cafe.find(searchQuery).lean().then(function(cafes) {
            user.find(searchQuery).lean().then(function(users) {
                post.find(searchQuery).lean().then(async function(posts) {
                    for (let i = 0; i < cafes.length; i++) {
                        const cafePosts = posts.filter(post => post.storeid === cafes[i].cafeid.toString() && !post.isPromo);
                        const averageRating = calculateAverageRating(cafePosts);
                        cafes[i].rating = averageRating;

                        const updateResult = await cafe.updateOne({ cafeid: cafes[i].cafeid }, { rating: averageRating }).exec();
                    }

                    // Sort cafes by descending order of rating
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

                }).catch(errorFn); // postmodel fn
            }).catch(errorFn); // usermodel fn
        }).catch(errorFn); //cafemodel fn
    }).catch(errorFn); // commentmodel fn
});

router.get('/about', function(req,resp){
    resp.render('about',{
        title: 'About | Coffee Lens',
        userPfp: loggedInUserPfp,
        loggedInUserId: loggedInUserId
    });
}); 

router.get('/search', async (req, resp) => {
    try {
        const searchQuery = req.query.query;
        // console.log('Search Query:', searchQuery); for checking if nakukuha nya ung input ng search bar
        
        if (!searchQuery) {
            // If search query is empty, render the search page without querying MongoDB
            return resp.render('search', { results: [] });
        }

        const results = await cafe.find({ cafename: { $regex: new RegExp(searchQuery, 'i') } }); 
        resp.render('search', { results });
    } catch (error) {
        console.error(error);
        resp.status(500).send('Internal Server Error');
    }
}); 



module.exports = router;
