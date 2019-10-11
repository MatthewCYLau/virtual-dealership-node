const dotenv = require('dotenv').config();
const path = require('path');
const express = require('express');
const hbs = require('hbs');

const bodyParser = require("body-parser");
const getInventory = require("./utils/getInventory")
const getOrders = require("./utils/getOrders")

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

oidc.on('ready', () => {
    app.listen(3000, () => console.log(`Server started on port 3000`));
});

oidc.on('error', err => {
    console.log('Unable to configure ExpressOIDC', err);
});