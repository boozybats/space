function Spawner(options = {}) {
    if (typeof options !== 'object') {
        logger.warn('Spawner', 'options', options);
        options = {};
    }

    this.generator = options.generator;
    this.updater = options.updater;
    // How much npcs henerate by time
    this.count = options.count || consts.SPAWN_COUNT;
    this.interval = options.interval || consts.SPAWN_INTERVAL;
    this.lifetime = options.lifetime || consts.SPAWN_LIFETIME;

    this.handlers = {
        remove: []
    };

    var npcs = new Storage;
    npcs.filter = (data => data instanceof NPC);
    this.npcs_ = npcs;
}

Object.defineProperties(Spawner.prototype, {
    count: {
        get: function() {
            return this.count_;
        },
        set: function(val) {
            if (typeof val !== 'number') {
                logger.warn('Spawner#count', 'val', val);
                val = consts.SPAWN_COUNT;
            }

            this.count_ = val;
        }
    },
    generator: {
        get: function() {
            return this.generator_;
        },
        set: function(val) {
            if (!(val instanceof Generator)) {
                logger.warn('Spawner#generator', 'val', val);
                return;
            }

            this.generator_ = val;
        }
    },
    interval: {
        get: function() {
            return this.interval_;
        },
        set: function(val) {
            if (typeof val !== 'number') {
                logger.warn('Spawner#interval', 'val', val);
                val = consts.SPAWN_INTERVAL;
            }

            this.interval_ = val;
        }
    },
    lifetime: {
        get: function() {
            return this.lifetime_;
        },
        set: function(val) {
            if (typeof val !== 'number') {
                logger.warn('Spawner#lifetime', 'val', val);
                val = consts.SPAWN_LIFETIME;
            }

            this.lifetime_ = val;
        }
    },
    npcs: {
        get: function() {
            return this.npcs_;
        }
    },
    updater: {
        get: function() {
            return this.updater_;
        },
        set: function(val) {
            if (!(val instanceof Updater)) {
                logger.error('Spawner#updater', 'val', val);
                return;
            }

            this.updater_ = val;
        }
    }
});

Spawner.prototype.attachEvent = function(handler, callback) {
    if (typeof callback !== 'function') {
        logger.warn('Spawner#attachEvent', 'callback', callback);
        return;
    }
    if (!this.handlers[handler]) {
        logger.warnfree(`Spawner#attachEvent: unexpected handler, handler: ${handler}`);
        return;
    }

    return [handler, callback];
}

Spawner.prototype.checkExpiration = function(time) {
    var self = this;
    this.npcs.each((npc, ind, arr) => {
        if (npc.instanceTime + self.lifetime < time) {
            npc.remove();
            arr.splice(ind, 1);

            self.generator.clearID(npc.id);
        }
    });
}

Spawner.prototype.detachEvent = function(handler) {
    if (!(handler instanceof Array)) {
        logger.warn('Spawner#detachEvent', 'handler', handler);
        return;
    }

    var name = handler[0],
        callback = handler[1];

    var callbacks = this.handlers[name];
    var index = callbacks.indexOf(callback);

    callbacks.splice(index, 1);
}

Spawner.prototype.fireEvent = function(handler, args) {
    var handlers = this.handlers[handler];

    if (handlers) {
        for (var i = 0; i < handlers.length; i++) {
            handlers[i].apply(handlers[i], args);
        }
    }
}

Spawner.prototype.instance = function(level, time) {
    var npc = new NPC({
        generator: this.generator,
        instanceTime: time,
        level: level
    });

    this.npcs.push(npc);
}

Spawner.prototype.start = function() {
    var self = this;
    this.handler = this.updater.push(options => {
        self.update(options);
    });
}

Spawner.prototype.stop = function() {
    this.updater.remove(this.handler);
}

Spawner.prototype.update = function(options) {
    var time = options.time,
        deltaTime = options.deltaTime;

    // Remove items by life time and add event to distribution
    this.checkExpiration(time);

    if (this.lastupdate + this.interval > time) {
        return;
    }

    // Instance asteroids for each level
    for (var i = 0; i < consts.LEVELS; i++) {
        for (var j = 0; j < this.count; j++) {
            this.instance(i, time);
        }
    }

    this.lastupdate = time;
}

module.exports = Spawner;

var Storage = require('../engine/storage');
var consts = require('./constants');
var Updater = require('./updater');
var Generator = require('./generator');
var Heaven = require('./heaven');
var NPC = require('./npc');
