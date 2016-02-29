var http = require('../http');

function Jsonget(conf) {
    this.conf = conf;
}

Jsonget.prototype = {
    load : function(callback) {
        http.getJson(this.conf.url, callback);
    }
};

module.exports = Jsonget;