class Physic {
	constructor({
		matter
	}) {
		this.matter = matter;
	}

	get matter() {
		return this.matter_;
	}
	set matter(val) {
		if (val && !(val instanceof Matter)) {
			this.matter_ = new Matter;
		}

		this.matter_ = val;
	}

	toJSON() {
		var out = {};

		if (this.matter) {
			out.matter = this.matter.substances;
		}

		return out;
	}
}

module.exports = Physic;

const Matter = require('./matter');
