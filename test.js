var FIELDBOOK_ID = '56d045681604e403002d08c5';
var JSON_EXAMPLE_URL = 'http://localhost/test/example.json';
var CSV_EXAMPLE_URL = 'http://localhost/git/vk/specials/2015/klimaat/app/data/bd.csv';
var GSHEET_ID = '1LADpWT_ugrxaIRjyR5rM0of1RoIMmbkMPaZj9f2X9lU';

if (typeof require === 'function') {
    var Dataplugger = require('./src/dataplugger');
}

var dataplugger = new Dataplugger();

console.log(dataplugger.listPlugDefs());

dataplugger.addPlug('jsonget', {
    url : JSON_EXAMPLE_URL
});

dataplugger.addPlug('csvget', {
    url : CSV_EXAMPLE_URL
});

dataplugger.addPlug('fieldbook', {
    book : FIELDBOOK_ID
});

dataplugger.addPlug('googlesheet', {
    id : GSHEET_ID
});

dataplugger.setDefaultPlug('jsonget');

dataplugger.load((data) => {
    console.log('jsonget');
    console.log(data.length);
});

dataplugger.load('csvget', (data) => {
    console.log('csvget');
    console.log(data.length);
});

dataplugger.load('fieldbook', (data) => {
    console.log('fieldbook');
    console.log(Object.keys(data));
});

dataplugger.load('googlesheet', (data) => {
    console.log('googlesheet');
    console.log(data.length);
});