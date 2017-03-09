/**
 * Object that contains 2-4 values by keys x, y, z and w,
 * it helps to calculate geometric equations and send
 * body's data to shader
 *
 * @constructor
 * @this {Vec}
 * @param {number} x, y, z, w
 */

class Vec {
	constructor(...arr) {
		if (this.constructor === Vec) {
			var out;
			switch (arr.length) {
				case 4:
				this.w_ = arr[3] || 0;

				case 3:
				this.z_ = arr[2] || 0;

				case 2:
				this.x_ = arr[0] || 0;
				this.y_ = arr[1] || 0;
			}
			this.size_ = arr.length;
		}
	}

	// calculates angle between 2 vectors
	static angle(vec1, vec2) {
		var out = Math.acos(Vec.cos(vec1, vec2));
	
		return out;
	}

	array() {
		var out = [this.x, this.y];

		if (typeof this.w !== 'undefined') {
			out.push(this.z, this.w);
		}
		else if (typeof this.z !== 'undefined') {
			out.push(this.z);
		}

		return out;
	}

	/**
	 * Returns average vector between sended
	 * @param  {Vec[]} vectors
	 * @return {Vec}
	 */
	static avg(...vectors) {
		var sum = Vec.sum(...vectors);
		var out = sum.multi(1 / vectors.length);

		return out;
	}

	static compare(vec0, vec1) {
		var out = true;

		if (typeof vec0 === 'undefined' || typeof vec1 === 'undefined') {
			out = false;
		}
		else {
			var length0 = vec0.size,
				length1 = vec1.size;

			if (length0 == length1) {
				if (vec0.x !== vec1.x ||
					vec0.y !== vec1.y ||
					vec0.z !== vec1.z ||
					vec0.w !== vec1.w) {
					out = false;
				}
			}
			else {
				out = false;
			}
		}

		return out;
	}

	// calculate cosinus between 2 vectors
	static cos(vec1, vec2) {
		var out = (vec1.x * vec2.x + vec1.y * vec2.y) / (vec1.length() * vec2.length());

		return out;
	}

	static dif(...vectors) {
		var vec1 = vectors[0],
			vec2 = vectors[1];
		var Type = vec1.size >= vec2.size ? vec1.constructor : vec2.constructor;

		var out = new Type(
			vec1.x - vec2.x,
			vec1.y - vec2.y,
			(vec1.z || 0) - (vec2.z || 0),
			(vec1.w || 0) - (vec2.w || 0)
		);

		if (vectors.length > 2) {
			vectors.splice(0, 2, out);
			out = Vec.dif(...vectors);
		}
		return out;
	}

	static dot(...vectors) {
		var vec1 = vectors[0];
		var vec2 = vectors[1];

		var out = vec1.x * vec2.x + vec1.y * vec2.y;
		if (typeof vec1.w !== 'undefined' && typeof vec2.w !== 'undefined') {
			out += vec1.z * vec2.z;
			out += vec1.w * vec2.w;
		}
		else if (typeof vec1.z !== 'undefined' && typeof vec2.z !== 'undefined') {
			out += vec1.z * vec2.z;
		}

		if (vectors.length > 2) {
			vectors.splice(0, 2, out);
			out = Vec.sum(...vectors);
		}

		return out;
	}

	/**
	 * Transforms vector to euler
	 * @return {Euler}
	 */
	euler() {
		var x = this.x,
			y = this.y,
			z = this.z;
	
		x = x * 180;
		y = y * 180;
		z = z * 180;

		var out = new Euler(x, y, z);
		
		return out;
	}

	/**
	 * Transforms vec4 to vec3 by devision
	 * @return {Vec3}
	 */
	tocartesian() {
		var out;

		switch (this.size) {
			case 3:
			out = amc('/', this.xyz, this.z);
			break;

			case 4:
			out = amc('/', this.xyz, this.w);
			break;
		}

		return out;
	}

	tohomogeneous() {
		var out;

		out = new Vec4(this, 1);

		return out;
	}

	inverse() {
		var x = -this.x,
			y = -this.y,
			z, w;

		if (typeof this.w !== 'undefined') {
			z = -this.z;
			w = -this.w;
		}
		else if (typeof this.z !== 'undefined') {
			z = -this.z;
		}

		var out = new this.constructor(x, y, z, w);

		return out;
	}

	length() {
		var out = Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2) + Math.pow(this.z || 0, 2) + Math.pow(this.w || 0, 2));

		return out;
	}

	// how much coordinates in vector
	get size() {
		return this.size_;
	}

	multi(num) {
		if (typeof num !== 'number') {
			throw new Error('Vector: multi: must be a number');
		}

		var Type = this.constructor;

		var out = new Type(
			this.x * num,
			this.y * num,
			(this.z || 0) * num,
			(this.w || 0) * num
		);

		return out;
	}

	static multi(...vectors) {
		var vec1 = vectors[0],
			vec2 = vectors[1];
		var Type = vec1.size >= vec2.size ? vec1.constructor : vec2.constructor;

		var out = new Type(
			vec1.x * vec2.x,
			vec1.y * vec2.y,
			(vec1.z || 1) * (vec2.z || 1),
			(vec1.w || 1) * (vec2.w || 1)
		);

		if (vectors.length > 2) {
			vectors.splice(0, 2, out);
			out = Vec.sum(...vectors);
		}

		return out;
	}

	normalize() {
		var length = this.length();

		var x = (this.x / length) || 0,
			y = (this.y / length) || 0,
			z = (this.z / length) || 0,
			w = (this.w / length) || 0;

		var Type = this.constructor;
		var out = new Type(x, y, z, w);

		return out;
	}

	sum(num) {
		if (typeof num !== 'number') {
			throw new Error('Vector: sum: must be a number');
		}

		var Type = this.constructor;

		var out = new Type(
			this.x + num,
			this.y + num,
			(this.z || 0) + num,
			(this.w || 0) + num
		);

		return out;
	}

	static sum(...vectors) {
		var vec1 = vectors[0],
			vec2 = vectors[1];
		var Type = vec1.size >= vec2.size ? vec1.constructor : vec2.constructor;

		var out = new Type(
			vec1.x + vec2.x,
			vec1.y + vec2.y,
			(vec1.z || 0) + (vec2.z || 0),
			(vec1.w || 0) + (vec2.w || 0)
		);

		if (vectors.length > 2) {
			vectors.splice(0, 2, out);
			out = Vec.sum(...vectors);
		}

		return out;
	}

	// multiply 2 vectors by module
	static vecmulti(vec1, vec2) {
		var out = vec1.length() * vec2.length() * Vec.cos(vec1, vec2);

		return out;
	}

	get x() {
		return this.x_;
	}

	get y() {
		return this.y_;
	}

	get z() {
		return this.z_;
	}

	get xy() {
		var out = new Vec2(this.x_, this.y_);

		return out;
	}

	get xz() {
		var out = new Vec2(this.x_, this.z_);
		
		return out;
	}

	get xw() {
		var out = new Vec2(this.x_, this.w_);
		
		return out;
	}

	get yx() {
		var out = new Vec2(this.y_, this.x_);
		
		return out;
	}

	get yz() {
		var out = new Vec2(this.y_, this.z_);
		
		return out;
	}

	get yw() {
		var out = new Vec2(this.y_, this.w_);
		
		return out;
	}

	get zx() {
		var out = new Vec2(this.z_, this.x_);
		
		return out;
	}

	get zy() {
		var out = new Vec2(this.z_, this.y_);
		
		return out;
	}

	get zw() {
		var out = new Vec2(this.z_, this.w_);
		
		return out;
	}

	get wx() {
		var out = new Vec2(this.w_, this.x_);
		
		return out;
	}

	get wy() {
		var out = new Vec2(this.w_, this.y_);
		
		return out;
	}

	get wz() {
		var out = new Vec2(this.w_, this.z_);
		
		return out;
	}

	get xyz() {
		var out = new Vec3(this.x_, this.y_, this.z_);
		
		return out;
	}

	get xyw() {
		var out = new Vec3(this.x_, this.y_, this.w_);
		
		return out;
	}

	get xzw() {
		var out = new Vec3(this.x_, this.z_, this.w_);
		
		return out;
	}

	get xwz() {
		var out = new Vec3(this.x_, this.w_, this.z_);
		
		return out;
	}

	get xzy() {
		var out = new Vec3(this.x_, this.z_, this.y_);
		
		return out;
	}

	get xwy() {
		var out = new Vec3(this.x_, this.w_, this.y_);
		
		return out;
	}

	get yzw() {
		var out = new Vec3(this.y_, this.z_, this.w_);
		
		return out;
	}

	get ywz() {
		var out = new Vec3(this.y_, this.w_, this.z_);
		
		return out;
	}

	get yxz() {
		var out = new Vec3(this.y_, this.x_, this.z_);
		
		return out;
	}

	get yxw() {
		var out = new Vec3(this.y_, this.x_, this.w_);
		
		return out;
	}

	get yzx() {
		var out = new Vec3(this.y_, this.z_, this.x_);
		
		return out;
	}

	get ywx() {
		var out = new Vec3(this.y_, this.w_, this.x_);
		
		return out;
	}

	get zwx() {
		var out = new Vec3(this.z_, this.w_, this.x_);
		
		return out;
	}

	get zwy() {
		var out = new Vec3(this.z_, this.w_, this.y_);
		
		return out;
	}

	get zxw() {
		var out = new Vec3(this.z_, this.x_, this.w_);
		
		return out;
	}

	get zxy() {
		var out = new Vec3(this.z_, this.x_, this.y_);
		
		return out;
	}

	get zyw() {
		var out = new Vec3(this.z_, this.y_, this.w_);
		
		return out;
	}

	get zyx() {
		var out = new Vec3(this.z_, this.y_, this.x_);
		
		return out;
	}

	get wxy() {
		var out = new Vec3(this.w_, this.x_, this.y_);
		
		return out;
	}

	get wxz() {
		var out = new Vec3(this.w_, this.x_, this.z_);
		
		return out;
	}

	get wyx() {
		var out = new Vec3(this.w_, this.y_, this.x_);
		
		return out;
	}

	get wyz() {
		var out = new Vec3(this.w_, this.y_, this.z_);
		
		return out;
	}

	get wzx() {
		var out = new Vec3(this.w_, this.z_, this.x_);
		
		return out;
	}

	get wzy() {
		var out = new Vec3(this.w_, this.z_, this.y_);
		
		return out;
	}

	get xyzw() {
		var out = new Vec4(this.x_, this.y_, this.z_, this.w_);
		
		return out;
	}

	get xywz() {
		var out = new Vec4(this.x_, this.y_, this.w_, this.z_);
		
		return out;
	}

	get xzyw() {
		var out = new Vec4(this.x_, this.z_, this.y_, this.w_);
		
		return out;
	}

	get xwyz() {
		var out = new Vec4(this.x_, this.w_, this.y_, this.z_);
		
		return out;
	}

	get xzwy() {
		var out = new Vec4(this.x_, this.z_, this.w_, this.y_);
		
		return out;
	}

	get xwzy() {
		var out = new Vec4(this.x_, this.w_, this.z_, this.y_);
		
		return out;
	}

	get yxzw() {
		var out = new Vec4(this.y_, this.x_, this.z_, this.w_);
		
		return out;
	}

	get yxwz() {
		var out = new Vec4(this.y_, this.x_, this.w_, this.z_);
		
		return out;
	}

	get yzxw() {
		var out = new Vec4(this.y_, this.z_, this.x_, this.w_);
		
		return out;
	}

	get ywxz() {
		var out = new Vec4(this.y_, this.w_, this.x_, this.z_);
		
		return out;
	}

	get yzwx() {
		var out = new Vec4(this.y_, this.z_, this.w_, this.x_);
		
		return out;
	}

	get yzxw() {
		var out = new Vec4(this.y_, this.z_, this.x_, this.w_);
		
		return out;
	}

	get zxyw() {
		var out = new Vec4(this.z_, this.x_, this.y_, this.w_);
		
		return out;
	}

	get zxwy() {
		var out = new Vec4(this.z_, this.x_, this.w_, this.y_);
		
		return out;
	}

	get zyxw() {
		var out = new Vec4(this.z_, this.y_, this.x_, this.w_);
		
		return out;
	}

	get zwxy() {
		var out = new Vec4(this.z_, this.w_, this.x_, this.y_);
		
		return out;
	}

	get zywx() {
		var out = new Vec4(this.z_, this.y_, this.w_, this.x_);
		
		return out;
	}

	get zwyx() {
		var out = new Vec4(this.z_, this.w_, this.y_, this.x_);
		
		return out;
	}

	get wxyz() {
		var out = new Vec4(this.w_, this.x_, this.y_, this.z_);
		
		return out;
	}

	get wxzy() {
		var out = new Vec4(this.w_, this.x_, this.z_, this.y_);
		
		return out;
	}

	get wyxz() {
		var out = new Vec4(this.w_, this.y_, this.x_, this.z_);
		
		return out;
	}

	get wzxy() {
		var out = new Vec4(this.w_, this.z_, this.x_, this.y_);
		
		return out;
	}

	get wyzx() {
		var out = new Vec4(this.w_, this.y_, this.z_, this.x_);
		
		return out;
	}

	get wzyx() {
		var out = new Vec4(this.w_, this.z_, this.y_, this.x_);
		
		return out;
	}

	get w() {
		return this.w_;
	}

	static get right() {
		return [1, 0, 0];
	}

	static get left() {
		return [-1, 0, 0];
	}

	static get up() {
		return [0, 1, 0];
	}

	static get down() {
		return [0, -1, 0];
	}

	static get front() {
		return [0, 0, 1];
	}

	static get back() {
		return [0, 0, -1];
	}
}

/**
 * Contains 2 coordinates in vector
 *
 * @constructor
 * @this {Vec2}
 * @param {*} x
 * @param {*} y
 */

class Vec2 extends Vec {
	constructor(x = 0, y = 0) {
		super();

		if ((x instanceof Vec && x.size == 3) || (x instanceof Vec && x.size == 4)) {
			y = x.y,
			x = x.x;
		}

		this.x_ = x || 0;
		this.y_ = y || 0;

		this.size_ = 2;
	}
}

/**
 * Contains 3 coordinates in vector
 *
 * @constructor
 * @this {Vec3}
 * @param {*} x
 * @param {*} y
 * @param {*} z
 */

class Vec3 extends Vec {
	constructor(x = 0, y = 0, z = 0) {
		super();

		if (!z && x instanceof Vec && x.size == 2) {
			z = y,
			y = x.y,
			x = x.x;
		}
		else if (!z && y instanceof Vec && y.size == 2) {
			x = x;
			z = y.y,
			y = y.x;
		}
		else if (!y && x instanceof Vec && x.size == 4) {
			z = x.z,
			y = x.y,
			x = x.x;
		}

		this.x_ = x;
		this.y_ = y;
		this.z_ = z;

		this.size_ = 3;
	}
}

/**
 * Contains 4 coordinates in vector
 *
 * @constructor
 * @this {Vec4}
 * @param {*} x
 * @param {*} y
 * @param {*} z
 * @param {*} w
 */

class Vec4 extends Vec {
	constructor(x = 0, y = 0, z = 0, w = 0) {
		super();

		if (!z && x && x.constructor == Vec2 && y && y.constructor == Vec2) {
			w = y.y,
			z = y.x,
			y = x.y,
			x = x.x;
		}
		else if (!w && x instanceof Vec && x.size == 2) {
			w = z,
			z = y,
			y = x.y,
			x = x.x;
		}
		else if (!w && y instanceof Vec && y.size == 2) {
			w = z,
			x = x,
			z = y.y,
			y = y.x;
		}
		else if (!w && z instanceof Vec && z.size == 2) {
			x = x,
			y = y,
			w = z.y,
			z = z.x;
		}
		else if (!z && x instanceof Vec && x.size == 3) {
			w = y,
			z = x.z,
			y = x.y,
			x = x.x;
		}
		else if (!z && y instanceof Vec && y.size == 3) {
			x = x,
			w = y.z,
			z = y.y,
			y = y.x;
		}

		this.x_ = x;
		this.y_ = y;
		this.z_ = z;
		this.w_ = w;

		this.size_ = 4;
	}
}
