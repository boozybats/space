function Mechanics(map) {
    if (!(map instanceof Map)) {
        logger.error('Mechanics', 'map', map);
        map = undefined;
    }

    this.map = map;
}

Object.defineProperties(Mechanics.prototype, {
    map: {
        get: function() {
            return this.map_;
        },
        set: function(val) {
            if (val && !(val instanceof Map)) {
                logger.warn('Mechanics#map', 'val', val);
                val = undefined;
            }

            this.map_ = val;
        }
    }
});

// Compares sended items colliders
Mechanics.prototype.collide = function(items, options) {
    var collisions = [];

    for (var i = 0; i < items.length; i++) {
        var item0 = items[i];
        var collider0 = item0.collider;

        for (var j = 0; j < items.length; j++) {
            var item1 = items[j];
            var collider1 = item1.collider;

            if (collider0.checkCollision(collider1)) {
                var option = collide(item0, item1, options);

                switch (option) {
                    case 0:
                        items.splice(j, 1);
                        break;

                    case 1:
                        items.splice(i, 1);
                        break;

                    case 2:
                        items.splice(i, 1);
                        items.splice(j, 1);
                        break;
                }
            }
        }
    }
}

function collide(item0, item1, options) {
    var time = options.time;

    var mass0 = item0.physic.mass,
        mass1 = item1.physic.mass;
    var option;

    var ratio = mass0 / mass1;
    if (ratio > consts.MAX_DESTROY_OVERWEIGHT) {
        item0.feed(item1);
        item1.destroy('explosion', time);

        option = 0;
    } else if (1 / ratio > consts.MAX_DESTROY_OVERWEIGHT) {
        item0.destroy('explosion', time);
        item1.feed(item0);

        option = 1;
    } else {
        item0.destroy('explosion', time);
        item1.destroy('explosion', time);

        option = 2;
    }

    return option;
}

Mechanics.prototype.each = function(callback) {
    this.clusters.each(callback);
}

Mechanics.prototype.interact = function(items, influes) {
    for (var i = 0; i < items.length; i++) {
        var item = items[i];

        for (var j = 0; j < influes.length; j++) {
            var influe = influes[j];

            if (item === influe) {
                continue;
            }

            item.rigidbody.externalities = interact(item, influe);
        }
    }
}

function interact(item0, item1) {
    var vec = new Vec3;

    var physic0 = item0.physic,
        physic1 = item1.physic;

    var dir = amc('-', item1.body.position, item0.body.position);
    var r = dir.length();
    var F = Physic.gravitation(physic0.mass, physic1.mass, r) / physic0.mass;
    vec = amc('+', vec, amc('*', dir.normalize(), F));

    return vec;
}

Mechanics.prototype.removeCluster = function(cluster) {
    var clusters = this.clusters;

    var index = clusters.indexOf(cluster);
    clusters.remove(index, 1);
}

Mechanics.prototype.update = function(options = {}) {
    // Store colliders to send them ALL in each cluster and check collisions
    var map = this.map;
    var sectors = map.sectors;

    var self = this;
    sectors.each(sector => {
        var players = process(sector, sector.players),
            npcs = process(sector, sector.npcs);

        self.collide(players.collider.concat(npcs.collider), options);
        self.interact(players.all.concat(npcs.all), players.influence.concat(npcs.influence));
    });

    function process(sector, clusters) {
        var out = {
            all: [],
            collider: [],
            influence: []
        };

        clusters.each(cluster => {
            cluster.streamUpdate(options);

            // checks is cluster in sector boundaries, if not then changes sector
            if (map.updateInSector(sector, cluster)) {
                return;
            }

            var type = cluster instanceof Player ? 0 : 1;

            cluster.each(item => {
                if (!item.enabled) {
                    return;
                }

                out.all.push(item);

                var collider = item.collider;
                if (collider) {
                    // Update sphere center position of collider and diameter
                    collider.defineProperties({
                        center: amc('*', item.body.mvmatrix(), Vec4.homogeneousPos).toCartesian(),
                        diameter: item.physic.diameter
                    });

                    out.collider.push(item);
                }

                if (item.physic && type === 0) {
                    out.influence.push(item);
                }
            });
        });

        return out;
    }
}

module.exports = Mechanics;

var consts = require('./constants');
var math = require('../engine/math');
var amc = math.amc;
var logger = require('../engine/logger');
var Storage = require('../engine/storage');
var v = require('../engine/vector');
var Vec3 = v.Vec3;
var Vec4 = v.Vec4;
var Map = require('./map');
var NPC = require('./npc');
var Player = require('./player');
var Physic = require('../engine/physic');