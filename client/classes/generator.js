const area_sizes = [[Math.pow(10, 6), Math.pow(10, 6)]];
const player_sizes = [[40 * Math.pow(10, 5), 50 * Math.pow(10, 5)]];

var Generator = {
	playerPosition: function(lvl) {
		var area = area_sizes[lvl];
		var width = area[0],
			height = area[1];

		var position = [Math.random() * width - width / 2, Math.random() * height - height / 2, 0];

		return position;
	},
	playerSize: function(lvl) {
		var r = Math.random();

		var size = player_sizes[lvl];
		size = size[0] + r * (size[1] - size[0]);

		return size;
	}
};

module.exports = Generator;
