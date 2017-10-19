function Spawner(options = {}) {
    if (typeof options !== 'object') {
        logger.warn('Spawner', 'options', options);
        options = {};
    }

    this.generator = options.generator;
    this.updater = options.updater;
    this.map = options.map;

    this.events = {
        instance: [],
        remove: []
    };
}

Object.defineProperties(Spawner.prototype, {
    generator: {
        get: function() {
            return this.generator_;
        },
        set: function(val) {
            if (!(val instanceof Generator)) {
                logger.error('Spawner#generator', 'val', val);
                return;
            }

            this.generator_ = val;
        }
    },
    map: {
        get: function() {
            return this.map_;
        },
        set: function(val) {
            if (!(val instanceof Map)) {
                logger.error('Spawner#map', 'val', val);
                return;
            }

            this.map_ = val;
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

Spawner.prototype.instance = function(sector, time) {
    var generator = this.generator;

    var npc = new NPC({
        id: generator.generateID(),
        instanceTime: time
    });

    sector.addCluster(npc);
    sector.defineDefaultCluster(generator, npc);

    this.fireEvent('instance', [npc]);
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

    this.map.sectors.each(sector => {
        this.updateSector(sector, time);
    });
}

Spawner.prototype.updateSector = function(sector, time) {
    var spawn = sector.spawn;

    if (spawn) {
        if (sector.lastUpdate + spawn.interval <= time) {
            for (var i = 0; i < spawn.count; i++) {
                this.instance(sector, time);
            }

            sector.lastUpdate = time;
        }

        var self = this;
        sector.npcs.each((npc, ind, arr) => {
            var endtime = npc.instanceTime + spawn.lifetime;
            if (endtime < time) {
                npc.destroy('collapsion', time);
            }

            if (typeof npc.destroyTime === 'number' && npc.destroyTime + consts.AFTERDEATH < time) {
                self.generator.clearID(npc.id);
                sector.removeCluster(npc);
            }
        });
    }
}

module.exports = Spawner;

var logger = require('../engine/logger');
var consts = require('./constants');
var Storage = require('../engine/storage');
var Updater = require('./updater');
var Generator = require('./generator');
var Heaven = require('./heaven');
var NPC = require('./npc');
var Map = require('./map');