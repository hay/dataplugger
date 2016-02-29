var Tabletop = require('tabletop');

function Googlesheet(conf) {
    this.conf = conf;
}

Googlesheet.prototype = {
    load : function(callback) {
        Tabletop.init({
            key : this.conf.id,
            simpleSheet : true,
            callback : callback
        });
    }
};

module.exports = Googlesheet;