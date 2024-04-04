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

router.get('/', function(req, resp) {
    if(req.session.loggedInUserId == undefined) {
        resp.redirect('/login');
        return;
    }
    const searchQuery = {};
    const searchQueryLoggedInuser = { username: loggedInUser };
    
    // Fetch the currently logged in user
    user.findOne({ userid: req.session.loggedInUserId }).lean().then(function(loggedInUser) {
        if (!loggedInUser) {
            resp.redirect('/login');
            return;
        }
        // Check if the logged-in user is an owner
        const isOwner = loggedInUser.isOwner || false;

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
                            userPfp: req.session.loggedInUserPfp,
                            loggedInUserId: req.session.loggedInUserId,
                            isOwner: isOwner // Pass isOwner variable to the template
                        });

                    }).catch(errorFn); // postmodel fn
                }).catch(errorFn); // usermodel fn
            }).catch(errorFn); //cafemodel fn
        }).catch(errorFn); // commentmodel fn
    }).catch(errorFn); // userModel fn
});

router.get('/about', function(req,resp){
    resp.render('about',{
        title: 'About | Coffee Lens',
        userPfp: req.session.loggedInUserPfp,
        loggedInUserId: req.session.loggedInUserId
    });
}); 

router.get('/search', async (req, res) => {
    try {
        const searchQuery = req.query.query;
        const results = await cafe.find({ cafename: { $regex: new RegExp(searchQuery, 'i')}});
        const plainResults = results.map(doc => doc.toObject()); // convert to access the cafename, desc and logo from the hbs
        res.render('searchResults', { results: plainResults });
    } catch (error) {
        console.error('Error:', error); 
        res.status(500).send('Internal Server Error');
    }
});


module.exports = router;
