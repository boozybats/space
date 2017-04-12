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
	constructor(matter) {
		var n_matter = {};

		if (typeof matter === 'object') {
			for (var i in matter) {
				if (!matter.hasOwnProperty(i)) {
					continue;
				}

				if (this.addSubstance(i, matter[i])) {
					n_matter[i] = matter[i];
				}
			}
		}

		this.data = n_matter;
	}

	addSubstance(name, volume) {
		if (PeriodicTable[name]) {
			return true;
		}

		return false;
	}
}

module.exports = Matter;
