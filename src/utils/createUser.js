const request = require("request");

const createUser = (firstName, lastName, email, username, mobile, callback) => {

    const url = "http://vd-inventory-query-rds.us-e1.cloudhub.io/v1/users";

    const payload = {
        'x': firstName,
        'x': lastName,
        'x': email,
        'x': username,
        'x': mobile
    }

    const options = {
        method: 'POST',
        json: true,
        url,
        body: payload
    }

    request(options, (err, response, data) => {

        if (err) {
            callback('Unable to connect to order item history service', response, undefined);
        } else {
            callback(undefined, response, data);
        };
    });
};

module.exports = createUser;