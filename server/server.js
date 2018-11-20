
const express = require('express')
const app = express()
const port = 3000
const path = require('path');
var fs = require("fs");
var bodyParser = require('body-parser')

app.use(bodyParser.urlencoded({extended: true}))


// use is for loading the middleware function, serving static files like css
app.use(express.static( '../public/'));

//tells express which template we are going to use: pug and get the viewsmap
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, '../views'));


let data = fs.readFileSync('../public/list.json');
let list = JSON.parse(data);


app.get('/', (req, res) => res.render('index', {list})
);

app.post('/add', (req,res) => {
    //console.log(req.body)
    let animal = req.body.animal;
    let amount = parseInt(req.body.amount);

    //byt ifsats
    if(!amount || !animal){
        res.send('Fyll i ett värde')
    } 
    else {
            list[animal] = amount;
    
            let newJson = JSON.stringify(list, null, 4)
            fs.writeFileSync('../public/list.json', newJson);
    
            res.render('index', {list})
    }

});

app.post('/search', (req,res) => {

    let key = req.body.search;
    //key.toLowerCase();
    //console.log(Object.keys(list))
    
    if(Object.keys(list).includes(key)){
        let value = list[key];
        res.render('index',{key: key, value: value, list} )
    } 
    else {
      res.render('index', {error: `Det finns ingen ${key} i zoo:et just nu.. 😟`, list});
    }

})


app.get('/:key', (req, res) => {

    let key = req.params.key;
    key.toLowerCase();
    console.log(Object.keys(list))
    
    if(Object.keys(list).includes(key)){
    let value = list[key];
    res.send(`Du har sökt efter ${key.charAt(0).toUpperCase() + key.slice(1)}, temperaturen är just nu ${value} grader`)
  } else {
    res.send(`Din sökning på ${key.charAt(0).toUpperCase() + key.slice(1)} gav inget resultat`)
  }
})


//lägg till i url
app.get('/add/:animal/:amount', (req, res) => {
    console.log(list);
    let animal = req.params.animal;
    let amount = parseInt(req.params.amount);

    
        list[animal] = amount;

        let newJson = JSON.stringify(list, null, 4)
        fs.writeFileSync('../public/list.json', newJson);

        res.send('Lades till i listan!')

});

// update i url

app.get('/update/:animal/:newanimal/:amount', (req, res) => {

    let animal = req.params.animal;
    delete list[animal];

    let amount = parseInt(req.params.amount);
    let newAnimal = req.params.newanimal;

    list[newAnimal] = amount;

        let newJson = JSON.stringify(list, null, 4)
        fs.writeFileSync('../public/list.json', newJson);

        res.send(`${animal} uppdaterades till ${newAnimal} ${amount}`)

});

//delete i url

app.get('/update/:animal', (req, res) => {

    let animal = req.params.animal;
    delete list[animal];



        res.send(`raderade ${animal}`)

});




app.listen(port, () => console.log(`App listening on port ${port}!`))