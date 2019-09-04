const dotenv = require('dotenv').config();
const path = require('path');
const express = require('express');
const hbs = require('hbs');
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const fetchCarData = require("./utils/fetchCarData")
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;

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

//Setup MongoDB Atlas
mongoose.connect("mongodb+srv://admin-matlau:"+process.env.MONGO_DB_PASSWORD+"@mattewcylau-5ltcp.mongodb.net/slackifymeDB", {
    useNewUrlParser: true
});

//Setup message schema
const messageSchema = {
    slackChannel: String,
    messageBody: String,
    time: {
        type: Date,
        default: Date.now
    }
}

const Message = mongoose.model(
    "Message", messageSchema
);

//Routing

app.get('', (req, res) => {

    fetchCarData((err, data) => {

        if (err) {
            return console.log(err)
        }
        res.render('index', {
            carData: data.body.cars
        });

        console.log(data.body.cars[0].imageURL[0].outsideImage)
    })
});

app.get('/message', (req, res) => {
    res.render('message');
})

app.get('/success', (req, res) => {

    res.render('success')

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