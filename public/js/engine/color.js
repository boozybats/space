/**
 * Array of numbers (red, green, blue, alpha-channel) that
 * creates web-color.
 * @this {Color}
 * @param {Number} r Red (0-255)
 * @param {Number} g Green (0-255)
 * @param {Number} b Blue (0-255)
 * @param {Number} a Alpha-channel (0-1)
 * @class
 * @property {Number} r Red (0-255)
 * @property {Number} g Green (0-255)
 * @property {Number} b Blue (0-255)
 * @property {Number} a Alpha-channel (0-1)
 * @property {Number} size How much numbers in color (3-4)
 * @property {Color} rgb Red, Green and Blue channels color
 * @property {Color} rgba Red, Green, Blue and Alpha channels
 * color
 */

class Color {
	constructor(...arr) {
		arr.forEach(function(el, ind) {
			switch (ind) {
				case 0:
				case 1:
				case 2:
				if (typeof el !== 'number' ||
					!(el >= 0 && el <= 255)) {
					throw new Error('Color: "rgb" must be a number "0-255"');
				}
				break;

				case 3:
				if (typeof el !== 'number' ||
					!(el >= 0 && el <= 1)) {
					throw new Error('Color: "a" must be a number "0-1"');
				}
				break;
			}
		});

		this.r_ = arr[0];
		this.g_ = arr[1];
		this.b_ = arr[2];
		this.a_ = arr[3];

		this.size_ = arr.length;

		if (this.size > 4) {
			this.size_ = 4;
		}
		else if (this.size < 3) {
			throw new Error('Color: must be a 3 or 4 arguments');
		}
	}

	get a() {
		return this.a_;
	}

	/**
	 * Returns an array from color numbers.
	 * @return {Array}
	 * @method
	 */
	array() {
		var out = [this.r, this.g, this.b];

		if (typeof this.a !== 'undefined') {
			out.push(this.a);
		}

		return out;
	}

	get b() {
		return this.b_;
	}

	get g() {
		return this.g_;
	}

	get r() {
		return this.r_;
	}

	get rgb() {
		if (this.size == 4) {
			return new Color(this.x, this.y, this.z);
		}
		else {
			return this;
		}
	}

	get rgba() {
		if (this.size == 3) {
			return new Color(this.x, this.y, this.z, 0);
		}
		else {
			return this;
		}
	}

	get size() {
		return this.size_;
	}

	/**
	 * Returns color with divided Red, Green and Blue
	 * channels on 255.
	 * @return {Color}
	 * @method
	 */
	tounit() {
		var arr = [
			this.r / 255,
			this.g / 255,
			this.b / 255
		];

		if (typeof this.a !== 'undefined') {
			arr.push(this.a);
		}

		var out = new Color(...arr);

		return out;
	}

	/**
	 * Transforms Color in {@link Vec}.
	 * @return {Vec}
	 * @method
	 */
	vec() {
		var out = new Vec(...this.array());

		return out;
	}
}
