var request = require('request');

var http = {
    get : (url, callback) => {
        request(url, (err, res, body) => {
            if (err || res.statusCode !== 200) {
                throw err;
            }

            callback(body);
        });
    },

    getJson : (url, callback) => {
        http.get(url, (body) => {
            var data = JSON.parse(body);
            callback(data);
        });
    }
};

module.exports = http;