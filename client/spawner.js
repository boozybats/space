;(function() {
	//constants
	const FPS = 1000 / 100;
	const npc_area = [[Math.pow(10, 4), Math.pow(10, 4)]];
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

	function matter(size) {
		var out = {};

		var length = 0;
		for (var i in npc_substances) {
			if (npc_substances.hasOwnProperty(i)) {
				var substance = npc_substances[i];
				var rand = Math.random();

				if (rand <= substance) {
					var percentage = rand / substance;
					out[i] = percentage;
					length += Math.pow(percentage, 2);
				}
			}
		}

		length = Math.sqrt(length);
		for (var i in out) {
			if (out.hasOwnProperty(i)) {
				out[i] = size * out[i] / length;
			}
		}

		return out;
	}

	function velocity(speed) {
		var out = [];

		var velocity = [Math.random() * 2 - 1, Math.random() * 2 - 1, 0];
		var length = Math.sqrt(Math.pow(velocity[0], 2) + Math.pow(velocity[1], 2));
		out[0] = speed * velocity[0] / length;
		out[1] = speed * velocity[1] / length;
		out[2] = 0;

		return out;
	}

	function position(width, height) {
		var position = [Math.random() * width - width / 2, Math.random() * height - height / 2, 0];

		return position;
	}

	function spawn({
		frequency = 5000,
		count     = 3,
		lifetime  = 20000,
		level     = 0,
		array,
		guid
	} = {}) {
		var lastdate,
			lastupdate = 0;
		setInterval(() => {
			var newdate = new Date().getTime();
			var delta = (newdate - (lastdate || newdate)) / 1000;
			lastdate = newdate;

			if (newdate - lastupdate >= frequency) {
				lastupdate = newdate;

				for (var i = 0; i < count; i++) {
					var r = Math.random();

					var size = npc_sizes[level];
					size = size[0] + r * (size[1] - size[0]);

					var speed = npc_speed[level];
					speed = speed[0] + r * (speed[1] - speed[0]);

					var area = npc_area[level];
					var width = area[0],
						height = area[1];

					var item = {
						expires: newdate + lifetime,
						matter: matter(size),
						position: position(width, height),
						velocity: velocity(speed)
					};

					var id = guid();
					array[id] = item;
				}
			}

			for (var id in array) {
				if (array.hasOwnProperty(id)) {
					var item = array[id];
					var expires = item.expires;

					if (expires <= newdate) {
						delete array[id];
					}
					else {
						var vel = item.velocity;
						if (vel) {
							var pos = item.position;
							item.position = [
								pos[0] + vel[0] * delta,
								pos[1] + vel[1] * delta,
								pos[2] + vel[2] * delta
							];
						}
					}
				}
			}
		}, FPS);
	}

	exports.spawn = spawn;
})();
