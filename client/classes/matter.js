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
