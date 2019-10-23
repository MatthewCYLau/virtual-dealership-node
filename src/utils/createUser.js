const request = require("request");

const createUser = (firstName, lastName, email, username, mobile, callback) => {

    const url = "http://vd-users-sapi.us-e1.cloudhub.io/api/users";

    const customerID = (Math.floor(100000000 + Math.random() * 900000000)).toString()

    const payload = {
        'firstName': firstName,
        'lastName': lastName,
        'email': email,
        'login': username,
        'mobilePhone': mobile,
        'customerID': customerID
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