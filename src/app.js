const session = require('express-session');
const path = require('path');
const express = require('express');
const hbs = require('hbs');
const port = process.env.PORT
const passport = require('passport')

const bodyParser = require("body-parser");
const getInventory = require("./utils/getInventory")
const {getOrders, createOrder} = require("./utils/orders")
const fulfilOrder = require("./utils/fulfilOrder")
const createUser = require("./utils/createUser")
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
        authorizationURL: process.env.AUTH_URL,
        tokenURL: process.env.TOKEN_URL,
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: process.env.CALLBACK_URL,
        state: 'foobar'
    },
    function (accessToken, refreshToken, profile, done) {
        return done(null, accessToken, profile);
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
        //successRedirect: '/',
        failureRedirect: '/auth/provider'
    }), (req, res) => {
        // Successful authentication, redirect to secrets.

        res.cookie('auth_token', req.user)
        res.redirect("/");
    });

// Middleware to check if the user is authenticated
const auth = (req, res, next) => {
    if (req.user) {
        next();
    } else {
        console.log('User is not authenticated')
        res.redirect('/auth/provider');
    }
}

//Routing
app.get('', (req, res) => {

    getInventory("", ((err, data) => {

        if (err) {
            return console.log(err)
        }
        res.render('index', {
            carData: data.body.inventory,
            user: req.user
        });

    }))
});

app.get('/inventory/:inventoryId', (req, res) => {

    const user = req.user;
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
            description,
            user,
            inventoryId
        });
    }))
});

app.get('/orders', auth, (req, res) => {

    const token = req.cookies['auth_token']
    getOrders("", token, ((err, data) => {

        if (err) {
            return console.log(err)
        }
        res.render('orders', {
            orders: data.body.orders,
            customerId: data.body.customerId,
            user: req.user
        });
    }))
})

app.post('/orders', (req, res) => {

    const token = req.cookies['auth_token']

    const inventoryId = req.body.inventoryId;

    createOrder(inventoryId, token, ((err, response, data) => {

        if (err) {
            return console.log(err)
        }
        
        const responseStatusCode = response.statusCode

        if(responseStatusCode!=201) {
            console.log('Order is unavailable')
            return res.redirect('/unavailable')
        }
        res.redirect('/orders')
    }))

})


app.get('/orders/:orderId', auth, (req, res) => {

    const token = req.cookies['auth_token']
    const orderId = req.params.orderId;

    getOrders(orderId, token, ((err, data) => {

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
            orderItems: data.body.orderItems,
            user: req.user
        });
    }))
});

app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

app.get('/fulfilment', (req, res) => {
    res.render('fulfilment')
})

app.get('/fulfilment_confirmed', (req, res) => {
    res.render('fulfilment_confirmed')
})

app.post('/fulfilment', (req, res) => {

    const orderItemId = req.body.orderItemId;
    const statusCode = req.body.statusCode
    const statusDescription = req.body.statusDescription
    
    fulfilOrder(orderItemId, statusCode, statusDescription, ((err, response, data) => {

        if (err) {
            return console.log(err)
        }
        
        const responseStatusCode = response.statusCode

        if(responseStatusCode!=201) {
            console.log('Order fulfilment failed')
            return res.redirect('/server_error')
        }
        
        res.redirect('/fulfilment_confirmed')
    }))
})

app.get('/signup', (req, res) => {
    res.render('signup', {
        user: req.user
    })
})

app.post('/signup', (req, res) => {

    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const email = req.body.email;
    const username = req.body.username;
    const mobile = req.body.mobile;
    
    createUser(firstName, lastName, email, username,mobile, ((err, response, data) => {

        if (err) {
            return console.log(err)
        }
        
        const responseStatusCode = response.statusCode

        if(responseStatusCode!=201) {
            console.log('User not created')
            return res.redirect('/server_error')
        }
        
        res.redirect('/')
    }))
   
})


app.get('/unavailable', (req, res) => {
    res.render('unavailable')
})

app.get('/server_error', (req, res) => {
    res.render('server_error')
})

app.get('*', (req, res) => {
    res.render('404')
})

app.listen(port, () => {
    console.log('Server is up on port ' + port)
})