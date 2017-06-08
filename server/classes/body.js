class Body {
	constructor({
		position = new Vec3,
		rotation = new Quaternion,
		scale = new Vec3(1, 1, 1),
		parent
	} = {}) {
		this.position = position;
		this.rotation = rotation;
		this.scale = scale;
		this.parent = parent;
	}

	get position() {
		return this.position_;
	}
	set position(val) {
		if (!(val instanceof Vec3)) {
			val = new Vec3;
		}

		this.position_ = val;
	}

	get rotation() {
		return this.rotation_;
	}
	set rotation(val) {
		if (!(val instanceof Quaternion)) {
			val = new Quaternion;
		}

		this.rotation_ = val;
	}

	get scale() {
		return this.scale_;
	}
	set scale(val) {
		if (!(val instanceof Vec3)) {
			val = new Vec3;
		}

		this.scale_ = val;
	}

	get parent() {
		return this.parent_;
	}
	set parent(val) {
		if (!val || typeof val === 'number') {
			this.parent_ = val;
		}
	}

	// Performes position, rotation and scale to arrays, adds parent if have
	toJSON() {
		var out = {};

		out.position = this.position.array();
		out.rotation = this.rotation.array();
		out.scale = this.scale.array();

		if (typeof this.parent === 'number') {
			out.parent = this.parent;
		}

		return out;
	}
}

module.exports = Body;

const Quaternion = require('./quaternion');
const Vector     = require('./vector');
const Vec3       = Vector.Vec3;
