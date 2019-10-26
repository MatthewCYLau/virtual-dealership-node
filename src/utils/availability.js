const request = require("request");

const updateAvailability = (inventoryId, callback) => {

    const url = 'http://vd-inventory-query-rds.us-e1.cloudhub.io/v1/inventory/' + inventoryId + '/availability';

    const payload = {
        'availability': "available"
    }

    const options = {
        method: 'PATCH',
        json: true,
        url,
        body: payload
    }

    request(options, (err, response, data) => {

        if (err) {
            callback('Unable to connect to inventory availability service', response, undefined);
        } else {
            callback(undefined, response, data);
        };
    });
};

module.exports = updateAvailability;