/**
 * Eulers angles define three turns of the system by
 * x, y and z coordinates. Store value between 0 and
 * 360 for each coordinate.
 * @this {Euler}
 * @param {Number} x
 * @param {Number} y
 * @param {Number} z
 * @class
 * @property {Number} x
 * @property {Number} y
 * @property {Number} z
 */

class Euler {
	constructor(x = 0, y = 0, z = 0) {
		if (typeof x !== 'number' ||
			typeof y !== 'number' ||
			typeof z !== 'number') {
			throw new Error('Euler: xyz must be a numbers');
		}

		while(x >= 360) {
			x -= 360;
		}
		while(x < 0) {
			x += 360;
		}
		while(y >= 360) {
			y -= 360;
		}
		while(y < 0) {
			y += 360;
		}
		while(z >= 360) {
			z -= 360;
		}
		while(z < 0) {
			z += 360;
		}

		this.x_ = x;
		this.y_ = y;
		this.z_ = z;
	}

	/**
	 * Returns an array from eulers coordinates.
	 * @return {Array}
	 * @method
	 */
	array() {
		var out = [this.x, this.y, this.z];

		return out;
	}

	/**
	 * Compares 2 Euler-objects by x, y, z
	 * coordinates and return "true" if everything equal,
	 * else - "false".
	 * @param  {Euler} eul0
	 * @param  {Euler} eul1
	 * @return {Boolean}
	 * @method
	 * @static
	 * @example
	 * Euler.compare(new Euler(10, 20, 30), new Euler(11, 21, 31));  // false
	 * Euler.compare(new Euler(40, 60, 80), new Euler(40, 60, 80));  // true
	 */
	static compare(eul0, eul1) {
		var out = true;

		if (typeof eul0 === 'undefined' || typeof eul1 === 'undefined') {
			out = false;
		}
		else {
			if (eul0.x !== eul1.x ||
				eul0.y !== eul1.y ||
				eul0.z !== eul1.z) {
				out = false;
			}
		}

		return out;
	}

	/**
	 * Returns multiplied euler's coordinates by
	 * specified number.
	 * @param  {Number} num
	 * @return {Euler}
	 * @method
	 * @example
	 * var eul = new Euler(10, 0, 6);
	 * eul.multi(5);  // Euler {x: 50, y: 0, z: 30}
	 */
	multi(num) {
		if (typeof num !== 'number') {
			throw new Error('Euler: multi: must be a number');
		}

		var x = this.x * num,
			y = this.y * num,
			z = this.z * num;

		var out = new Euler(x, y, z);

		return out;
	}

	/**
	 * Transforms {@link Quaternion}-object to Euler-object
	 * @param {Quaternion | Number} x Can take Quaternion-object
	 * as value
	 * @param {Number} y
	 * @param {Number} z
	 * @param {Number} w
	 * @return {Euler}
	 * @method
	 * @static
	 * @example
	 * Euler.Quaternion(0.7071, 0, 0, 0.7071);  // Euler {x: 90, y: 0, z: 0}
	 * 
	 * var quat = new Quaternion(0.7071, 0, 0, 0.7071);
	 * Euler.Quaternion(quat);  // Euler {x: 90, y: 0, z: 0}
	 */
	static Quaternion(...args) {
		var x, y, z, w;
		if (args[0] instanceof Quaternion) {
			var quat = args[0];

			x = quat.x,
			y = quat.y,
			z = quat.z,
			w = quat.w;
		}
		else if (typeof args[0] === 'number' &&
			typeof args[1] === 'number' &&
			typeof args[2] === 'number' &&
			typeof args[3] === 'number') {
			x = args[0],
			y = args[1],
			z = args[2],
			w = args[3];
		}
		else {
			throw new Error('Euler: Quaternion: must be a Quaternion or xyzw numbers');
		}

		var m = [];
		var xx = x * x, x2 = x * 2,
			yy = y * y, y2 = y * 2,
			zz = z * z, z2 = z * 2,
			ww = w * w, w2 = w * 2,
			L = xx + yy + zz + ww;

		m[0] = (ww + xx - yy - zz) / L;
		m[1] = (x2 * y + w2 * z) / L;
		m[2] = (x2 * z - w2 * y) / L;
		m[4] = (x2 * y - w2 * z) / L;
		m[5] = (ww + yy - xx - zz) / L;
		m[6] = (y2 * z + w2 * x) / L;
		m[10] = (ww + zz - xx - yy) / L;

		var vec, xyDist = Math.sqrt(m[0] * m[0] + m[1] * m[1]);

		if (xyDist > Number.EPSILON) {
			if (m[10] > 0) {
				vec = new Vec3(
					Math.atan2(m[6], m[10]),
					Math.atan2(m[1], m[0]),
					Math.atan2(-m[2], xyDist)
				);
			}
			else {
				vec = new Vec3(
					-Math.atan2(m[6], -m[10]),
					-Math.atan2(m[1], -m[0]),
					-Math.atan2(m[2], -xyDist)
				);
			}
		}
		else {
			vec = new Vec3(
				0,
				Math.atan2(-m[4], m[5]),
				Math.atan2(-m[2], xyDist)
			);
		}

		var out = new Euler(
			Math.RTD(vec.x),
			Math.RTD(vec.y),
			Math.RTD(vec.z)
		);

		return out;
	}

	/**
	 * Transforms Euler-object to Vec
	 * @return {Vec}
	 * @method
	 */
	vec() {
		var out = new Vec3(this.x, this.y, this.z);
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
}