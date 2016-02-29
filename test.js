var FIELDBOOK_ID = '56d045681604e403002d08c5';
var JSON_EXAMPLE_URL = 'http://localhost/test/example.json';
var CSV_EXAMPLE_URL = 'http://localhost/git/vk/specials/2015/klimaat/app/data/bd.csv';
var GSHEET_ID = '1LADpWT_ugrxaIRjyR5rM0of1RoIMmbkMPaZj9f2X9lU';
var GDOC_ID = '1yov1-9_lZsy2rZIYO_0keSid5yQbol2KT0RF7LppxRE';

// Only load this in Node
if (typeof require === 'function') {
    var Dataplugger = require('./dataplugger');
}

// We can either add plugs in the constructor...
var dataplugger = new Dataplugger({
    'jsonget' : {
        url : JSON_EXAMPLE_URL
    },

    'csvget' : {
        url : CSV_EXAMPLE_URL
    },

    'fieldbook' : {
        book : FIELDBOOK_ID
    }
});

// Or later on
dataplugger.addPlug('googlesheet', {
    id : GSHEET_ID
});

dataplugger.addPlug('googledoc', {
    id : GDOC_ID
});

// Show all plug definitions
console.log(dataplugger.listPlugDefs());

// Set a default plug. This is something you can use to be dependent on
// an URL parameter
dataplugger.setDefaultPlug('jsonget');

// If default plug is set, that's used for the load method
dataplugger.load( function(data) {
    console.log('jsonget');
    console.log(data.length);
});

// But you can also specifiy it
dataplugger.load('csvget', function(data) {
    console.log('csvget');
    console.log(data.length);
});

dataplugger.load('fieldbook', function(data) {
    console.log('fieldbook');
    console.log(Object.keys(data));
});

dataplugger.load('googlesheet', function(data) {
    console.log('googlesheet');
    console.log(data.length);
});

dataplugger.load('googledoc', function(data) {
    console.log('googledoc');
    console.log(data.split('\n').length);
});