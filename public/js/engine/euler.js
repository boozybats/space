/**
 * Habitual kind of angles which value
 * is degress between 0 and 360
 *
 * @constructor
 * @this {Euler}
 * @param {number} x, y, z degrees
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

	array() {
		var out = [this.x, this.y, this.z];

		return out;
	}

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
	 * Transforms quaternions to eulers,
	 * function gets Quaternions or x, y, z and w numbers
	 *
	 * @param {Quaternion|number} x, y, z, w
	 * @return {Euler}
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
