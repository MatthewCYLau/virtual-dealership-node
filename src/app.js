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
const {
    ExpressOIDC
} = require('@okta/oidc-middleware');

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

// session support is required to use ExpressOIDC
app.use(session({
    secret: 'this should be secure',
    resave: true,
    saveUninitialized: false
}));

const oidc = new ExpressOIDC({
    issuer: 'https://dev-987225.okta.com/oauth2/default',
    client_id: process.env.LOCAL_CLIENT_ID,
    client_secret: process.env.LOCAL_CLIENT_SECRET,
    redirect_uri: 'http://localhost:3000/authorization-code/callback',
    scope: 'openid profile',
    appBaseUrl: 'http://localhost:3000',
});

// ExpressOIDC will attach handlers for the /login and /authorization-code/callback routes
app.use(oidc.router);

app.get('', (req, res) => {

    fetchData("", ((err, data) => {

        if (err) {
            return console.log(err)
        }
        res.render('index', {
            carData: data.body.inventory
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
        const carImageURL = data.body.cars[0].images.mainImage.url;

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

app.get('/signup', (req, res) => {
    res.render('signup');
})

app.get('/portal/welcome', (req, res) => {
    if (req.userContext.userinfo) {
        const loggedInUser = req.userContext.userinfo.name;
        res.render('welcome_user', {
            loggedInUser
        });
    } else {
        res.redirect('login');
    }
});

app.get('*', (req, res) => {
    res.render('404')
})

oidc.on('ready', () => {
    app.listen(3000, () => console.log(`Server started on port 3000`));
});

oidc.on('error', err => {
    console.log('Unable to configure ExpressOIDC', err);
});