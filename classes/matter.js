var Storage = require('./storage');

var PeriodicTable = {
	Fe: {
		M: 55.845,
		p: 7874,
		melting: 1812,
		boiling: 3135
	},
	Mg: {
		M: 24.305,
		p: 1738,
		melting: 924,
		boiling: 1363
	},
	Ni: {
		M: 58.6934,
		p: 8902,
		melting: 1726,
		boiling: 3005
	},
	O: {
		M: 15.999,
		p: 1141,
		melting: 54,
		boiling: 90
	},
	S: {
		M: 32.06,
		p: 2070,
		melting: 386,
		boiling: 717
	},
	Si: {
		M: 28.085,
		p: 2330,
		melting: 1683,
		boiling: 2623
	}
};

class Matter {
	constructor(substances) {
		this.volume_ = 0;

		var subs = new Storage;
		subs.filter = (data => typeof data === 'number');
		this.substances = subs;

		// Velocity versus diameter
		this.speedMultiplier = 0.4;

		if (typeof substances === 'object') {
			this.addSubstances(substances);
		}
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
			return;
		}

		for (var i in substances) {
			if (substances.hasOwnProperty(i)) {
				this.addSubstance(i, substances[i]);
			}
		}

		this.defineParameters();
	}

	get diameter() {
		return this.diameter_;
	}

	defineParameters() {
		this.radius_ = Math.pow(3 * this.volume / (4 * Math.PI), 1 / 3);
		this.diameter_ = this.radius * 2;
		/* Except calculation errors, when client multiplies number on vector
		it's can be an error */
		this.maxspeed_ = this.diameter * (this.speedMultiplier + Number.EPSILON);
	}

	get maxspeed() {
		return this.maxspeed_;
	}

	get radius() {
		return this.radius_;
	}

	toJSON() {
		return this.substances.toObject();
	}

	get volume() {
		return this.volume_;
	}
}

module.exports = Matter;
