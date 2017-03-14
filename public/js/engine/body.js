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
		scale = new Vec3(1, 1, 1),
		parent
	} = {}) {
		this.position = position;
		this.rotation = rotation;
		this.scale = scale;
		this.parent = parent;

		/**
		 * Stores children of a body
		 * @type {Array}
		 * @private
		 */
		this.children_ = [];
	}

	get children() {
		return this.children_;
	}

	get position() {
		return this.position_;
	}
	set position(val) {
		if (!(val instanceof Vec3)) {
			throw new Error('Body: position: must be a Vec3');
		}

		this.position_ = val;
	}

	get rotation() {
		return this.rotation_;
	}
	set rotation(val) {
		if (!(val instanceof Quaternion)) {
			throw new Error('Body: rotation: must be a Quaternion');
		}

		this.rotation_ = val;
	}

	get scale() {
		return this.scale_;
	}
	set scale(val) {
		if (!(val instanceof Vec3)) {
			throw new Error('Body: scale: must be a Vec3');
		}

		this.scale_ = val;
	}

	get parent() {
		return this.parent_;
	}
	set parent(val) {
		if (val && !(val instanceof Body)) {
			throw new Error('Body: parent: must be a Body');
		}

		// if body had a parent when remove from parent's children
		if (this.parent) {
			var ind = this.parent.children.indexOf(this);
			children.splice(ind, 1);
		}

		// autopush to children list of new parent
		if (val) {
			val.children.push(this);
		}

		this.parent_ = val;
	}
}
