const Matter = require('./matter');

class Physic {
	constructor({
		matter
	}) {
		this.initMatter(matter);
	}

	initMatter(matter) {
		this.matter = new Matter(matter);
	}

	toJSON() {
		var out = {};

		if (this.matter) {
			out.matter = this.matter.data;
		}

		return out;
	}
}

module.exports = Physic;
