function Sector(options = {}) {
    if (typeof options !== 'object') {
        logger.warn('Sector', 'arr', arr);
        options = {};
    }

    this.width = options.width;
    this.height = options.height;
    this.spawn = options.spawn;

    this.npcs_ = new Storage;
    this.players_ = new Storage;
    this.lastUpdate = 0;
}

Object.defineProperties(Sector.prototype, {
    height: {
        get: function() {
            return this.height_;
        },
        set: function(val) {
            if (typeof val !== 'number') {
                logger.warn('Sector#height', 'val', val);
                val = 100;
            }

            this.height_ = val;
        }
    },
    lastUpdate: {
        get: function() {
            return this.lastUpdate_;
        },
        set: function(val) {
            if (typeof val !== 'number') {
                logger.warn('Sector#lastUpdate', 'val', val);
                return;
            }

            this.lastUpdate_ = val;
        }
    },
    npcs: {
        get: function() {
            return this.npcs_;
        }
    },
    players: {
        get: function() {
            return this.players_;
        }
    },
    spawn: {
        get: function() {
            return this.spawn_;
        },
        set: function(val) {
            if (val && typeof val !== 'object') {
                logger.warn('Sector#spawn', 'val', val);
                val = undefined;
            }

            this.spawn_ = val;
        }
    },
    width: {
        get: function() {
            return this.width_;
        },
        set: function(val) {
            if (typeof val !== 'number') {
                logger.warn('Sector#width', 'val', val);
                val = 100;
            }

            this.width_ = val;
        }
    },
    worldPosition: {
        get: function() {
            return this.worldPosition_;
        },
        set: function(val) {
            if (typeof val !== 'object') {
                logger.warn('Sector#worldPosition', 'val', val);
                val = 0;
            }

            this.worldPosition_ = val;
        }
    }
});

Sector.prototype.addCluster = function(cluster) {
    if (cluster instanceof Player) {
        var players = this.players;

        players.push(cluster);

        cluster.sector = this;
    } else if (cluster instanceof NPC) {
        var npcs = this.npcs;

        npcs.push(cluster);

        cluster.sector = this;
    }
}

Sector.prototype.defineDefaultCluster = function(generator, cluster) {
    var spawn = this.spawn;
    if (!spawn) {
        logger.warnfree(`Sector#defineDefaultCluster: the sector isnt spawn, sector: ${this}`);
        return;
    }

    var vec, volume, rigidbody;
    if (cluster instanceof Player) {
        vec = generator.getPosition(this.width, this.height);
        volume = generator.getVolume(spawn.playerSize[0], spawn.playerSize[1]);
    } else if (cluster instanceof NPC) {
        vec = generator.getPosition(this.width, this.height);
        volume = generator.getVolume(spawn.npcSize[0], spawn.npcSize[1]);
        rigidbody = new Rigidbody({
            speed: amc('*', generator.getVector(), Math.random() * volume),
            protozoa: true
        });
    } else {
        return;
    }

    var item = new Heaven({
        body: new Body({
            position: vec
        }),
        physic: new Physic({
            matter: new Matter({
                Fe: volume
            })
        }),
        rigidbody: rigidbody
    });

    cluster.item = item;
}

Sector.prototype.filterClusters = function(cluster, clusters) {
    var out = [];

    if (!cluster || !cluster.isReady()) {
        return out;
    }

    var item0 = cluster.item;

    var range = item0.physic.diameter * consts.VISION_RANGE;

    for (var i = 0; i < clusters.length; i++) {
        var cluster = clusters[i];

        if (!cluster.item) {
            continue;
        }

        var item1 = cluster.item;

        var pos = item1.body.position;
        pos = new Vec3(pos[0], pos[1], pos[2]);

        var length = amc('-', item0.body.position, pos).length() - item1.physic.diameter / 2;
        if (length <= range) {
            out.push(cluster);
        }
    }

    return out;
}

Sector.prototype.getData = function() {
    return {
        worldPosition: this.worldPosition,
        width: this.width,
        height: this.height
    };
}

Sector.prototype.removeCluster = function(cluster) {
    if (cluster instanceof Player) {
        var players = this.players;

        var index = players.indexOf(cluster);
        players.remove(index, 1);
    } else if (cluster instanceof NPC) {
        var npcs = this.npcs;

        var index = npcs.indexOf(cluster);
        npcs.remove(index, 1);
    }
}

module.exports = Sector;

var logger = require('../engine/logger');
var math = require('../engine/math');
var amc = math.amc;
var Storage = require('../engine/storage');
var Player = require('./player');
var NPC = require('./npc');
var Heaven = require('./heaven');
var Physic = require('../engine/physic');
var Matter = require('../engine/matter');
var Body = require('../engine/body');
var Rigidbody = require('../engine/rigidbody');