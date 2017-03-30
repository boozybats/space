const vector_ = require('./vector');
const Quaternion = require('./Quaternion');
const Vec3 = vector_.Vec3;

/**
 * Stores position, rotation, scale vectors.
 * Can have a parent-body. When calling method
 * {@link Item#mvmatrix} in {@link Item} calculations
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
		scale = new Vec3(1, 1, 1)
	} = {}) {
		this.position = position;
		this.rotation = rotation;
		this.scale = scale;
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
}

module.extends = Body;
