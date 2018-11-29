
const express = require('express')
const app = express()
const port = 3000
const path = require('path');
var bodyParser = require('body-parser');


app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());


//makes mongoose global to use in all files
global.mongoose = require("mongoose");

mongoose.connect('mongodb://localhost/grocerylist');

// use is for loading the middleware function, serving static files like css
app.use(express.static( '../public/'));

//tells express which template we are going to use: pug and get the viewsmap
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, '../views'));



//import the schema, defining how the object will look like
const Item = require('./models/item');

//homepage 
app.get('/', function(req, res, next){
    let passedVariable = req.query.q;
    console.log('passed', passedVariable)
    //find all
    Item.find()
        .exec()
        .then(items => {
            console.log(items);
            res.status(200);
            let newArr = items.filter(item => item.item === passedVariable)
            res.render('index', { items, searched : newArr })
        })
        .catch(err => {
            console.log('error:', err);
            res.status(500);
        });
})

//post to db via html-form 
app.post('/add', function(req, res, next){
    let item = req.body.item.toLowerCase();
    let amount = req.body.amount;

 //creates a new instance of the model and passing object to constructor
    var newItem = new Item({item, amount});

    newItem.save()
    .then(result => {
        console.log('result:', result);
        res.status(200);
        res.redirect('/');
    })
    .catch(err => {
        console.log('error:', err);
        res.status(500);
    });
});


//search html-form
app.post('/search', function(req, res, next){
    console.log(req.body.search);
    let search = req.body.search;
    res.redirect('/?q=' + search)
});


//delete button
app.post('/delete', (req, res, next) => {
    console.log(req.body);
    Item.deleteOne({_id: req.body.buttonId})
    .exec()
    .then(result => {
        res.status(200);
        res.redirect('/')

    })
    .catch(err => {
        console.log(err);
    });
});


//add new grocery in url
app.get('/add/:item/:amount', (req, res) => {
    let item = req.params;
    console.log(item);
    var newItem = new Item(item);
    newItem.save(function(err, newItem){
        if(err) return next(err);
        res.status(201)
        res.send('lades till');
    })
});

//search url
app.get('/search/:item', (req, res) => {
    let search = req.params.item;
    console.log(search)
    Item.findOne({item : search})
        .exec((err, item) => {
         if(err) { 
             return next(err)
         }
        else {
            res.status(201)
            res.send({item})
            }
        })
});

//uppdate with url
app.get('/update/:item/:amount', (req, res, next) => {

    let newItem = req.params.item;
    let newAmount = req.params.amount;
    console.log('PARAMS:', newItem, newAmount); 
    Item.findOne({item : newItem}, function(err, item){
        if(err) return next(err)
        item.item = newItem; 
        item.amount = newAmount;
        item.save();
        res.send(item);
    })
});

//delete with url 
app.get('/delete/:item', (req, res, next) => {
    console.log('vill radera', req.params.item);
    let item = req.params.item;
    Item.deleteOne({item : item})
    .exec(function(err, item){
        if(err) return next(err);
        res.redirect('/')
    })
});




app.listen(port, () => console.log(`App listening on port ${port}!`));