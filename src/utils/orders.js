const request = require("request");

const getOrders = (orderId, token, callback) => {

    const url = "http://vd-inventory-query-rds.us-e1.cloudhub.io/v2/orders/" + orderId;
    const headers = {
        'Authorization': 'Bearer ' + token
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

const createOrder = (inventoryId, token, callback) => {

    const url = "http://vd-inventory-query-rds.us-e1.cloudhub.io/v2/orders/";
    const headers = {
        'Authorization': 'Bearer ' + token
    }

    const payload = {
        'inventory_id': inventoryId
    }

    const options = {
        method: 'POST',
        json: true,
        url,
        headers,
        body: payload
    }

    request(options, (err, response, data) => {

        if (err) {
            callback('Unable to connect to car data service', response, undefined);
        } else {
            callback(undefined, response, data);
        };
    });
};

module.exports = {
    getOrders,
    createOrder
};