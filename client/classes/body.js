const Quaternion = require('./Quaternion');
const vector_    = require('./vector');
const Vec3 = vector_.Vec3;

/**
 * Stores position, rotation, scale vectors.
 * Can have a parent-body. When calling method
 * {@link Body#mvmatrix} in {@link Item} calculations
 * will be relative to parent-bodies.
 * Stores children-array.
 * @this {Body}
 * @param {Object} options
 * @param {Vec3} options.position
 * @param {Quaternion} options.rotation
 * @param {Vec3} options.scale
 * @param {Body} options.parent
 * @class
 * @property {Array} children Children-array fills automatically after adding
 * for some body a parent this body and automatically
 * removes children if parent has been changed.
*/

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
		if (val && typeof val !== 'number') {
			return;
		}

		this.parent_ = val;
	}

	toJSON() {
		var out = {};

		out.position = this.position.array();
		out.rotation = this.rotation.array();
		out.scale = this.scale.array();

		if (this.parent) {
			out.parent = this.parent;
		}

		return out;
	}
}

module.exports = Body;
