// Contains all items for player wrap
function Cluster(options = {}) {
    if (typeof options !== 'object') {
        logger.warn('Cluster', 'options', options);
        options = {};
    }

    this.id = options.id || -1;
    this.instanceTime = options.instanceTime || 0;

    this.status = 'alive';
    this.handlers = {};
}

Object.defineProperties(Cluster.prototype, {
    destroyTime: {
        get: function() {
            return this.destroyTime_;
        },
        set: function(val) {
            if (typeof val !== 'number') {
                logger.warn('Cluster#destroyTime', 'val', val);
                val = 0;
            }

            this.destroyTime_ = val;
        }
    },
    id: {
        get: function() {
            return this.id_;
        },
        set: function(val) {
            if (typeof val !== 'number' && typeof val !== 'string') {
                logger.warn('Cluster#id', 'val', val);
                val = -1;
            }

            this.id_ = val;
        }
    },
    instanceTime: {
        get: function() {
            return this.instanceTime_;
        },
        set: function(val) {
            if (typeof val !== 'number') {
                logger.warn('Cluster#instanceTime', 'val', val);
                val = 0;
            }

            this.instanceTime_ = val;
        }
    },
    item: {
        get: function() {
            return this.item_;
        },
        set: function(val) {
            // Main item in cluster, if it destoyed then destroy all items in cluster
            if (val && !(val instanceof Heaven)) {
                logger.warn('Cluster#item', 'val', val);
                return;
            }

            if (this.item) {
                this.item.detachEvent(this.handlers.itemDestroy);
            }

            if (val) {
                var self = this;
                this.handlers.itemDestroy = val.attachEvent('destroy', method => {
                    self.destroyTime = val.destroyTime;
                    self.status = method;
                });
            }

            this.item_ = val;
        }
    },
    sector: {
        get: function() {
            return this.sector_;
        },
        set: function(val) {
            if (val && !(val instanceof Sector)) {
                logger.warn('Cluster#sector', 'val', val);
                val = undefined;
            }

            this.sector_ = val;
        }
    }
});

// Removes items in cluster
Cluster.prototype.clear = function(method) {
    if (this.item) {
        this.item = undefined;
    }
}

Cluster.prototype.destroy = function(method) {
    if (this.item) {
        this.item.destroy(method);
    }
}

// Sorts all items by property in cluster and sends to callback
Cluster.prototype.each = function(callback) {
    if (typeof callback !== 'function') {
        logger.warn('Cluster#each', 'callback', callback);
        return;
    }

    if (this.item) {
        callback(this.item);
    }
}

Cluster.prototype.isReady = function() {
    return !!(typeof this.id === 'number' && this.item);
}

// Sets changes to items by distribution answer
Cluster.prototype.setChanges = function(properties, time) {
    if (this.item && properties.item) {
        this.item.setChanges(properties.item, time);
    }
}

// Updates stream for all items in cluster
Cluster.prototype.streamUpdate = function(options) {
    if (typeof options !== 'object') {
        logger.warn('Cluster#streamUpdate', 'options', options);
        options = {};
    }

    if (this.item) {
        this.item.streamUpdate(options);
    }
}

Cluster.prototype.toJSON = function(callback) {
    var out = {};

    out.id = this.id || -1;
    out.nick = this.nick || '';
    out.status = this.status;

    var json;
    if (this.item) {
        json = this.item.toJSON();
        out.item = typeof callback === 'function' ? callback(json) : json;
    }

    return out;
}

module.exports = Cluster;

var logger = require('../engine/logger');
var Heaven = require('./heaven');
var Generator = require('./generator');
var Sector = require('./sector');