function Mechanics(options = {}) {
    if (typeof options !== 'object') {
        logger.warn('Mechanics', 'options', options);
        options = {};
    }

    this.storages_ = options.storages;
}

Object.defineProperties(Mechanics.prototype, {
    storages: {
        get: function() {
            return this.storages_;
        }
    }
});

// Compares sended items colliders
Mechanics.prototype.allcollide = function(items, time) {
    var collisions = [];
    for (var i = 0; i < items.length; i++) {
        var item0 = items[i];
        var collider0 = item0.collider;

        for (var j = 0; j < items.length; j++) {
            var item1 = items[j];
            var collider1 = item1.collider;

            if (collider0.checkCollision(collider1)) {
                var option = this.collide(item0, item1, time);

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

Mechanics.prototype.collide = function(item0, item1, time) {
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
    var storages = this.storages;

    for (var i in storages) {
        if (!storages.hasOwnProperty(i)) {
            continue;
        }

        var storage = storages[i];

        if (!(storage instanceof Storage)) {
            continue;
        }

        storage.each(cluster => {
            if (cluster.isReady()) {
                callback(cluster, i);
            }
        });
    }
}

Mechanics.prototype.interaction = function(items, influe) {
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        for (var j = 0; j < influe.length; j++) {
            if (item === influe[j]) {
                continue;
            }

            item.rigidbody.externalities = interaction(items[i], influe[j]);
        }
    }
}

function interaction(item0, item1) {
    var vec = new Vec3;

    var physic0 = item0.physic,
        physic1 = item1.physic;

    var dir = amc('-', item1.body.position, item0.body.position);
    var r = dir.length();
    var F = Physic.gravitation(physic0.mass, physic1.mass, r) / physic0.mass;
    vec = amc('+', vec, amc('*', dir.normalize(), F));

    return vec;
}

Mechanics.prototype.update = function(options = {}) {
    // Store colliders to send them ALL in each cluster and check collision
    var items = [];
    var influe = [];

    // Update stream functions like physic.onupdate, rigidbody.onupdate
    this.each((cluster, type) => {
        cluster.streamUpdate(options);

        cluster.each(item => {
            if (!item.enabled) {
                return;
            }

            var collider = item.collider;
            if (collider) {
                // Update sphere center position of collider and diameter
                collider.defineProperties({
                    center: amc('*', item.body.mvmatrix(), Vec4.homogeneousPos).toCartesian(),
                    diameter: item.physic.diameter
                });

                items.push(item);

                if (type === 'players') {
                    influe.push(item);
                }
            }
        });
    });

    // check on collision all items
    this.allcollide(items, options.time);
    // make optional physic calculations by influence items
    this.interaction(items, influe);
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
var Physic = require('../engine/physic');