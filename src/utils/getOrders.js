const request = require("request");

const getOrders = (orderId, token, callback) => {

    const url = "http://vd-inventory-query-rds.us-e1.cloudhub.io/v1/orders/" + orderId;
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

module.exports = getOrders;