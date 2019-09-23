const dotenv = require('dotenv').config();
const path = require('path');
const express = require('express');
const hbs = require('hbs');
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const fetchData = require("./utils/fetchData")
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
const { ExpressOIDC } = require('@okta/oidc-middleware');

const app = express();

//Define paths for Express config
const publicDirectoryPath = path.join(__dirname, '../public');
const viewsPath = path.join(__dirname, '../templates/views')
const partialsPath = path.join(__dirname, '../templates/partials')

//Setup handlebars engine and views location
app.set('view engine', 'hbs');
app.set('views', viewsPath);
hbs.registerPartials(partialsPath);

//Setup static directory to serve
app.use(express.static(publicDirectoryPath));

//Setup body-parser
app.use(bodyParser.urlencoded({
    extended: true
}));


//Routing

app.get('', (req, res) => {

    fetchData("", ((err, data) => {

        if (err) {
            return console.log(err)
        }
        res.render('index', {
            carData: data.body.cars
        });
    }))
});

app.get('/car/:inventoryId', (req, res) => {

    const inventoryId = req.params.inventoryId;

    fetchData(inventoryId, ((err, data) => {

        if (err) {
            return console.log(err)
        }
       
        const modelId = data.body.cars[0].model.modelId;
        const modelName = data.body.cars[0].model.modelName;
        const carImageURL = data.body.cars[0].imageURL[0].outsideImage;

        res.render('car', {
            modelId,
            modelName,
            carImageURL
        });
    }))    
});

app.get('/message', (req, res) => {
    res.render('message');
})

app.get('/login', (req, res) => {

    res.render('login')

})

app.get('/signup', (req, res) => {
    res.render('signup');
})

app.get('*', (req, res) => {

    res.render('404')

})

app.listen(3000, () => {
    console.log('Server started on port 3000')
})