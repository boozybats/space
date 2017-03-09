/**
 * Array of colors (red, green, blue, alpha-channel)
 * this class helps work this colors, it gives any
 * permissions to use color filters, math functions, e.t.c
 *
 * @constructor
 * @this {Color}
 *  {number} this.size Quantity of sended arguments (3 or 4)
 * @param {number} r, g, b, a
 *  rgb must have value 0-255, a - 0-1
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

		/** @private */ this.size_ = arr.length;

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
	 * Devides rgb on 255 to becane rgb interval 0-1
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

	vec() {
		var out = new Vec(...this.array());

		return out;
	}
}
