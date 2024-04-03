/*Install Command:
    npm init
    npm i express express-handlebars body-parser mongoose passport passport-local express-session
*/

const express = require('express');
const server = express();
const passport = require("passport");
const local = require("./strategies/local");

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
        },
        hasLikedUser: function(userId, likedByArray){
            return likedByArray.includes(userId);
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

// import routes 
const loginRoute = require("./api/loginRoutes.js");
const cafeRoute = require("./api/cafeRoutes.js");
const pageRoute = require("./api/pageRoutes.js");
const postRoute = require("./api/postRoutes.js");
const userRoute = require("./api/userRoutes.js");


//passport initialization for auth and session
server.use(passport.initialize());
server.use(passport.session());


server.use(loginRoute); 
server.use(cafeRoute); 
server.use(pageRoute); 
server.use(postRoute); 
server.use(userRoute);

const port = process.env.PORT | 9090;
server.listen(port, function(){
    console.log('Listening at port '+port);
});