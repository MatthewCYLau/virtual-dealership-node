const request = require("request");
const dotenv = require('dotenv').config();

const getOrders = (orderId, callback) => {

    const url = "http://vd-inventory-query-rds.us-e1.cloudhub.io/v1/orders/" + orderId;
    const authToken = process.env.AUTH_TOKEN;
    const headers = {
        'Authorization': 'Bearer ' + authToken
    }

    const options = {
        method: 'GET',
        json: true,
        url,
        headers,
    }

    request(options, (err, data) => {

        if (err) {
            callback('Unable to connect to car data service', undefined);
        } else {
            callback(undefined, data);
        };
    });
};

module.exports = getOrders;