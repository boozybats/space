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

Generator.prototype.npcPosition = function(lvl) {
    var area = info.area_sizes[lvl];
    var width = area[0],
        height = area[1];

    var position = [Math.random() * width - width / 2, Math.random() * height - height / 2, 0];

    return position;
}

Generator.prototype.npcVolume = function(lvl) {
    var r = Math.random();

    var size = info.npc_sizes[lvl];
    size = size[0] + r * (size[1] - size[0]);

    return size;
}

Generator.prototype.position = function(lvl) {
    var area = info.area_sizes[lvl];
    var width = area[0],
        height = area[1];

    var position = [Math.random() * width - width / 2, Math.random() * height - height / 2, 0];

    return position;
}

Generator.prototype.playerVolume = function(lvl) {
    var r = Math.random();

    var size = info.player_sizes[lvl];
    size = size[0] + r * (size[1] - size[0]);

    return size;
}

module.exports = Generator;
