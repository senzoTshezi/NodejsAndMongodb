const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require ('connect-flash');
const session = require('express-session');

mongoose.connect('mongodb://localhost/nodekb');
let db = mongoose.connection;
//Check if we are successfully connected 
db.once('open', () => {
    console.log('Connected to MongoDB');
})

//Check if there is no error in Database 
db.on('error', (err) => {
    console.log(err);
})

//Init app
const app = express();

//Bring in Models
const Article = require ('./models/article');

//Load Views Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//parse application form url
app.use(bodyParser.urlencoded({extended:false}));
//parse application/json
app.use(bodyParser.json());

//Set Public Folder 
app.use(express.static(path.join(__dirname,'public')));

//Express Session Middleware standard configuration from documentary 
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
  }));

//Express Messages Middleware standard configuration from documentary 
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// Express Validator Middleware standard configuration from documentary 
app.use(expressValidator({
    errorFormatter: function(param, msg, value) {
        var namespace = param.split('.')
        , root    = namespace.shift()
        , formParam = root;
  
      while(namespace.length) {
        formParam += '[' + namespace.shift() + ']';
      }
      return {
        param : formParam,
        msg   : msg,
        value : value
      };
    }
  }));

//Home route 
app.get('/', (req , res) => {
    Article.find({}, (err, articles)=> {
        if(err){
            console.log(err);
        }else{
            res.render('index', {
                title : 'Articles',
                articles : articles
            });
        }
    });
});

//Get Single Article 
app.get('/article/:id', (req, res) => {
    Article.findById(req.params.id, (err, article) => {
       res.render('article', {
           article:article
       });
    });
});

//Add Route
app.get ('/articles/add', (req, res) => {
    res.render('add_article', {
        title :'Add Article'
    });
});

//Add Submit Post Route
app.post('/articles/add', (req, res) => {
     let article = new Article();
     article.title =  req.body.title;
     article.author =  req.body.author;
     article.body =  req.body.body;

     article.save( (err) => {
         if(err){
             console.log(err);
             return;
         }else{
             req.flash('success', 'Article Added');
             res.redirect('/');
         }
     });
});

//Load edit form 
        
app.get('/article/edit/:id', (req, res) => {
    Article.findById(req.params.id, (err, article) => {
       res.render('edit_article', {
           title: 'Edit Article',
           article:article
       });
    });
});

//Update Submit Post Route
app.post('/articles/edit:id', (req, res) => {
    req.checkBody('title', 'Title is required').notEmpty();
    req.checkBody('author', 'Author is required').notEmpty();
    req.checkBody('body', 'Body is required').notEmpty();

    //Check Errors if they are any 
    let errors = req.validationErrors();

    if(errors){
        res.render('add_article',{
            title: 'Add Article',
            errors: errors
        });
    }else{
        let article = {};
            article.title =  req.body.title;
            article.author =  req.body.author;
            article.body =  req.body.body;

            let query = {_id: req.params.id}

            Article.update( query, article, (err) => {
                if(err){
                    console.log(err);
                    return;
                }else{
                    req.flash('success', 'Article Updated');
                    res.redirect('/');
                }
            });
    }   
});

//Delete Article
app.delete('/article/:id', (req,res)=>{

    let query = {_id:req.params.id}

    Article.remove(query, (err) => {
        if(err){
        console.log(err);
        }else{
            res.send('Success');
        }
    });  
});
//start Server 
app.listen(9200, () => {
    console.log('Server started on port 9200..');
});
