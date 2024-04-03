const LocalStrategy = require("passport-local");
const passport = require("passport");
const user = require("../schemas/userSchema");

passport.use(new LocalStrategy(function(username, password, done){
        const result = 0;//insert query to database here

    }
));