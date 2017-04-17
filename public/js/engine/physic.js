/**
 * Gravitational constant.
 * @type {Number}
 * @const
 */
const G = 6.6738480 * Math.pow(10, -11);
/**
 * How much layers must be in object.
 * @type {Number}
 * @const
 */
const LAYERS_COUNT = 1000;
/**
 * Constant for determining temperature (taken from Earth).
 * @type {Number}
 * @const
 */
const PRESSURE_TEMPERATURE_CONST = 6669090909090;
/**
 * Minimal radius from which start calculations.
 * @type {Number}
 * @const
 */
const CORE_MIN_RADIUS = 25;
/**
 * Normal pressure for planets like Earth.
 * @type {Number}
 * @const
 */
const NORMAL_PRESSURE = 101325;

var PeriodicTable = {
	Fe: {
		M: 55.845,
		p: 7874,
		melting: 1812,
		boiling: 3135,
		color: new Color(235, 233, 232, 1)
	},
	Mg: {
		M: 24.305,
		p: 1738,
		melting: 924,
		boiling: 1363,
		color: new Color(130, 130, 120, 1)
	},
	Ni: {
		M: 58.6934,
		p: 8902,
		melting: 1726,
		boiling: 3005,
		color: new Color(222, 222, 222, 1)
	},
	O: {
		M: 15.999,
		p: 1141,
		melting: 54,
		boiling: 90,
		color: new Color(10, 110, 255, 0.1)
	},
	S: {
		M: 32.06,
		p: 2070,
		melting: 386,
		boiling: 717,
		color: new Color(225, 220, 125, 1)
	},
	Si: {
		M: 28.085,
		p: 2330,
		melting: 1683,
		boiling: 2623,
		color: new Color(90, 110, 150, 1)
	}
};

class Phys {
	/**
	 * Returns gravity power between 2 bodies.
	 * @param {number} m0 Mass of first object
	 * @param {number} m1 Mass of second object
	 * @param {number} l Length (radius) between objects
	 * @return {number} F
	 */
	static gravity(m0, m1, l) {
		var out = G * ((m0 + m1) / Math.pow(l, 2));
		return out;
	}

	/**
	 * Returns layer height which volume starts on "V1"
	 * and ends on "V0". "V1" isn't end volume because it
	 * can be not selected.
	 * @param {number} V0 End volume
	 * @param {number} V1 Start volume
	 * @return {number} R
	 */
	static layerHeight(V0, V1 = 0) {
		var V = V0 + V1;
		var R = Math.pow(V / (4/3 * Math.PI), 1/3);
		var R1 = Math.pow(V1 / (4/3 * Math.PI), 1/3);
		var out = R - R1;
		return out;
	}

	/**
	 * Returns volume of layer which starts on "h" radius
	 * and ends on "R" radius.
	 * @param {number} h End radius
	 * @param {number} R Start radius
	 * @return {number} V
	 */
	static layerVolume(h, R = 0) {
		var l = R + h;
		var V = 4/3 * Math.PI * Math.pow(l, 3);
		var V1 = 4/3 * Math.PI * Math.pow(R, 3);
		var out = V - V1;
		return out;
	}

	/**
	 * Defines: decreasing or increasing function sended.
	 * @param {Function} func Check function
	 * @param {number} to End value to send as parameter
	 * @param {number} precision How much times check the function
	 * @return {string|number} 0 | +inf | -inf
	 */
	static infLim(func, to = 9999999, precision = 100) {
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
			return 1;
		}
		else if (position < -1) {
			return -1;
		}
		else {
			return 0;
		}
	}

	static mass(p, V) {
		return p * V;
	}
};

/**
 * Physic of object, generates diameter, pressure, temperature
 * and e.t.c by matter. Contains info about velocity, acceleration,
 * gravity power, etc.
 * Physic must have a matter because all parameters calculated relative
 * on this.
 *
 * D - diameter
 * F - force
 * h - height
 * l - distance
 * M - molar mass
 * m - mass
 * p - density
 * P - pascal
 * R - radius
 * V - volume
 *
 * @constructor
 * @this {Physic}
 *  {Body} this.body
 *  {Color} this.color
 *  {number} this.diameter
 *  {object} this.lastLayer
 * @param {object} matter Object with substances and value is volume
 * @param {Vec3} velocity Current speed direction vector for object
*/

class Physic {
	constructor({
		matter = new Matter
	} = {}) {
		this.matter = matter;
	}

	get color() {
		return this.matter.color;
	}

	get diameter() {
		return this.matter.diameter;
	}

	Density(R) {
		var out = 0;

		this.matter.each((layer, radius) => {
			if (radius >= R) {
				out = layer.density;
				return false;
			}
		});

		return out;
	}

	get mass() {
		return this.matter.mass;
	}

	Mass(R) {
		var out = 0;

		var self = this;
		this.matter.each((layer, radius) => {
			if (radius >= R) {
				var m0 = (radius - R) / layer.height * layer.mass;
				var sibling = self.matter.nextSibling(layer);
				var m1 = (sibling.height - sibling.radius + R) / sibling.height * sibling.mass;
				out = m0 + m1;
				return false;
			}
		});

		return out;
	}

	MassTotal(R = Infinity) {
		var out = 0;

		this.matter.each((layer, radius) => {
			if (radius >= R) {
				var approx = (R - layer.radius) / layer.height * layer.mass;
				out += approx;
				return false;
			}
			else {
				out += layer.mass;
			}
		});

		return out;
	}

	get matter() {
		return this.matter_;
	}
	set matter(val) {
		if (!(val instanceof Matter)) {
			throw new Error('Physic: matter: must be a Matter');
		}

		this.matter_ = val;
	}

	get maxspeed() {
		return this.matter.maxspeed;  // in second
	}

	Pressure(R) {
		var out = 0;

		var self = this;
		this.matter.each((layer, radius) => {
			if (radius >= R) {
				out = G * (self.MassTotal(R) * self.Density(R) / Math.pow(R, 2));
				return false;
			}
		});

		return out;
	}

	Temperature(R) {
		var out = 0;
		out = this.Pressure(R) * this.VolumeTotal(R) / PRESSURE_TEMPERATURE_CONST;
		return out;
	}

	toJSON() {
		var out = {};

		out.matter = this.matter.toJSON();

		return out;
	}

	get volume() {
		return this.matter.volume;
	}

	VolumeTotal(R = Infinity) {
		var out = 0;

		this.matter.each((layer, radius) => {
			out += layer.volume;
			if (radius >= R) {
				return false;
			}
		});

		return out;
	}
}

/**
 * Matter creates layers by substances added or removed from it.
 * @constructor
 */

class Matter {
	constructor(substances) {
		this.volume_ = 0;
		this.layers_ = [];

		var subs = new Storage;
		subs.filter = (data => typeof data === 'number');
		this.substances = subs;

		this.addSubstances(substances);
	}

	/**
	 * Add a single substance to matter by name and volume. Usualy are called
	 * by "addSubstances".
	 * @param {String} name
	 * @param {Number} volume
	 */
	addSubstance(name, volume) {
		var periodic = PeriodicTable[name];
		if (!periodic) {
			return false;
		}

		this.volume_ += volume;

		var o_volume = this.substances.get(name);
		if (typeof o_volume === 'undefined') {
			this.substances.set(name, volume);
		}
		else {
			this.substances.set(name, o_volume + volume);
		}

		return true;
	}

	/**
	 * Adds substances to matter and then calls "updateLayers".
	 * @param {Object} substances
	 */
	addSubstances(substances) {
		if (typeof substances !== 'object') {
			substances = {};
		}

		for (var i in substances) {
			if (substances.hasOwnProperty(i)) {
				this.addSubstance(i, substances[i]);
			}
		}

		this.updateLayers();
		this.defineParameters();
	}

	get color() {
		return this.color_;
	}

	/**
	 * Sets important parameters.
	 */
	defineParameters() {
		var last = this.lastLayer;

		if (last) {
			var substance = last.substances[last.substances.length - 1];
			this.color_ = PeriodicTable[substance].color;
		}
		else {
			this.color_ = undefined;
		}


		this.radius_ = Math.pow(3 * this.volume / (4 * Math.PI), 1 / 3);
		this.diameter_ = this.radius * 2;
		this.maxspeed_ = this.diameter * 0.4;
	}

	get diameter() {
		return this.diameter_;
	}

	/**
	 * Goes through all layers and sends to callback a layer and layer's radius,
	 * if callback returns false then stops cycling.
	 * @param  {Function} callback
	 */
	each(callback) {
		if (typeof callback !== 'function') {
			console.warn('Matter: each: "callback" must be a function');
			return;
		}

		var layers = this.layers;
		for (var i = 0; i < layers.length; i++) {
			var layer = layers[i];

			var radius = layer.radius + layer.height;
			var result = callback(layer, radius);

			if (result === false) {
				break;
			}
		}
	}

	/**
	 * Returns sorted array of substances by density in decreasing order.
	 * @return {Array}
	 */
	getSortedSubstances() {
		var out = [];

		var substances = this.substances;
		substances.each((volume, name) => {
			var item = {
				name: name,
				volume: volume
			};

			out.push(item);
		});

		out.sort(function(a, b) {
			if (PeriodicTable[a.name].p < PeriodicTable[b.name].p) {
				return 1;
			}
			else {
				return -1;
			}
		});

		return out;
	}

	get lastLayer() {
		return this.layers[this.layers.length - 1];
	}

	get layers() {
		return this.layers_;
	}

	/**
	 * How much height will be a one layer if layers count must be
	 * "lAYERS_COUNT" for matter's volume.
	 * @return {Number}
	 */
	layerHeight() {
		var R = Phys.layerHeight(this.volume);
		var out = R / LAYERS_COUNT;

		return out;
	}

	get mass() {
		return this.mass_;
	}

	get maxspeed() {
		return this.maxspeed_;
	}

	/**
	 * Returns next layer.
	 * @param  {Object} layer
	 * @return {Object}
	 */
	nextSibling(layer) {
		var out;
		var radius = layer.radius;

		var layers = this.layers_;
		var isNext = false;
		for (var layer of layers) {
			if (isNext) {
				out = layer;
				break;
			}
			else if (layer.radius == radius) {
				isNext = true;
			}
		}

		return out;
	}

	get radius() {
		return this.radius_;
	}

	toJSON() {
		return this.substances.toObject();
	}

	/**
	 * Sets layers by substances added or removed from matter.
	 * @method
	 */
	updateLayers() {
		var layers = [];
		var height = this.layerHeight();
		var substances = this.getSortedSubstances();

		// Sum all masses and define to matter
		var all_mass = 0;

		var self = this;
		;(function core(R = 0, index = 0) {
			var substance = substances[index];
			if (!substance) {
				return;
			}

			// Current substance volume and density
			var Vs = substance.volume;
			var p = PeriodicTable[substance.name].p;

			// Last instantiated layer from all layers
			var last = layers[layers.length - 1];
			var residue;

			/* If last layer haven't filled fully or layer doesn't exist
			than fill it with new substance */
			if (last && last.maxVolume > last.volume) {
				// Unfilled volume of layer
				var Vr = last.maxVolume - last.volume;

				// How much substance will remain if fill layer
				residue = Vs - Vr;

				/* Layer volume after filling it with substance, if residue
				bigger than 0 then layer's volume takes maximum value. */
				var V = residue >= 0 ? Vr : Vr + residue;

				// Add new substance to layer's matter
				last.substances.push(substance.name);

				// Average density of layer
				var avgP = 0;
				var subs = last.substances;
				for (var i = 0; i < subs.length; i++) {
					avgP += PeriodicTable(subs[i]).p;
				}
				avgP /= subs.length;
				last.density = avgP;

				// Add volume and mass to last layer
				last.volume += V;
				var mass = Phys.mass(p, Vs);
				last.mass += mass;
				all_mass += mass;
			}
			// If layers count is 0 or last layer is full
			else {
				// Maximum volume for layer with radius "R"
				var maxV = Phys.layerVolume(self.layerHeight(), R);

				// How much substance will remain if fill layer
				residue = Vs - maxV;

				/* Layer volume after filling it with substance, if residue
				bigger than 0 then layer's volume takes maximum value. */
				var V = residue >= 0 ? maxV : maxV + residue;

				// Define mass and substances matter for layer
				var mass = Phys.mass(p, Vs);
				all_mass += mass;
				var subs = [substance.name];

				// Make the layer and add to matter
				var layer = {
					substances: subs,
					maxVolume: maxV,
					volume: V,
					mass: mass,
					density: p,
					radius: R,
					height: height
				};
				layers.push(layer);
			}

			// If the substance remains then change volume value
			if (residue > 0) {
				substance.volume = residue;
				R += height;
			}
			// If substance has filled all layer then change on next
			else {
				substance.volume = 0;
				index++;

				/* If substance has filles a layer and this layer is full
				then go to next layer */
				if (residue == 0) {
					R += height;
				}
			}

			core(R, index);
		})();

		this.mass_ = all_mass;
		this.layers_ = layers;
	}

	get volume() {
		return this.volume_;
	}
}
