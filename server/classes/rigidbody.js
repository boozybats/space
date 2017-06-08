class Rigidbody {
	constructor() {
		this.velocity = new Vec3;
		this.onupdate = function() {};
	}

	get velocity() {
		return this.velocity_;
	}

	set velocity(val) {
		if (!(val instanceof Vec3)) {
			val = new Vec3;
		}

		this.velocity_ = val;
	}

	get onupdate() {
		return this.onupdate_;
	}
	set onupdate(val) {
		if (typeof val !== 'function') {
			val = function() {};
		}

		this.onupdate_ = val;
	}
}

module.exports = Rigidbody;

const Vector = require('./vector');
const Vec3   = Vector.Vec3;
