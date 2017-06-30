function Generator() {
	this.generatedID = [];
}

Generator.prototype.clearID = function() {
	var index = this.generatedID.indexOf(id);
	if (~index) {
		this.generatedID.splice(index, 1);
	}
}

Generator.prototype.generateID = function() {
	var key = Math.trunc(Math.random() * 8e+13 + 1e+13);
	if (~this.generatedID.indexOf(key)) {
		return this.generateID();
	}
	else {
		this.generatedID.push(key);
		return key;
	}
}

Generator.prototype.getPosition = function(lvl) {
    var area = constants.area_sizes[lvl];
    var width = area[0],
        height = area[1];

    var position = new Vec3(Math.random() * width - width / 2, Math.random() * height - height / 2, 0);

    return position;
}

Generator.prototype.getVolume = function(lvl) {
    var r = Math.random();

    var size = constants.player_sizes[lvl];
    size = size[0] + r * (size[1] - size[0]);

    return size;
}

module.exports = Generator;

var constants = require('./constants');
var v = require('../engine/vector');
var Vec3 = v.Vec3;
