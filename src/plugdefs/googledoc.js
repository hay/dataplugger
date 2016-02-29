var http = require('../http');
const GOOGLE_DOC_API = 'https://docs.google.com/document/export?format=txt&id=';

function Googledoc(conf) {
    this.conf = conf;
}

Googledoc.prototype = {
    load : function(callback) {
        var url = GOOGLE_DOC_API + this.conf.id;
        http.get(url, callback);
    }
};

module.exports = Googledoc;