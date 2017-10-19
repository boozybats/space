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

Generator.prototype.getPosition = function(width, height) {
    var position = new Vec3(Math.random() * width - width / 2, Math.random() * height - height / 2, 0);

    return position;
}

Generator.prototype.getVolume = function(min, max) {
    var size = min + Math.random() * (max - min);

    return size;
}

Generator.prototype.getVector = function() {
    var vec = new Vec3(Math.random(), Math.random(), 0);

    return vec.normalize();
}

module.exports = Generator;

var logger = require('../engine/logger');
var consts = require('./constants');
var v = require('../engine/vector');
var Vec3 = v.Vec3;