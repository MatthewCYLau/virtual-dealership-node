const request = require("request");

const getInventory = (inventoryId, callback) => {

    const url = "http://vd-inventory-query-rds.us-e1.cloudhub.io/v1/inventory/"+inventoryId;
    request({
        url,
        json: true,
    }, (err, data) => {

        if (err) {
            callback('Unable to connect to inventory service', undefined);
        } else {
            callback(undefined, data);
        };
    });
};

module.exports = getInventory;