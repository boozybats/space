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
    this.events = {
        afterSend: [],
        beforeClientSend: [],
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
                val = 20;
            }

            this.maxrate_ = val;
            this.maxrateTime = 1000 / val;
        }
    },
    minrate: {
        get: function() {
            return this.minrate_;
        },
        set: function(val) {
            if (typeof val !== 'number') {
                logger.warn('Distribution#minrate', 'val', val);
                val = 1;
            }

            this.minrate_ = val;
            this.minrateTime = 1000 / val;
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

Distribution.prototype.attachEvent = function(handlername, callback) {
    if (typeof callback !== 'function') {
        logger.warn('Distribution#attachEvent', 'callback', callback);
        return;
    }
    if (!this.events[handlername]) {
        logger.warnfree(`Distribution#attachEvent: unexpected handler, handler: ${handler}`);
        return;
    }

    this.events[handlername].push(callback);

    return [handlername, callback];
}

Distribution.prototype.detachEvent = function(handler) {
    if (!(handler instanceof Array)) {
        return;
    }

    var handlername = handler[0],
        callback = handler[1];

    var event = this.events[handlername];
    if (!event) {
        return;
    }

    event.splice(event.indexOf(callback), 1);
}

Distribution.prototype.fireEvent = function(handlername, args) {
    var events = this.events[handlername];

    if (events) {
        for (var i = 0; i < events.length; i++) {
            events[i].apply(events[i], args);
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

    var deltaTime = options.deltaTime || 0,
        time = options.time;

    var isDistribute = client.checkOnDistribution(deltaTime);
    if (isDistribute) {
        var out = {};

        this.fireEvent('beforeClientSend', [client, out]);

        client.distribute(out, time, this.minrateTime, this.maxrateTime);
    }
}

Distribution.prototype.setInMemory = function(key, data) {
    this.memory.set(key, data);
}

Distribution.prototype.getFromMemory = function(key) {
    return this.memory.get(key);
}

Distribution.prototype.start = function() {
    var self = this;
    var stack;

    this.updater.push(() => {
        stack = self.pullMemory();
        self.fireEvent('beforeSend');
    }, 'start');

    this.updater.push(options => {
        options.stack = stack;
        self.send(options);
    }, 'clients');

    this.updater.push(() => {
        self.fireEvent('afterSend');
    }, 'end');
}

module.exports = Distribution;

var logger = require('../engine/logger');
var Storage = require('../engine/storage');
var Client = require('./client');
var Updater = require('./updater');