var available_substances = ['Fe', 'Mg', 'Ni', 'O', 'S', 'Si'];

class Matter {
	constructor(substances) {
		this.substances = substances;
	}

	get substances() {
		return this.substances_;
	}
	set substances(val) {
		if (typeof val !== 'object') {
			this.substances_ = [];
		}
		
		this.substances_ = val;
	}
}

module.exports = Matter;
