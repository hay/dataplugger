var plugDefs = {
    'jsonget'     : require('./plugdefs/jsonget'),
    'csvget'      : require('./plugdefs/csvget'),
    'fieldbook'   : require('./plugdefs/fieldbook'),
    'googlesheet' : require('./plugdefs/googlesheet')
};

function Dataplugger() {
    this.defaultPlug = null;
    this.plugs = {};
    this.plugDefs = plugDefs;
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