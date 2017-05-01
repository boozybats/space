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
		position,
		rotation,
		scale,
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
		/**
		 * Stores last results of {@link Body#mvmatrix} calculations.
		 * @type {Array}
		 * @private
		 */
		this.matmem = [];
	}

	get children() {
		return this.children_;
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
			val = new Vec3(1, 1, 1);
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

	/**
	 * Returns {@link Mat4} modified by {@link Body}'s position,
	 * rotation and scale, also include relation of body's
	 * parents.
	 * @return {Mat4}
	 * @method
	 */
	mvmatrix() {
		var matS, matR, matT, matU, mvmatrix;
		var body = this;

		/**
		 * matrix memory contains data about last calculated
		 * matrix, it needs to save memory, so it's returning
		 * already calculated values
		 */
		var memory = this.matmem,
			level = 0;  // level means "Parent's body number"
		/**
		 * if previous levels wasn't equal with memory
		 * when multiply existing mvmatrix on memory cells instead
		 * of writing all mvmatrix as value
		 */
		var isBreaked = false;  

		// go through cicle until item have a parent
		do {
			if (!memory[level]) {
				memory[level] = {};
			}
			var cell = memory[level];

			if (amc('=', body.position, cell.position) &&
				amc('=', body.rotation, cell.rotation) &&
				amc('=', body.scale, cell.scale)) {
				if (isBreaked) {
					mvmatrix = amc('*', cell.matrix, mvmatrix);
				}
				else {
					mvmatrix = cell.unity;
				}
			}
			else {
				isBreaked = true;

				cell.position = body.position;
				cell.rotation = body.rotation;
				cell.scale = body.scale;

				matS = Mat4.scale(body.scale);
				matR = Mat4.rotate(body.rotation);
				matT = Mat4.translate(body.position);

				// matrix from this level only
				matU = amc('*', matT, matR, matS);
				cell.matrix = matU;

				// result matrix from first level to this
				mvmatrix = mvmatrix ? amc('*', matU, mvmatrix) : matU;
				cell.unity = mvmatrix;
			}

			body = body.parent;
			level++;
		}
		while(body);

		return mvmatrix;
	}

	toJSON() {
		var out = {};

		out.position = this.position.array();
		out.rotation = this.rotation.array();
		out.scale = this.scale.array();
		out.mvmatrix = this.mvmatrix().rowmajor();

		return out;
	}
}
