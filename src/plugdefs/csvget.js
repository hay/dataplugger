var http = require('../http');
var Baby = require('babyparse');

function Csvget(conf) {
    this.conf = conf;
}

Csvget.prototype = {
    load : function(callback) {
        http.get(this.conf.url, (body) => {
            var data = Baby.parse(body, {
                header : true,
                skipEmptyLines : true
            });

            callback(data.data);
        });
    }
};

module.exports = Csvget;