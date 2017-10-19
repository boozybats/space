function Map(arr) {
    if (!(arr instanceof Array)) {
        logger.error('Map', 'arr', arr);
        arr = [];
    }

    this.sectors_ = new Storage;

    for (var i = 0; i < arr.length; i++) {
        var sectors = arr[i];
        if (!(sectors instanceof Array)) {
            logger.error('Map', 'sectors', sectors);
            return;
        }

        for (var j = 0; j < sectors.length; j++) {
            var sector = sectors[j];
            this.setSector(new Sector(sector), j, i);
        }
    }
}

Object.defineProperties(Map.prototype, {
    sectors: {
        get: function() {
            return this.sectors_;
        }
    }
});

Map.prototype.findSpawn = function(cluster) {
    var sectors = this.sectors;

    var matches = sectors.find(sector => {
        return sector.spawn;
    });

    var rand = matches[Math.floor(Math.random() * (matches.length - 1e-6))];

    return rand;
}

Map.prototype.updateInSector = function(sector, cluster) {
    var self = this;
    var w = sector.width / 2,
        h = sector.height / 2;

    var item = cluster.item;
    var pos = item.body.position;

    var wp = sector.worldPosition;

    if (pos.x < -w || pos.x > w || pos.y < -h || pos.y > h) {
        var nsector, nx, ny;

        if (pos.x < -w && (nsector = findSector(0, wp.x, wp.y))) {
            nx = nsector.width / 2 + (pos.x + w);
            ny = Math.min(pos.y / h, 1) * nsector.height / 2;
        } else if (pos.x > w && (nsector = findSector(1, wp.x, wp.y))) {
            nx = -nsector.width / 2 + (pos.x - w);
            ny = Math.min(pos.y / h, 1) * nsector.height / 2;
        } else if (pos.y > h && (nsector = findSector(2, wp.x, wp.y))) {
            nx = Math.min(pos.x / w, 1) * nsector.width / 2;
            ny = -nsector.height / 2 + (pos.y - h);
        } else if (pos.y < -h && (nsector = findSector(3, wp.x, wp.y))) {
            nx = Math.min(pos.x / w, 1) * nsector.width / 2;
            ny = nsector.height / 2 + (pos.y + h);
        } else {
            var x = Math.max(Math.min(pos.x, w), -w),
                y = Math.max(Math.min(pos.y, h), -h);

            var shift = new Vec3(x - pos.x, y - pos.y, 0);

            cluster.each(item => {
                item.body.position = amc('+', item.body.position, shift);
            });

            return 0;
        }

        sector.removeCluster(cluster);
        nsector.addCluster(cluster);

        var shift = new Vec3(nx - pos.x, ny - pos.y, 0);

        cluster.each(item => {
            item.body.position = amc('+', item.body.position, shift);
        });
    } else {
        return 0;
    }

    return 1;

    // 0 - left, 1 - right, 2 - top, 3 - bottom
    function findSector(side, x, y) {
        var out;

        self.sectors.each(sector => {
            var wp = sector.worldPosition;

            switch (side) {
                case 0:
                    if (x > wp.x && y == wp.y) {
                        x = wp.x;
                        out = sector;
                    }

                    break;

                case 1:
                    if (x < wp.x && y == wp.y) {
                        x = wp.x;
                        out = sector;
                    }

                    break;

                case 2:
                    if (y > wp.y && x == wp.x) {
                        y = wp.y;
                        out = sector;
                    }

                    break;

                case 3:
                    if (y < wp.y && x == wp.x) {
                        y = wp.y;
                        out = sector;
                    }

                    break;
            }
        });

        return out;
    }
}

Map.prototype.removeSector = function(x, y) {
    var des = `${designate(x)}${y}`;
    this.sectors.remove(des);
}

Map.prototype.setSector = function(sector, x, y) {
    if (!(sector instanceof Sector)) {
        logger.warn('Map#setSector', 'sector', sector);
        return;
    }
    if (typeof x !== 'number') {
        logger.warn('Map#setSector', 'x', x);
        return;
    }
    if (typeof y !== 'number') {
        logger.warn('Map#setSector', 'y', y);
        return;
    }

    sector.worldPosition = {
        x: x,
        y: y
    };

    var des = `${designate(x)}${y}`;
    this.sectors.set(des, sector);
}

function designate(a) {
    var b = consts.DESIGNATIONS;
    var out = [];
    var l = b.length;
    var d = 1;
    while (d <= a) {
        var i = Math.trunc(a / d) % l;
        out.push(b[i]);
        d *= l;
    }
    out = out.reverse().join('');
    return out;
}

module.exports = Map;

var logger = require('../engine/logger');
var Storage = require('../engine/storage');
var consts = require('./constants');
var math = require('../engine/math');
var amc = math.amc;
var Sector = require('./sector');
var v = require('../engine/vector');
var Vec3 = v.Vec3;