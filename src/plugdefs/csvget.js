var request = require('request');
var Baby = require('babyparse');

function Csvget(conf) {
    this.conf = conf;
}

Csvget.prototype = {
    load : function(callback) {
        request(this.conf.url, (err, res, body) => {
            if (err || res.statusCode !== 200) {
                throw err;
            }

            var data = Baby.parse(body, {
                header : true,
                skipEmptyLines : true
            });

            callback(data.data);
        });
    }
};

module.exports = Csvget;