function Generator() {
    this.generatedID = [];
}

Generator.prototype.clearID = function(id) {
    var index = this.generatedID.indexOf(id);
    if (~index) {
        this.generatedID.splice(index, 1);
    }
}

Generator.prototype.generateID = function() {
    var key = Math.trunc(Math.random() * 8e+13 + 1e+13);
    if (~this.generatedID.indexOf(key)) {
        return this.generateID();
    } else {
        this.generatedID.push(key);
        return key;
    }
}

Generator.prototype.getPosition = function(options = {}) {
    if (typeof options !== 'object') {
        logger.warn('Generator#getPosition', 'options', options);
        options = {};
    }

    var area = consts.AREA_SIZES[options.level];
    var width = area[0],
        height = area[1];

    var position = new Vec3(Math.random() * width - width / 2, Math.random() * height - height / 2, 0);

    return position;
}

Generator.prototype.getVolume = function(options = {}) {
    if (typeof options !== 'object') {
        logger.warn('Generator#getVolume', 'options', options);
        options = {};
    }

    var r = Math.random();

    var level = options.level;

    var size = options.npc ? consts.NPC_SIZES[level] : consts.PLAYER_SIZES[level];
    size = size[0] + r * (size[1] - size[0]);

    return size;
}

module.exports = Generator;

var logger = require('../engine/logger');
var consts = require('./constants');
var v = require('../engine/vector');
var Vec3 = v.Vec3;
