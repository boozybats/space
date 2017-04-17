class Physic {
	constructor({
		matter = new Matter
	}) {
		this.matter = matter;
	}

	get matter() {
		return this.matter_;
	}
	set matter(val) {
		if (!(val instanceof Matter)) {
			val = new Matter;
		}

		this.matter_ = val;
	}

	get maxspeed() {
		return this.matter.maxspeed;
	}

	toJSON() {
		var out = {};

		if (this.matter) {
			out.matter = this.matter.toJSON();
		}

		return out;
	}
}

module.exports = Physic;

const Matter = require('./matter');
