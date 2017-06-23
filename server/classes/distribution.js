function Distribution(updater, options = {}) {
    if (typeof options !== 'object') {
        logger.warn('Distribution', 'options', options);
        options = {};
    }

    this.updater = updater;

    // Minimal data rate update time for user
    this.minrate = options.minrate || 1;
    // How often times in second server can send data to clients
    this.maxrate = options.maxrate || 20;

    this.memory_ = new Storage;
    this.handlers = {
        beforeSend: []
    };
}

Object.defineProperties(Distribution.prototype, {
    maxrate: {
        get: function() {
            return this.maxrate_;
        },
        set: function(val) {
            if (typeof val !== 'number') {
                logger.warn('Distribution#maxrate', 'val', val);
                val = 1;
            }

            this.maxrate_ = val;
        }
    },
    minrate: {
        get: function() {
            return this.minrate_;
        },
        set: function(val) {
            if (typeof val !== 'number') {
                logger.warn('Distribution#minrate', 'val', val);
                val = 20;
            }

            this.minrate_ = val;
        }
    },
    memory: {
        get: function() {
            return this.memory_;
        }
    },
    updater: {
        get: function() {
            return this.updater_;
        },
        set: function(val) {
            if (!(val instanceof Updater)) {
                logger.warn('Distribution', 'updater', updater);
                val = new Updater;
            }

            this.updater_ = val;
        }
    }
});

Distribution.prototype.attachEvent = function(handler, callback) {
    if (typeof callback !== 'function') {
        logger.warn('Distribution#attachEvent', 'callback', callback);
        return;
    }
    if (!this.handlers[handler]) {
        logger.warnfree(`Distribution#attachEvent: unexpected handler, handler: ${handler}`);
        return;
    }

    var index = `${handler}_${this.handlers[handler].push(callback) - 1}`;

    return index;
}

Distribution.prototype.detachEvent = function(index) {
    if (typeof index !== 'string') {
        return;
    }

    var parsed = index.split('_');
    var handler = parsed[0],
        id = parsed[1];

    if (!this.handlers[handler]) {
        return;
    }

    this.handlers[handler].splice(id, 1);
}

Distribution.prototype.fireEvent = function(handler, args) {
    var handlers = this.handlers[handler];

    if (handlers) {
        for (var i = 0; i < handlers.length; i++) {
            handlers[i].apply(handlers[i], args);
        }
    }
}

Distribution.prototype.pullMemory = function() {
    var memory = this.memory.toObject();
    this.memory.clear();

    return memory;
}

Distribution.prototype.send = function(options) {
    if (typeof options !== 'object') {
        logger.warn('Distribution#send', 'options', options);
        return;
    }

    var client = options.data;
    if (!(client instanceof Client)) {
        logger.warn('Distribution#send', 'options.data', client);
        return;
    }

    var deltaTime = options.deltaTime || 0;

    var isDistribute = client.checkOnDistribution(deltaTime);
    if (isDistribute) {
        var lifetime = 1000 / this.minrate;
        client.distribute(options.stack, options.time, lifetime);
    }
}

Distribution.prototype.setInMemory = function(key, data) {
    this.memory.set(key, data);
}

Distribution.prototype.start = function() {
    var self = this;
    var stack;

    this.updater.push(() => {
        self.fireEvent('beforeSend');
        stack = self.pullMemory();
    }, 'start');

    this.updater.push(options => {
        options.stack = stack;
        self.send(options);
    }, 'clients');

    this.updater.push(() => {}, 'end');
}

module.exports = Distribution;

var logger = require('../engine/logger');
var Storage = require('../engine/storage');
var Client = require('./client');
var Updater = require('./updater');
