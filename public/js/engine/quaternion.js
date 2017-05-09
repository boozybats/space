/**
 * A system of hypercomplex numbers that forms a vector
 * space of dimension four over the field of real numbers.
 * @this {Quaternion}
 * @param {Number} x
 * @param {Number} y
 * @param {Number} z
 * @param {Number} w
 * @class
 * @property {Number} x
 * @property {Number} y
 * @property {Number} z
 * @property {Number} w
 * @property {Euler} euler
 */

class Quaternion {
	constructor(x = 0, y = 0, z = 0, w = 1) {
		if (typeof x !== 'number' ||
			typeof y !== 'number' ||
			typeof z !== 'number' ||
			typeof w !== 'number') {
			throw new Error('Quaternion: xyzw must be a numbers');
		}

		this.x_ = x;
		this.y_ = y;
		this.z_ = z;
		this.w_ = w;

		this.euler_ = Euler.Quaternion(x, y, z, w);
	}

	/**
	 * Returns an array of quaternion numbers.
	 * @return {Arrat}
	 * @method
	 */
	array() {
		var out = [this.x, this.y, this.z, this.w];

		return out;
	}

	static avg(...quaternions) {
		if (quaternions.length == 0) {
			return new Quaternion;
		}

		var out = amc('/', amc('+', ...quaternions), quaternions.length);

		if (!(out instanceof Quaternion)) {
			out = new Quaternion;
		}

		return out;
	}

	/**
	 * Compares two quaternions by x, y, z and w coordinates
	 * and returns true if them equal else returns false.
	 * P.S. Better use {@link amc} function, it is
	 * much optimizing.
	 * @param  {Quaternion} quat1
	 * @param  {Quaternion} quat2
	 * @return {Boolean}
	 * @method
	 * @static
	 */
	static compare(quat1, quat2) {
		var out = true;

		if (typeof quat1 === 'undefined' || typeof quat2 === 'undefined') {
			out = false;
		}
		else {
			if (quat1.x !== quat2.x ||
				quat1.y !== quat2.y ||
				quat1.z !== quat2.z ||
				quat1.w !== quat2.w) {
				out = false;
			}
		}

		return out;
	}

	get euler() {
		return this.euler_;
	}

	/**
	 * Transforms eulers to quaternions,
	 * function gets {@link Euler} or x, y, and z coordinates.
	 * @param {Euler|number} x, y, z, w
	 * @return {Quaternion}
	 * @method
	 * @static
	 */
	static Euler(...args) {
		var roll, pitch, yaw;
		if (args[0] instanceof Quaternion) {
			var euler = args[0];

			roll = euler.x;
			pitch = euler.y;
			yaw = euler.z;
		}
		else if (typeof args[0] === 'number' &&
			typeof args[1] === 'number' &&
			typeof args[2] === 'number') {
			roll = args[0];
			pitch = args[1];
			yaw = args[2];
		}
		else {
			throw new Error('Quaternion: Euler: must be a Euler or xyz numbers');
		}

		var nroll = Math.DTR(roll),
			npitch = Math.DTR(pitch),
			nyaw = Math.DTR(yaw);

		var sr, sp, sy, cr, cp, cy;

		sy = Math.sin(nyaw * 0.5);
		cy = Math.cos(nyaw * 0.5);
		sp = Math.sin(npitch * 0.5);
		cp = Math.cos(npitch * 0.5);
		sr = Math.sin(nroll * 0.5);
		cr = Math.cos(nroll * 0.5);

		var srcp = sr * cp,
			crsp = cr * sp,
			crcp = cr * cp,
			srsp = sr * sp;

		var quat = new Quaternion(
			srcp * cy - crsp * sy,
			crsp * cy + srcp * sy,
			crcp * sy - srsp * cy,
			crcp * cy + srsp * sy
		);
		quat.euler_ = new Euler(roll, pitch, yaw);

		return quat;
	}

	/**
	 * Returns inversed quaternion.
	 * @return {Quaternion}
	 * @method
	 */
	inverse() {
		var euler = this.euler;
		var x = -euler.x,
			y = -euler.y,
			z = -euler.z;

		var out = Quaternion.Euler(x, y, z);

		return out;
	}

	multi(num) {
		if (typeof num !== 'number') {
			num = 1;
		}

		var euler = this.euler;

		var eul = new Euler(
			euler.x * num,
			euler.y * num,
			euler.z * num
		);

		var out = Quaternion.Euler(eul);

		return out;
	}

	/**
	 * Calculates sum between two quaternions and returns
	 * result quaternion. P.S. Better use {@link amc} function, it is
	 * much optimizing.
	 * @param {Quaternion} quat1
	 * @param {Quaternion} quat2
	 * @return {Quaternion}
	 * @method
	 * @static
	 */
	static sum(...quaternions) {
		if (quaternions.length == 0) {
			return new Quaternion;
		}

		var qua1 = quaternions[0],
			qua2 = quaternions[1];

		if (!(qua1 instanceof Quaternion)) {
			qua1 = new Quaternion;
		}
		if (!(qua2 instanceof Quaternion)) {
			qua2 = new Quaternion;
		}

		var euler1 = quat1.euler,
			euler2 = quat2.euler;

		var eul = new Euler(
			euler1.x + euler2.x,
			euler1.y + euler2.y,
			euler1.z + euler2.z
		);

		if (quaternions.length > 2) {
			quaternions.splice(0, 2, out);
			out = Quaternion.sum(...quaternions);
		}

		var out = Quaternion.Euler(eul);

		return out;
	}

	sum(num) {
		if (typeof num !== 'number') {
			return this;
		}

		var euler = this.euler;

		var eul = new Euler(
			euler.x + num,
			euler.y + num,
			euler.z + num
		);

		var out = Quaternion.Euler(eul);

		return out;
	}

	/**
	 * Transforms quaternion to {@link Vec4}.
	 * @return {Vec4}
	 * @method
	 */
	vec() {
		var out = new Vec4(this.x, this.y, this.z, this.w);
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
}
