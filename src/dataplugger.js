var plugDefs = {
    'jsonget' : require('./plugdefs/jsonget.js'),
    'csvget'  : require('./plugdefs/csvget.js')
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

    listPlugDefs : function() {
        return Object.keys(this.plugDefs);
    },

    loadData : function(callback) {
        if (!this.defaultPlug) {
            throw new Error("No default plug set");
        }

        var plugId = this.defaultPlug;

        if (!this.plugs[plugId]) {
            throw new Error("Plug " + this.defaultPlug + " not added");
        }

        if (!this.plugDefs[plugId]) {
            throw new Error("Plug " + this.defaultPlug + " not available");
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