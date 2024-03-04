/* Install commands: 
    npm init
    npm i express express-handlebars body-parser
*/
const express = require('express');
const server = express();

const bodyParser = require('body-parser')
server.use(express.json()); 
server.use(express.urlencoded({ extended: true }));

const handlebars = require('express-handlebars');
server.set('view engine', 'hbs');
server.engine('hbs', handlebars.engine({
    extname: 'hbs',
    defaultLayout: 'index'
}));

server.use(express.static('public'));

server.get('/', function(req,resp){
    resp.render('main',{
        layout: 'index',
        title: 'Home | Coffee Lens'
    });
});

server.get('/view_cafe', function(req,resp){
    resp.render('view-cafe',{
        title: 'View Cafe | Coffee Lens'
    });
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

server.get('/edit_review', function(req,resp){
    resp.render('edit-review',{
        title: 'Edit Review | Coffee Lens'
    });
}); 

server.get('/edit_promo', function(req,resp){
    resp.render('edit-promo',{
        title: 'Edit Promo Post | Coffee Lens'
    });
}); 

server.get('/post_promo', function(req,resp){
    resp.render('post-promo',{
        title: 'Post A Promo | Coffee Lens'
    });
}); 

server.get('/post_review', function(req,resp){
    resp.render('post-review',{
        title: 'Post A Review | Coffee Lens'
    });
}); 

server.get('/about', function(req,resp){
    resp.render('about',{
        title: 'About | Coffee Lens'
    });
}); 

server.get('/view_all', function(req,resp){
    resp.render('view-all',{
        title: 'All Cafes | Coffee Lens'
    });
}); 

const port = process.env.PORT | 9090;
server.listen(port, function(){
    console.log('Listening at port '+port);
});