/*
	avg    - average
	layer  - function for layer
	pure   - without force
*/

/*
	D  - diameter
	h  - height
	l  - distance
	M  - molar mass
	m  - mass
	p  - density
	R  - radius
	V  - volume
*/

const G = 6.6738480 * Math.pow(10, -11);
const LAYERS_COUNT = 1000;
const PRESSURE_TEMPERATURE_CONST = 6669090909090;

var PeriodicTable = {
	Fe: {
		M: 55.845,
		p: 7874
	},
	Mg: {
		M: 24.305,
		p: 1738
	},
	Ni: {
		M: 58.6934,
		p: 8902
	},
	O: {
		M: 15.999,
		p: 1141
	},
	O2: {
		M: 31.998,
		p: 1141
	},
	S: {
		M: 32.06,
		p: 2070
	},
	Si: {
		M: 28.085,
		p: 2330
	}
};

class Phys {
	static gravity(m0, m1, l) {
		var out = G * ((m0 + m1) / Math.pow(l, 2));
		return out;
	}

	static layer_height(V0, V1 = 0) {
		var V = V0 + V1;
		var R = Math.pow(V / (4/3 * Math.PI), 1/3);
		var R1 = Math.pow(V1 / (4/3 * Math.PI), 1/3);
		var out = R - R1;
		return out;
	}

	static layer_volume(h, R = 0) {
		var l = R + h;
		var V = 4/3 * Math.PI * Math.pow(l, 3);
		var V1 = 4/3 * Math.PI * Math.pow(R, 3);
		var out = V - V1;
		return out;
	}

	static inf_lim(func, to = 999999) {
		var precision = 100;
		var x0 = 0;
		var x1 = to;
		var interval = (x1 - x0) / precision;

		var position = 0;
		var last;
		for (var i = x0; Math.abs(i) < Math.abs(x1); i += interval) {
			var res = func.call(this, i);
			if (last) {
				res > last ? position++ : position--;
			}
			last = res;
		}

		if (position > 1) {
			return '+inf';
		}
		else if (position < -1) {
			return '-inf';
		}
		else {
			return 0;
		}
	}

	static mass(p, V) {
		return p * V;
	}
};

class Item {
	constructor(options = {
		physic: {
			matter: {
				Fe: 37479066 * Math.pow(10, 13),
				Mg: 13756767 * Math.pow(10, 13),
				Ni: 2599704 * Math.pow(10, 13),
				O2: 31954695 * Math.pow(10, 13),
				S: 2058099 * Math.pow(10, 13),
				Si: 2058099 * Math.pow(10, 14)
			}
		}
	}) {
		if (typeof options == 'object') {
			this.initialize(options);
		}
	}

	initialize(options) {
		this.init_physic(options.physic);
	}

	init_physic(options) {
		this.physic_ = new Physic(options);
	}
}

class Physic {
	constructor(options = {}) {
		this.initialize(options);
	}

	get core() {
		var out = {
			status: 'liquid'
		};
	}

	Density(R) {
		var out = 0;

		var layers = this.layers;
		for (var layer of layers) {
			var radius = layer.radius + layer.height;
			if (radius >= R) {
				out = layer.density;
				break;
			}
		}

		return out;
	}

	get diameter() {
		var out = 0;

		var layers = this.layers;
		for (var layer of layers) {
			out += layer.height;
		}
		out *= 2;

		return out;
	}

	initialize(options) {
		this.init_matter(options.matter);
		this.pure_volume_ = this.matter_.volume;
	}

	init_matter(options) {
		this.matter_ = new Matter({
			matter: options
		});
	}

	get layers() {
		var out = this.matter_.layers;
		return out;
	}

	get mass() {
		var out = this.MassTotal();
		return out;
	}

	MassTotal(R = Infinity) {
		var out = 0;

		var layers = this.layers;
		for (var layer of layers) {
			var radius = layer.radius + layer.height;
			out += layer.mass;
			if (radius >= R) {
				break;
			}
		}

		return out;
	}

	Pressure(R) {
		var out = 0;

		var layers = this.layers;
		for (var layer of layers) {
			var radius = layer.radius + layer.height;
			if (radius >= R) {
				out = G * (this.MassTotal(R) * this.Density(R) / Math.pow(radius, 2));
				break;
			}
		}

		return out;
	}

	Temperature(R) {
		var out = 0;

		out = this.Pressure(R) * this.VolumeTotal(R) / PRESSURE_TEMPERATURE_CONST;

		return out;
	}

	get volume() {
		return this.pure_volume_;
	}

	VolumeTotal(R = Infinity) {
		var out = 0;

		var layers = this.layers;
		for (var layer of layers) {
			var radius = layer.radius + layer.height;
			out += layer.volume;
			if (radius >= R) {
				break;
			}
		}

		return out;
	}
}

class Matter {
	constructor(options = {}) {
		this.initialize(options);
	}

	add_substance(name, volume) {
		if (PeriodicTable[name]) {
			this.volume_ += volume;
			
			var item = {
				name: name,
				volume: volume
			};
			this.substances_.push(item);

			return item;
		}
	}

	initialize(options) {
		this.volume_ = 0;
		this.layers_ = [];
		this.substances_ = [];

		this.init_substances(options.matter);
		this.update_layers();
	}

	init_substances(options) {
		for (var i in options) {
			if (options.hasOwnProperty(i)) {
				this.add_substance(i, options[i]);
			}
		}
	}

	get layers() {
		return this.layers_;
	}

	get layer_height() {
		var R = Phys.layer_height(this.volume_);
		var out = R / LAYERS_COUNT;
		return out;
	}

	get sorted_substances() {
		var out = [];

		var substances = this.substances_;
		for (var substance of substances) {
			var name = substance.name;
			var volume = substance.volume;

			var item = {
				name: name,
				volume: volume
			};

			out.push(item);
		}

		out.sort(function(a, b) {
			if (PeriodicTable[a.name].p > PeriodicTable[b.name].p) {
				return -1;
			}
			else {
				return 1;
			}
		});

		return out;
	}

	update_layers() {
		var layers = [];
		var height = this.layer_height;
		var arr = this.sorted_substances;

		var self = this;
		;(function core(R = 0, index = 0) {
			var substance = arr[index];
			if (substance) {
				var Vs = substance.volume;
				var density = PeriodicTable[substance.name].p;

				var residue;
				var last = layers[layers.length - 1];
				if (last && last.max_V > last.volume) {
					var V = last.max_V - last.volume;
					residue = Vs - V;
					var volume = residue >= 0 ? V : V + residue;
					var p = (last.density + density) / 2;

					last.substances.push(substance.name);
					last.volume += volume;
					last.mass += Phys.mass(density, volume);
					last.density = p;
				}
				else {
					var V = Phys.layer_volume(self.layer_height, R);
					residue = Vs - V;
					var volume = residue >= 0 ? V : V + residue;

					var layer = {
						substances: [substance.name],
						max_V: V,
						volume: volume,
						mass: Phys.mass(density, volume),
						density: density,
						radius: R,
						height: height
					};

					layers.push(layer);
				}

				if (residue > 0) {
					substance.volume = residue;
					R += height;
				}
				else {
					substance.volume = 0;
					index++;
					if (residue == 0) {
						R += height;
					}
				}
				core(R, index);
			}
		})();

		this.layers_ = layers;
	}

	get volume() {
		return this.volume_;
	}
}
