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

server.get('/about', function(req,resp){
    resp.render('about',{
        title: 'About | Coffee Lens'
    });
}); 

const port = process.env.PORT | 9090;
server.listen(port, function(){
    console.log('Listening at port '+port);
});