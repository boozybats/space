/**
 * 
 * Cursor class contains info about mouse position and axis,
 * doesn't draw anything on screen
 *
 * @constructor
 * @this {Cursor}
 *  {Vec2} this.axis Mouse current instantly direction
 *  {Vec2} this.position Current mouse position (in radius == 1)
 */

class Cursor {
	constructor() {
		this.position = new Vec2;
		this.axis = new Vec2;
	}

	get axis() {
		return this.axis_;
	}
	/**
	 * Writes axis as a Vec2 and adds to position
	 * @param  {Vec2} val
	 */
	set axis(val) {
		if (!(val instanceof Vec2)) {
			throw new Error('Cursor: axis: must be a Vec2');
		}

		this.axis_ = val;
		this.position = amc('+', this.position, val);
	}

	get position() {
		return this.position_;
	}
	/**
	 * Position is set by axis, maximum Vec2 length is radius
	 * of circle with R = 1
	 * @param  {Vec2} val
	 */
	set position(val) {
		if (!(val instanceof Vec2)) {
			throw new Error('Cursor: position: must be a Vec2');
		}

		var length = val.length();
		if (length > 1) {
			val = val.normalize();
		}

		this.position_ = val;
	}
}
