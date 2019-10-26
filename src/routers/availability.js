const express = require('express');
const router = new express.Router();
const updateAvailability = require("../utils/availability")

router.get('/availability', (req, res) => {
    res.render('availability')
})

router.get('/availability_updated', (req, res) => {
    res.render('availability_updated')
})

router.post('/availability', (req, res) => {

    const inventoryId = req.body.inventoryId;

    updateAvailability(inventoryId, ((err, response, data) => {

        if (err) {
            return console.log(err)
        }

        const responseStatusCode = response.statusCode

        if (responseStatusCode != 200) {
            console.log('Failed to update inventory availaiblity')
            return res.redirect('/server_error')
        }
        res.redirect('/availability_updated')
    }))
})

module.exports = router;