/**
 * Vector contains 2-4 values by keys x, y, z and w.
 * @this {Vec}
 * @param {*} x
 * @param {*} y
 * @param {*} z
 * @param {*} w
 * @class
 * @property {Vec} x-wzyx Returns new vector with coordinates
 * in new order.
 */

class Vec {
	constructor(...arr) {
		if (this.constructor === Vec) {
			var x = arr[0],
				y = arr[1],
				z = arr[2],
				w = arr[3];

			if (x && typeof x !== 'number' ||
				y && typeof y !== 'number' ||
				z && typeof z !== 'number' ||
				w && typeof w !== 'number') {
				x = y = z = w = 0;
			}

			switch (arr.length) {
				case 4:
				this.w_ = w || 0;

				case 3:
				this.z_ = z || 0;

				case 2:
				this.x_ = x || 0;
				this.y_ = y || 0;
			}
			this.size_ = arr.length;
		}
	}

	/**
	 * Calculates angle between 2 vectors.
	 * @param  {Vec} vec1
	 * @param  {Vec} vec2
	 * @return {Number} Degrees
	 * @method
	 * @static
	 */
	static angle(vec1, vec2) {
		if (!(vec1 instanceof Vec) || !(vec2 instanceof Vec)) {
			vec1 = vec2 = new Vec;
		}

		var out = Math.acos(Vec.cos(vec1, vec2));
	
		return out;
	}

	/**
	 * Returns an array with vector coordinates.
	 * @return {Vec}
	 * @method
	 */
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
	 * Returns average vector between sended other.
	 * @param  {...Vec} vectors
	 * @return {Vec}
	 * @method
	 * @static
	 * @example
	 * var vec = Vec.avg(new Vec(3,5,6), new Vec(4,2,4), new Vec3(2,2,2));
	 * vec;  // Vec {x: 3, y: 3, z: 4}
	 */
	static avg(...vectors) {
		if (vectors.length == 0) {
			return new Vec2;
		}

		var out = amc('/', amc('+', ...vectors), vectors.length);

		if (!(out instanceof Vec)) {
			out = new Vec2;
		}

		return out;
	}

	/**
	 * Compares two vectors by x, y, z and w coordinates
	 * and returns true if them equal else returns false.
	 * P.S. Better use {@link amc} function, it is
	 * much optimizing.
	 * @param  {Vec} vec1
	 * @param  {Vec} vec2
	 * @return {Boolean}
	 * @method
	 * @static
	 */
	static compare(vec1, vec2) {
		var out = true;

		if (!(vec1 instanceof Vec) || !(vec2 instanceof Vec)) {
			out = false;
		}
		else {
			var length0 = vec1.size,
				length1 = vec2.size;

			if (length0 == length1) {
				if (vec1.x !== vec2.x ||
					vec1.y !== vec2.y ||
					vec1.z !== vec2.z ||
					vec1.w !== vec2.w) {
					out = false;
				}
			}
			else {
				out = false;
			}
		}

		return out;
	}

	/**
	 * Calculates cosinus between two vectors.
	 * @param  {Vec} vec1
	 * @param  {Vec} vec2
	 * @return {Number} Radians
	 * @method
	 * @static
	 */
	static cos(vec1, vec2) {
		if (!(vec1 instanceof Vec) || !(vec2 instanceof Vec)) {
			vec1 = vec2 = new Vec2;
		}

		var out = (vec1.x * vec2.x + vec1.y * vec2.y) / (vec1.length() * vec2.length());

		return out;
	}

	/**
	 * Calculates difference between two vectors and returns
	 * result vector. P.S. Better use {@link amc} function, it is
	 * much optimizing.
	 * @param {...Vec} vectors
	 * @return {Vec}
	 * @method
	 * @static
	 */
	static dif(...vectors) {
		if (vectors.length == 0) {
			return new Vec2;
		}

		var vec1 = vectors[0],
			vec2 = vectors[1];

		if (!(vec1 instanceof Vec)) {
			vec1 = new Vec2;
		}
		if (!(vec2 instanceof Vec)) {
			vec2 = new Vec2;
		}

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

	/**
	 * Scalar product of two vectors.
	 * @param  {...Vec} vectors
	 * @return {Number}
	 * @method
	 * @static
	 */
	static dot(...vectors) {
		if (vectors.length == 0) {
			return new Vec2;
		}

		var vec1 = vectors[0],
			vec2 = vectors[1];

		if (!(vec1 instanceof Vec)) {
			vec1 = new Vec2;
		}
		if (!(vec2 instanceof Vec)) {
			vec2 = new Vec2;
		}

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
			out = Vec.dot(...vectors);
		}

		return out;
	}

	/**
	 * Transforms vector to euler.
	 * @return {Euler}
	 * @method
	 */
	euler() {
		var x = this.x,
			y = this.y,
			z = this.z || 0;
	
		x = x * 180;
		y = y * 180;
		z = z * 180;

		var out = new Euler(x, y, z);
		
		return out;
	}

	/**
	 * Returns homogeneous vector of direction.
	 * @return {Vec4} Vec4 {x: 0, y: 0, z: 0, w: 0}
	 * @method
	 * @static
	 */
	static get homogeneousdir() {
		return new Vec4(0, 0, 0, 0);
	}

	/**
	 * Returns homogeneous vector of position.
	 * @return {Vec4} Vec4 {x: 0, y: 0, z: 0, w: 1}
	 * @method
	 * @static
	 */
	static get homogeneouspos() {
		return new Vec4(0, 0, 0, 1);
	}

	/**
	 * Converts a vector into a vector into a smaller rank
	 * by division on last coordinate.
	 * @return {Vec}
	 * @method
	 * @example
	 * (new Vec4(1, 5, 3, 2)).tocartesian();  // Vec3 {x: 0.5, y: 2.5, z: 1.5}
	 */
	tocartesian() {
		var out;

		switch (this.size) {
			case 3:
			out = amc('/', this.xy, this.z);
			break;

			case 4:
			out = amc('/', this.xyz, this.w);
			break;
		}

		return out;
	}

	/**
	 * Converts a vector into a vector into a higher rank
	 * by appending value as 1 to last coordinate.
	 * @return {Vec}
	 * @method
	 * @example
	 * (new Vec3(1, 5, 3)).tohomogeneouspos();  // Vec3 {x: 1, y: 5, z: 3, w: 1}
	 */
	tohomogeneouspos() {
		var out;

		switch (this.size) {
			case 2:
			out = new Vec3(this, 1);
			break;

			case 3:
			out = new Vec4(this, 1);
			break;
		}

		return out;
	}

	/**
	 * Returns inversed vector.
	 * @return {Vec}
	 * @method
	 */
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

	/**
	 * Returns length of vector.
	 * @return {Number}
	 * @method
	 */
	length() {
		var out = Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2) + Math.pow(this.z || 0, 2) + Math.pow(this.w || 0, 2));

		return out;
	}

	/**
	 * Multiplies vector coordinates on number and returns
	 * result vector. P.S. Better use {@link amc} function, it is
	 * much optimizing.
	 * @param  {Number} num
	 * @return {Vec}
	 * @method
	 */
	multi(num) {
		if (typeof num !== 'number') {
			num = 1;
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

	/**
	 * Calculates multiply of two vectors and returns
	 * result vector. P.S. Better use {@link amc} function, it is
	 * much optimizing.
	 * @param  {...Vec} vectors Array
	 * @return {Vec}
	 * @method
	 * @static
	 */
	static multi(...vectors) {
		if (vectors.length == 0) {
			return new Vec2;
		}

		var vec1 = vectors[0],
			vec2 = vectors[1];

		if (!(vec1 instanceof Vec)) {
			vec1 = new Vec2;
		}
		if (!(vec2 instanceof Vec)) {
			vec2 = new Vec2;
		}

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

	/**
	 * Returns normalized vector.
	 * @return {Vec}
	 * @method
	 */
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

	/**
	 * Returns quantity of coordinates in vector.
	 * @return {Number}
	 * @method
	 */
	get size() {
		return this.size_;
	}

	/**
	 * Sum vector's coordinates on number and returns
	 * result vector.
	 * @param {Number} num
	 * @return {Vec}
	 * @method
	 */
	sum(num) {
		if (typeof num !== 'number') {
			num = 0;
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

	/**
	 * Calculates sum of two vectors and returns
	 * result vector. P.S. Better use {@link amc} function, it is
	 * much optimizing.
	 * @param  {...Vec} vectors
	 * @return {Vec}
	 * @method
	 * @static
	 */
	static sum(...vectors) {
		if (vectors.length == 0) {
			return new Vec2;
		}

		var vec1 = vectors[0],
			vec2 = vectors[1];

		if (!(vec1 instanceof Vec)) {
			vec1 = new Vec2;
		}
		if (!(vec2 instanceof Vec)) {
			vec2 = new Vec2;
		}

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

	get x() {
		return this.x_;
	}

	get y() {
		return this.y_;
	}

	get z() {
		return this.z_;
	}

	get w() {
		return this.w_;
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

	/**
	 * @return {Vec3} [1, 0, 0]
	 */
	static get right() {
		return new Vec3(1, 0, 0);
	}

	/**
	 * @return {Vec3} [-1, 0, 0]
	 */
	static get left() {
		return new Vec3(-1, 0, 0);
	}

	/**
	 * @return {Vec3} [0, 1, 0]
	 */
	static get up() {
		return new Vec3(0, 1, 0);
	}

	/**
	 * @return {Vec3} [0, -1, 0]
	 */
	static get down() {
		return new Vec3(0, -1, 0);
	}

	/**
	 * @return {Vec3} [0, 0, 1]
	 */
	static get front() {
		return new Vec3(0, 0, 1);
	}

	/**
	 * @return {Vec3} [0, 0, -1]
	 */
	static get back() {
		return new Vec3(0, 0, -1);
	}
}

/**
 * Vector with 2 coordinates x and y.
 * @this {Vec2}
 * @param {*} x
 * @param {*} y
 * @class
 * @extends Vec
 */

class Vec2 extends Vec {
	constructor(x = 0, y = 0) {
		super();

		if ((x instanceof Vec && x.size == 3) || (x instanceof Vec && x.size == 4)) {
			y = x.y,
			x = x.x;
		}
		else if (typeof x !== 'number' ||
			typeof y !== 'number') {
			x = y = 0;
		}

		this.x_ = x || 0;
		this.y_ = y || 0;

		this.size_ = 2;
	}
}

/**
 * Vector with 3 coordinates x, y and z.
 * @this {Vec3}
 * @param {*} x
 * @param {*} y
 * @param {*} z
 * @class
 * @extends Vec
 */

class Vec3 extends Vec {
	constructor(x = 0, y = 0, z = 0) {
		super();

		if (!z && x instanceof Vec && x.size == 2) {
			if (typeof y !== 'number') {
				y = 0;
			}

			z = y,
			y = x.y,
			x = x.x;
		}
		else if (!z && y instanceof Vec && y.size == 2) {
			if (typeof x !== 'number') {
				x = 0;
			}

			z = y.y,
			y = y.x;
		}
		else if (!y && x instanceof Vec && x.size == 4) {
			z = x.z,
			y = x.y,
			x = x.x;
		}
		else if (typeof x !== 'number' ||
			typeof y !== 'number' ||
			typeof z !== 'number') {
			x = y = z = 0;
		}

		this.x_ = x;
		this.y_ = y;
		this.z_ = z;

		this.size_ = 3;
	}

	/**
	 * Retruns cross product of 2 vectors.
	 * @param  {Vec3} vec1
	 * @param  {Vec3} vec2
	 * @return {Vec3}
	 * @method
	 */
	static cross(vec1, vec2) {
		if (!(vec1 instanceof Vec3) || !(vec2 instanceof Vec3)) {
			vec1 = vec2 = new Vec3;
		}

		var x = vec1.y * vec2.z - vec1.z * vec2.y,
			y = vec1.z * vec2.x - vec1.x * vec2.z,
			z = vec1.x * vec2.y - vec1.y * vec2.x;

		var out = new Vec3(x, y, z);

		return out;
	}
}

/**
 * Vector with 4 coordinates x, y, z and w.
 * @this {Vec4}
 * @param {*} x
 * @param {*} y
 * @param {*} z
 * @param {*} w
 * @class
 * @extends Vec
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
			if (typeof z !== 'number' ||
				typeof y !== 'number') {
				z = y = 0;
			}

			w = z,
			z = y,
			y = x.y,
			x = x.x;
		}
		else if (!w && y instanceof Vec && y.size == 2) {
			if (typeof z !== 'number' ||
				typeof x !== 'number') {
				z = x = 0;
			}

			w = z,
			z = y.y,
			y = y.x;
		}
		else if (!w && z instanceof Vec && z.size == 2) {
			if (typeof x !== 'number' ||
				typeof y !== 'number') {
				x = y = 0;
			}

			w = z.y,
			z = z.x;
		}
		else if (!z && x instanceof Vec && x.size == 3) {
			if (typeof y !== 'number') {
				y = 0;
			}

			w = y,
			z = x.z,
			y = x.y,
			x = x.x;
		}
		else if (!z && y instanceof Vec && y.size == 3) {
			if (typeof x !== 'number') {
				x = 0;
			}

			w = y.z,
			z = y.y,
			y = y.x;
		}
		else if (typeof x !== 'number' ||
			typeof y !== 'number' ||
			typeof z !== 'number' ||
			typeof w !== 'number') {
			x = y = z = w = 0;
		}

		this.x_ = x;
		this.y_ = y;
		this.z_ = z;
		this.w_ = w;

		this.size_ = 4;
	}
}

exports.Vec  = Vec;
exports.Vec2 = Vec2;
exports.Vec3 = Vec3;
exports.Vec4 = Vec4;

const Euler = require('./euler');
const amc   = require('./math').amc;
