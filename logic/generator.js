const info = require('./info');

var Generator = {
	npcPosition: function(lvl) {
		var area = info.area_sizes[lvl];
		var width = area[0],
			height = area[1];

		var position = [Math.random() * width - width / 2, Math.random() * height - height / 2, 0];

		return position;
	},
	npcVolume: function(lvl) {
		var r = Math.random();

		var size = info.npc_sizes[lvl];
		size = size[0] + r * (size[1] - size[0]);

		return size;
	},
	position: function(lvl) {
		var area = info.area_sizes[lvl];
		var width = area[0],
			height = area[1];

		var position = [Math.random() * width - width / 2, Math.random() * height - height / 2, 0];

		return position;
	},
	playerVolume: function(lvl) {
		var r = Math.random();

		var size = info.player_sizes[lvl];
		size = size[0] + r * (size[1] - size[0]);

		return size;
	}
};

module.exports = Generator;
