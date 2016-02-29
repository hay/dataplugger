var JSON_EXAMPLE_URL = 'http://localhost/test/example.json';
var CSV_EXAMPLE_URL = 'http://localhost/git/vk/specials/2015/klimaat/app/data/bd.csv';

if (typeof require === 'function') {
    var Dataplugger = require('./src/dataplugger');
}

var dataplugger = new Dataplugger();

console.log(dataplugger.listPlugDefs());

dataplugger.addPlug('jsonget', {
    'url' : JSON_EXAMPLE_URL
});

dataplugger.addPlug('csvget', {
    'url' : CSV_EXAMPLE_URL
})

dataplugger.setDefaultPlug('jsonget');

dataplugger.loadData((data) => {
    console.log('jsonget');
    console.log(data.length);
});

dataplugger.setDefaultPlug('csvget');

dataplugger.loadData((data) => {
    console.log('csvget');
    console.log(data.length);
});
