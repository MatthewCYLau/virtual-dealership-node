const session = require('express-session');
const path = require('path');
const express = require('express');
const hbs = require('hbs');
const port = process.env.PORT
const passport = require('passport')

const bodyParser = require("body-parser");
const getInventory = require("./utils/getInventory")
const getOrders = require("./utils/getOrders")
const cookieParser = require('cookie-parser')

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


app.use(session({
    secret: 'this should be secure',
    resave: true,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

//Setup cookie parser
app.use(cookieParser());

//OAuth2 settings
OAuth2Strategy = require('passport-oauth').OAuth2Strategy;

passport.use('provider', new OAuth2Strategy({
        authorizationURL: 'https://dev-570822.okta.com/oauth2/v1/authorize',
        tokenURL: 'https://dev-570822.okta.com/oauth2/v1/token',
        clientID: '0oatxw4axNIEx06aV356',
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: 'http://localhost:3000/auth/provider/callback',
        state: 'foobar'
    },
    function (accessToken, refreshToken, profile, done) {

        done(null, profile);
    }
));

// Used to stuff a piece of information into a cookie
passport.serializeUser((user, done) => {
    done(null, user);
});

// Used to decode the received cookie and persist session
passport.deserializeUser((user, done) => {
    done(null, user);
});

app.get('/auth/provider',
    passport.authenticate('provider', {
        scope: ['openid', 'email', 'profile']
    })
);

app.get('/auth/provider/callback',
    passport.authenticate('provider', {
        successRedirect: '/',
        failureRedirect: '/signup'
    }));

//Routing
app.get('', (req, res) => {

    getInventory("", ((err, data) => {

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

    getInventory(inventoryId, ((err, data) => {

        if (err) {
            return console.log(err)
        }

        const modelId = data.body.cars[0].model.modelId;
        const modelName = data.body.cars[0].model.modelName;
        const carImageURL = data.body.cars[0].images.mainImage.url;
        const price = data.body.cars[0].price;
        const priceCurrency = data.body.cars[0].priceCurrency;
        const priceDisclaimer = data.body.cars[0].priceDisclaimer;
        const description = data.body.cars[0].description

        res.render('car', {
            modelId,
            modelName,
            carImageURL,
            price,
            priceCurrency,
            priceDisclaimer,
            description
        });
    }))
});

app.get('/signup', (req, res) => {
    res.render('signup');
})


app.get('/portal/orders', (req, res) => {

    getOrders("", ((err, data) => {

        if (err) {
            return console.log(err)
        }
        res.render('orders', {
            orders: data.body.orders,
            customerId: data.body.customerId
        });
    }))

})

app.get('/portal/orders/:orderId', (req, res) => {

    const orderId = req.params.orderId;

    getOrders(orderId, ((err, data) => {

        if (err) {
            return console.log(err)
        }

        var orderStatus = "0";

        if ((data.body.orderStatus) === "Completed") {
            orderStatus = "100"
        } else {
            orderStatus = "50"
        }

        res.render('order_status', {
            orderId: data.body.orderId,
            orderCreatedUTCDateAndTime: data.body.orderCreatedUTCDateAndTime,
            orderStatus,
            orderItems: data.body.orderItems
        });
    }))
});

app.get('*', (req, res) => {
    res.render('404')
})

app.listen(port, () => {
    console.log('Server is up on port ' + port)
})