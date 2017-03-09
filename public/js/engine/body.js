/**
 * Contains info about item's position in global space
 *
 * @constructor
 * @this {Item}
 * @param {Vec3} position
 * @param {Quaternion} rotation
 * @param {Vec3} scale
 * @param {Body} parent
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
		this.children = [];
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
