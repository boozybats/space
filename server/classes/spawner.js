function Spawner(options = {}) {
    if (typeof options !== 'object') {
        logger.warn('Spawner', 'options', options);
        options = {};
    }

    this.generator = options.generator;
    this.updater = options.updater;
    // How much npcs henerate by time
    this.count = typeof options.count === 'number' ? options.count : consts.SPAWN_COUNT;
    this.interval = typeof options.interval === 'number' ? options.interval : consts.SPAWN_INTERVAL;
    this.lifetime = typeof options.lifetime === 'number' ? options.lifetime : consts.SPAWN_LIFETIME;

    this.events = {
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

Spawner.prototype.attachEvent = function(handlername, callback) {
    if (typeof callback !== 'function') {
        logger.warn('Spawner#attachEvent', 'callback', callback);
        return;
    }
    if (!this.events[handlername]) {
        logger.warnfree(`Spawner#attachEvent: unexpected handlername, handlername: ${handlername}`);
        return;
    }

    this.events[handlername].push(callback);

    return [handlername, callback];
}

Spawner.prototype.checkExpiration = function(time) {
    var self = this;
    this.npcs.each((npc, ind, arr) => {
        var endtime = npc.instanceTime + self.lifetime;
        if (endtime < time) {
            npc.destroy('collapsion', time);
        }

        if (typeof npc.destroyTime === 'number' && npc.destroyTime + consts.AFTERDEATH < time) {
            self.generator.clearID(npc.id);
            arr.splice(ind, 1);
        }
    });
}

Spawner.prototype.detachEvent = function(handler) {
    if (!(handler instanceof Array)) {
        return;
    }

    var handlername = handler[0],
        callback = handler[1];

    var event = this.events[handlername];
    if (event) {
        return;
    }

    event.splice(event.indexOf(callback), 1);
}

Spawner.prototype.fireEvent = function(handlername, args) {
    var events = this.events[handlername];

    if (events) {
        for (var i = 0; i < events.length; i++) {
            events[i].apply(events[i], args);
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