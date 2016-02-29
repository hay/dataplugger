var http = require('../http');
var async = require('async');

const FIELDBOOK_ENDPOINT = 'https://api.fieldbook.com/v1/';

function Fieldbook(conf) {
    this.conf = conf;
}

Fieldbook.prototype = {
    load : function(callback) {
        var bookUrl = FIELDBOOK_ENDPOINT + this.conf.book;

        function getSheet(sheet, cb) {
            var url = bookUrl + '/' + sheet;

            http.getJson(url, (data) => {
                cb(null, {
                    sheet : sheet,
                    data : data
                });
            });
        }

        http.getJson(bookUrl, (sheets) => {
            async.map(sheets, getSheet, (err, results) => {
                var book = {};

                results.forEach((sheet) => {
                    book[sheet.sheet] = sheet.data;
                });

                callback(book);
            });
        });
    }
}

module.exports = Fieldbook;