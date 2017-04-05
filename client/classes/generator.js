const area_sizes = [[Math.pow(10, 6), Math.pow(10, 6)]];
const npc_sizes = [[200000, 400000]];
const npc_speed = [[0.1, 0.2]];
const npc_substances = {
	'Tc': 0.005,
	'Pd': 0.005,
	'H': 0.01,
	'Cu': 0.01,
	'Ag': 0.01,
	'Pt': 0.01,
	'Au': 0.01,
	'P': 0.01,
	'Co': 0.01,
	'Ti': 0.01,
	'Cl': 0.02,
	'Ni': 0.02,
	'Pb': 0.02,
	'H2O': 0.03,
	'He': 0.03,
	'Mg': 0.03,
	'S': 0.04,
	'O': 0.05,
	'Si': 0.05,
	'Fe': 1
};
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
