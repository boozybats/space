function Sector(options = {}) {
    if (typeof options !== 'object') {
        logger.warn('Sector', 'arr', arr);
        options = {};
    }

    this.width = options.width;
    this.height = options.height;
    this.isSpawn = options.isSpawn || false;

    this.npcs_ = new Storage;
    this.players_ = new Storage;
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
    isSpawn: {
        get: function() {
            return this.isSpawn_;
        },
        set: function(val) {
            if (typeof val !== 'boolean') {
                logger.warn('Sector#isSpawn', 'val', val);
                val = false;
            }

            this.isSpawn_ = val;
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
    }
});

Sector.prototype.addNpc = function(npc) {
    var npcs = this.npcs;

    npcs.push(npc);

    npc.sector = this;
}

Sector.prototype.addPlayer = function(player) {
    var players = this.players;

    players.push(player);

    player.sector = this;
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

module.exports = Sector;

var logger = require('../engine/logger');