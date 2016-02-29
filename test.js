var JSON_EXAMPLE_URL = 'https://en.wikipedia.org/w/api.php?action=query&list=random&rnnamespace=0&rnlimit=1&format=json';
var Dataplugger = require('./src/dataplugger.js');
var dataplugger = new Dataplugger();

console.log(dataplugger.listPlugDefs());

dataplugger.addPlug('jsonget', {
    'url' : JSON_EXAMPLE_URL
});

dataplugger.setDefaultPlug('jsonget');

dataplugger.loadData((data) => {
    console.log(data);
});