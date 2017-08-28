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
        return sector.isSpawn;
    });

    var rand = Math.floor(matches.length - Number.EPSILON);

    return rand;
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
var Sector = require('./sector');