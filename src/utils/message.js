const request = require("request");

const sendMessage = (slackChannel, slackAuthToken, messageBody, callback) => {

    const url = "https://slack.com/api/chat.postMessage";
    const authToken = slackAuthToken;

    const payload = {
        'channel': slackChannel,
        'text': messageBody
    }
    const headers = {
        'Authorization': 'Bearer ' + authToken
    }

    const options = {
        method: 'POST',
        body: payload,
        json: true,
        url,
        headers,
    }

    request(options, (err, res) => {
        if (err) {
            callback(err);
        } else {
            console.log('Successfully posted message onto Slack');
            callback(undefined);
        }
    })
}
module.exports = sendMessage