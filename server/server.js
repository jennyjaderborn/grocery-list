
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
app.get('/', (req, res, next) => {
    let passedVariable = req.query.q;
    console.log('passed', passedVariable)
    //find all
    Item.find()
        .exec() //using exec to get a promise
        .then(items => {
            console.log(items);
            res.status(200);
            let newArr = items.filter(item => item.item === passedVariable)
            res.render('index', { items, searched : newArr })
        })
        .catch(err => {
            console.log('error:', err);
            res.status(500);
            res.send("Something went wrong..")
        });
})

//post to db via html-form 
app.post('/add', (req, res, next) => {
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
        res.send('Something went wrong..')
    });
});


//search html-form
app.post('/search', (req, res, next) => {
    console.log(req.body.search);
    let search = req.body.search;
    res.redirect('/?q=' + search)
});


//delete button
app.post('/delete', (req, res, next) => {
    console.log(req.body);
    Item.deleteOne({_id: req.body.buttonId})
    .exec()
    .then(
        res.status(200),
        res.redirect('/')
        )
    .catch(err => {
        console.log(err);
        res.status(500);
        res.send("Something went wrong");
    });
});


//add new grocery in url
app.get('/add/:item/:amount', (req, res) => {
    let item = req.params.item.toLowerCase();
    let amount = req.params.amount;
    console.log(item);
    var newItem = new Item({item, amount});
    newItem.save()
    .then(result => {
        console.log('result:', result);
        res.status(200).json({
            result
        });
    })
    .catch(err => {
        console.log('error:', err);
        res.status(500).json({
            error: err
        });
    });
});

//search url
app.get('/search/:item', (req, res) => {
    let search = req.params.item;
    console.log(search)
    Item.findOne({item : search})
    .exec()
    .then(result => {
        res.status(200).json({ result })
    })
    .catch(err => {
        res.status(500).json({
            error: err
        })
    })
});

//uppdate with url, json response
app.get('/update/:item/:amount', (req, res, next) => {

    let newItem = req.params.item;
    let newAmount = req.params.amount;
    console.log('PARAMS:', newItem, newAmount);
    Item.findOne({item : newItem})
    .exec()
    .then(result => {
        result.item = newItem; 
        result.amount = newAmount;
        result.save()
        .then(result => {
            res.status(200).json({ result })
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })
    })
    .catch(err => {
        res.status(500).json({
            error: err
        })
    })
});

//delete with url
app.get('/delete/:item', (req, res, next) => {
    console.log('vill radera', req.params.item);
    let item = req.params.item;
    Item.deleteOne({item : item})
    .exec()
    .then(result => {
        res.status(200).json({ result })
    })
    .catch(err => {
        res.status(500).json({
            error: err
        })
    })
});



app.use((req, res, next) => {
    const error = new Error("Not found");
    error.status = 404;
    next(error); //next calls the next function,
  });
  
  app.use((error, req, res, next) => {
    res.status(error.status);
    res.render('error', { error });
  });


//Server is online at localhost:3000
app.listen(port, () => console.log(`App listening on port ${port}!`));