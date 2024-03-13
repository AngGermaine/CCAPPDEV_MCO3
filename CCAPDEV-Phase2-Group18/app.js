/*Install Command:
    npm init
    npm i express express-handlebars body-parser mongoose
*/

const express = require('express');
const server = express();

const bodyParser = require('body-parser')
server.use(express.json()); 
server.use(express.urlencoded({ extended: true }));

const handlebars = require('express-handlebars');
const hbs = handlebars.create({
    extname: 'hbs',
    defaultLayout: 'index',
    helpers: {
        generateStarIcons: function(rating){
            let stars = '';
            for (let i = 0; i < rating; i++) {
                stars += '<span class="material-icons">star_rate</span>';
            }
            return stars;
        },
        formatDate: function(date) {
            const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            const month = months[date.getMonth()];
            const day = date.getDate();
            const year = date.getFullYear();
            return `${month} ${day}, ${year}`;
        },

        eq: function(arg1, arg2, options) {
            return arg1 === arg2 ? options.fn(this) : options.inverse(this);
        }
    }
});

// Set Handlebars engine in Express
server.engine('hbs', hbs.engine);
server.set('view engine', 'hbs');

server.use(express.static('public'));

//for the DB
const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://user:appdevmco2@cluster0.gysra2q.mongodb.net/mco');

// schemas
const commentSchema = new mongoose.Schema({
    upvote: { type: Number }, 
    downvote: {type: Number},
    content: {type: String},
    authorid: {type: Number}, 
    dateposted: {type: String},
    storeid: {type: Number}
},{ versionKey: false });

const cafeSchema = new mongoose.Schema({
    cafeid: {type: Number}, 
    cafename: {type: String},
    ownerid: {type: Number}, 
    logo: {type: String},
    rating: {type: Number},
    cafedesc: {type: String}
 },{ versionKey: false });

const postSchema = new mongoose.Schema({
    authorid: {type: Number},
    createdate: {type: String},
    updatedate: {type: String},
    dateposted: {type: String},
    upvote: { type: Number }, 
    downvote: {type: Number},
    title: {type: String},
    description: {type: String},
    image: {type: String},
    isPromo: {type: Boolean},
    storeid: {type: Number},
    postid: {type: Number}
 },{ versionKey: false });

 const userSchema = new mongoose.Schema({
    userid: { type: Number }, 
    username: {type: String},
    password: { type: Number}, 
    profpic: {type: String},
    joindate: {type: String},
    isOwner: {type: Boolean}
 },{ versionKey: false });

// models
const commentModel = mongoose.model('comment',commentSchema);
const cafeModel = mongoose.model('store',cafeSchema);
const postModel = mongoose.model('post',postSchema);
const userModel = mongoose.model('user',userSchema);

function errorFn(err){
    console.log('Error found');
    console.error(err);
}


// current logged in user
var loggedInUser = "";

/* ACTUAL CODE FOR MAIN PAGE:
    server.get('/', function(req,resp){
        resp.render('main',{
            layout: 'index',
            title: 'Home | Coffee Lens'
        });
    }); 
*/

// for testing retrieval of data
server.get('/', function(req,resp){
    const searchQuery = {};
    commentModel.find(searchQuery).lean().then(function(comments){
        cafeModel.find(searchQuery).lean().then(function(cafes){
            userModel.find(searchQuery).lean().then(function(users){
                postModel.find(searchQuery).lean().then(function(posts){
                    cafes.sort((a, b) => b.rating - a.rating);
                    resp.render('main', {
                        layout: 'index',
                        title: 'Home | Coffee Lens',
                        'comments-data': comments,
                        'cafe-data': cafes,
                        'user-data': users, 
                        'post-data': posts
                    });
                }).catch(errorFn);  // postmodel fn
            }).catch(errorFn);  // usermodel fn
        }).catch(errorFn);      //cafemodel fn
    }).catch(errorFn); // commentmodel fn
});

server.get('/login', function(req,resp){
    resp.render('login',{
        title: 'Log In | Coffee Lens'
    });
}); 

server.post('/check_login', function(req,resp){
    const searchQuery = { username: req.body.username, password: req.body.password };
    userModel.findOne(searchQuery).then(function(users){
        console.log('Finding User');
        if(users != undefined && users.userid != null) {
            loggedInUser = users.username;
            resp.render('check-login',{
                title: 'Log In | Coffee Lens',
                success: true
            });
        }else{
            resp.render('check-login',{
                title: 'Log In | Coffee Lens',
                success: false
            });
        }
    }).catch(errorFn);
}); 

server.get('/create_acc', function(req,resp){
    resp.render('create-acc',{
        title: 'Log In | Coffee Lens'
    });
}); 

server.get('/edit_profile', function(req,resp){
    resp.render('edit-profile',{
        title: 'Edit Profile | Coffee Lens'
    });
}); 

server.get('/about', function(req,resp){
    resp.render('about',{
        title: 'About | Coffee Lens'
    });
}); 

server.get('/view_cafe', function(req,resp){
    const cafeid = req.query.id;
    const cafe_searchQuery = { cafeid: cafeid }; 

    cafeModel.findOne(cafe_searchQuery).lean().then(function(cafe){
        if (cafe) {
            postModel.find({ isPromo: false }).lean().then(function(posts){
                const filteredPosts = posts.filter(post => post.storeid === cafeid);

                const authorIds = [...new Set(filteredPosts.map(post => post.authorid))];
                
                userModel.find({ userid: { $in: authorIds } }).lean().then(function(users){
                    const postsWithUserInfo = filteredPosts.map(post => {
                        const author = users.find(user => user.userid === post.authorid);
                        return {
                            ...post,
                            profpic: author ? author.profpic : null,
                            username: author ? author.username : null
                        };
                    });
                    // Calculate combined score (upvotes - downvotes) for each post
                    postsWithUserInfo.forEach(post => {
                        post.combinedScore = post.upvote - post.downvote;
                    });

                    // Sort posts based on combined score in descending order
                    postsWithUserInfo.sort((a, b) => b.combinedScore - a.combinedScore);
                    
                    resp.render('view-cafe', {
                        title: 'View Cafe | Coffee Lens',
                        'cafe-data': cafe,
                        'post-data': postsWithUserInfo
                    });
                }).catch(errorFn);
            }).catch(errorFn);
        } else {
            resp.status(404).send('Cafe not found');
        }
    }).catch(errorFn);
});

server.get('/view_all', function(req, resp){
    const searchQuery = {};
    cafeModel.find(searchQuery).lean().then(function(cafes){
        cafes.sort((a, b) => a.cafename.localeCompare(b.cafename));
        resp.render('view-all', {
            title: 'All Cafes | Coffee Lens',
            'cafe-data': cafes 
        });
    }).catch(errorFn);
});

server.get('/view_post', function(req, resp){
    const postId = req.query.postId;

    postModel.findById(postId).lean().then(function(post) {
        if (post) {
            userModel.findOne({ userid: post.authorid }).lean().then(function(poster) {
                commentModel.find({storeid: post.storeid}).lean().then(function(comments){
                    if(comments){
                        const authorIds = comments.map(comment => comment.authorid);
                        userModel.find({userid: { $in: authorIds }}).lean().then(function(users){
                            const commentsWithUserInfo = comments.map(comment =>{
                                const author = users.find(user => user.userid === comment.authorid);
                                return{
                                    ...comment,
                                    profpic: author ? author.profpic : null,
                                    username: author ? author.username : null,
                                    isOwner: author ? author.isOwner : false
                                };
                            });
                            resp.render('view-post', {
                                title: 'View Promo | Coffee Lens',
                                'post-data': post,
                                'user-data' : poster,
                                'comments-data': commentsWithUserInfo,
                            });
                        }).catch(errorFn);
                    } else {
                        resp.status(404).send('Comments not found');
                    }
                }).catch(errorFn);
            }).catch(errorFn);
        } else {
            resp.status(404).send('Promo not found');
        }
    }).catch(errorFn);
});


server.get('/view_profile', function(req,resp){
    const userId = req.query.userId;
    userModel.findOne({userid: userId}).lean().then(function(profile){
        postModel.find({authorid: userId}).lean().then(function(posts){
            resp.render('view-profile',{
                title: 'Profile | Coffee Lens',
                'posts': posts,
                'user-data': profile
            });
        }).catch(errorFn);
    }).catch(errorFn);

    
}); 

server.get('/edit_review', function(req,resp){
    const postId = req.query.postId;
    postModel.findById(postId).lean().then(function(post){
        if(post){
            userModel.findOne({ userid: post.authorid }).lean().then(function(poster){
                cafeModel.find({}).lean().then(function(cafes){
                    resp.render('edit-review',{
                        title: 'Edit Post | Coffee Lens',
                        'post-data': post,
                        'user-data': poster,
                        'cafe-list': cafes
                    });
                }).catch(errorFn);
            }).catch(errorFn);
        } else{
            resp.status(404).send('Post not found');
        }
    }).catch(errorFn);
    
}); 

server.get('/edit_promo', function(req,resp){
    const postId = req.query.postId;
    postModel.findById(postId).lean().then(function(post){
        if(post){
            userModel.findOne({ userid: post.authorid }).lean().then(function(poster){
                cafeModel.find({}).lean().then(function(cafes){
                    resp.render('edit-promo',{
                        title: 'Edit Promo | Coffee Lens',
                        'post-data': post,
                        'user-data': poster
                    });
                }).catch(errorFn);
            }).catch(errorFn);
        } else{
            resp.status(404).send('Post not found');
        }
    }).catch(errorFn);
}); 

server.get('/post_promo', function(req, resp){
    const searchQuery = {};
    const currentDate = new Date();
    cafeModel.find(searchQuery).lean().then(function(cafes){
        resp.render('post-promo', {
            title: 'Post A Promo | Coffee Lens',
            'cafe-data': cafes,
            currentDate: currentDate
        });
    }).catch(errorFn);
});

server.get('/post_review', function(req, resp){
    const searchQuery = {};
    const currentDate = new Date();
    cafeModel.find(searchQuery).lean().then(function(cafes){
        resp.render('post-review', {
            title: 'Post A Review | Coffee Lens',
            'cafe-data': cafes,
            currentDate: currentDate
        });
    }).catch(errorFn);
});


const port = process.env.PORT | 9090;
server.listen(port, function(){
    console.log('Listening at port '+port);
});