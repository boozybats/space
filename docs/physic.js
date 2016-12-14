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

//gravitational constant
const G = 6.6738480 * Math.pow(10, -11);
const layers_count = 100;

var PeriodicTable = {
	Fe: {
		M: 55.845,
		p: 7.874
	},
	Zn: {
		M: 64.38,
		p: 7.133
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

	static mass(p, V) {
		return p * V;
	}
};

class Item {
	constructor(options = {
		physic: {
			matter: {
				Fe: 800,
				Si: 200
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
	constructor(options = {
		matter: {
			Fe: 800,
			Si: 200
		}
	}) {
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
		for (var i of layers) {
			var layer = layers[i];

			var radius = layer.radius + layer.height;
			if (radius >= R) {
				out = layer.density;
				break;
			}
		}

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
		var out = this.Mass();
		return out;
	}

	MassTotal(R = Infinity) {
		var out = 0;

		var layers = this.layers;
		for (var i of layers) {
			var layer = layers[i];

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
		for (var i of layers) {
			var layer = layers[i];
			var radius = layer.radius + layer.height;
			if (radius >= R) {
				out = G * (this.MassTotal(R) * Density(R) / Math.pow(R, 2));
			}
		}

		return out;
	}

	Temperature(R) {

	}

	get volume() {
		
	}
}

class Matter {
	constructor(options = {
		matter: {
			Fe: 800
			Si: 200
		}
	}) {
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
		this.init_height();
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
		var out = R / layers_count;
		return out;
	}

	get sorted_substances() {
		var out = [];

		var substances = this.substances_;
		for (var name of substances) {
			if (options.hasOwnProperty(name)) {
				var volume = substances[name];
				var item = {
					name: name,
					volume: volume
				};

				out.push(item);
			}
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
		var height = this.layer_height_;
		var arr = this.sorted_substances;

		;(function core(R = 0, index = 0) {
			var substance = arr[index];
			if (substance) {
				var Vs = substance.volume;
				var density = PeriodicTable[substance.name].p;

				var residue;
				var last = layers[layers.length - 1];
				if (last && last.max_V < last.cur_V) {
					var V = last.max_V - last.cur_V;
					residue = Vs - V;
					var current_V = residue >= 0 ? V : V + residue;
					var p = (last.density + density) / 2;

					last.substances.push(substance.name);
					last.cur_V += current_V;
					last.mass += Phys.mass(density, current_V);
					last.density = p;
				}
				else {
					var V = Phys.layer_volume(this.layer_height, R);
					residue = Vs - V;
					var current_V = residue >= 0 ? V : V + residue;

					var layer = {
						substances: [substance.name]
						max_V: V,
						cur_V: current_V,
						mass: Phys.mass(density, current_V),
						density: density,
						radius: R,
						height: height
					};

					layers.push(layer);
				}

				if (residue > 0) {
					substance.volume = residue;
				}
				else {
					substance.volume = 0;
					index++;
				}
				core(R += height, index);
			}
		})();

		this.layers_ = layers;
	}

	get volume() {
		return this.volume_;
	}
}
