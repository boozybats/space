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

Mechanics.prototype.collide = function(items) {
    var collisions = [];
    this.each(cluster => {
        cluster.each(item0 => {
            var collider = item0.collider;
            if (collider) {
                // Check current collider with all sended colliders on collision
                for (var i = 0; i < items.length; i++) {
                    var item = items[i];
                    if (collider.checkCollision(item.collider)) {
                        cross(item0, item);
                    }
                }
            }
        });
    });

    function cross(item0, item1) {
        item0.destroy('explosion');
        item1.destroy('explosion');
    }
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
            callback(cluster);
        });
    }
}

Mechanics.prototype.update = function(options = {}) {
    // Store colliders to send them ALL in each cluster and check collision
    var items = [];

    // Update stream functions like physic.onupdate, rigidbody.onupdate
    this.each(cluster => {
        cluster.streamUpdate(options);

        cluster.each(item => {
            var collider = item.collider;
            if (collider) {
                collider.defineProperties({
                    center: amc('*', item.body.mvmatrix(), Vec4.homogeneousPos).toCartesian(),
                    diameter: item.physic.diameter
                });

                items.push(item);
            }
        });
    });

    this.collide(items);
}

module.exports = Mechanics;

var math = require('../engine/math');
var amc = math.amc;
var logger = require('../engine/logger');
var Storage = require('../engine/storage');
var v = require('../engine/vector');
var Vec4 = v.Vec4;
