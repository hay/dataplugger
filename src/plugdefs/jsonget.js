var request = require('request');

function Jsonget(conf) {
    this.conf = conf;
}

Jsonget.prototype = {
    load : function(callback) {
        request(this.conf.url, (err, res, body) => {
            if (err || res.statusCode !== 200) {
                throw new err;
            }

            var data = JSON.parse(body);
            callback(data);
        });
    }
};

module.exports = Jsonget;