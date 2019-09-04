const request = require("request");

const fetchCarData = (callback) => {

    const url = "http://vd-inventory-query-rds.us-e1.cloudhub.io/v1/inventory";
    request({
        url,
        json: true,
    }, (err, data) => {

        if (err) {
            callback('Unable to connect to car data service', undefined);
        } else {
            callback(undefined, data);
        };
    });
};

module.exports = fetchCarData;