var request = require('request');

function Csvget(conf) {
    this.conf = conf;
}

Csvget.prototype = {
    load : function(callback) {
        request(this.conf.url, (err, res, body) => {
            if (err || res.statusCode !== 200) {
                throw err;
            }

            var data = JSON.parse(body);
            callback(data);
        });
    }
};

module.exports = Csvget;