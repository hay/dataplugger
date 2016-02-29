// Note: if you want to use this in the browser,
// use dataplugger.browser.js or dataplugger.browser.min.js

var plugDefs = {
    'jsonget'     : require('./src/plugdefs/jsonget'),
    'csvget'      : require('./src/plugdefs/csvget'),
    'fieldbook'   : require('./src/plugdefs/fieldbook'),
    'googlesheet' : require('./src/plugdefs/googlesheet'),
    'googledoc'   : require('./src/plugdefs/googledoc')
};

function Dataplugger(plugs) {
    this.defaultPlug = null;
    this.plugs = {};
    this.plugDefs = plugDefs;

    if (typeof plugs === 'object') {
        // If there are some plugs, add them
        for (var id in plugs) {
            this.addPlug(id, plugs[id]);
        }
    }
}

Dataplugger.prototype = {
    addPlug : function(id, data) {
        this.plugs[id] = data;
    },

    getDefaultPlug : function() {
        return this.defaultPlug;
    },

    listPlugDefs : function() {
        return Object.keys(this.plugDefs);
    },

    load : function(plugidOrCallback, iCallback) {
        var plugId, callback;

        // One argument
        if (!callback && !this.defaultPlug) {
            throw new Error("No default plug set");
        }

        if (iCallback) {
            plugId = plugidOrCallback;
            callback = iCallback;
        } else {
            plugId = this.defaultPlug;
            callback = plugidOrCallback;
        }

        if (!this.plugs[plugId]) {
            throw new Error("Plug " + plugId + " not added");
        }

        if (!this.plugDefs[plugId]) {
            throw new Error("Plug " + plugId + " not available");
        }

        var plugConf = this.plugs[plugId];
        var plugDef = this.plugDefs[plugId];
        var plug = new plugDef(plugConf);

        plug.load(callback);
    },

    setDefaultPlug : function(id) {
        if (!this.plugDefs[id]) {
            throw new Error("Plug does not exist: " + id)
        }

        this.defaultPlug = id;
    }
}

module.exports = Dataplugger;

if (process.browser) {
    window.Dataplugger = Dataplugger;
}