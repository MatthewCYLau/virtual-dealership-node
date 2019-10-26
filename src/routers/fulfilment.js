const express = require('express');
const router = new express.Router();
const fulfilOrder = require("../utils/fulfilOrder")

router.get('/fulfilment', (req, res) => {
    res.render('fulfilment')
})


router.get('/fulfilment_confirmed', (req, res) => {
    res.render('fulfilment_confirmed')
})

router.post('/fulfilment', (req, res) => {

    const orderItemId = req.body.orderItemId;
    const statusCode = req.body.statusCode
    const statusDescription = req.body.statusDescription

    fulfilOrder(orderItemId, statusCode, statusDescription, ((err, response, data) => {

        if (err) {
            return console.log(err)
        }

        const responseStatusCode = response.statusCode

        if (responseStatusCode != 201) {
            console.log('Order fulfilment failed')
            return res.redirect('/server_error')
        }

        res.redirect('/fulfilment_confirmed')
    }))
})

module.exports = router;