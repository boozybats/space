/**
 * Quaternions are view if angles, they helps
 * to calculate rotation matrix much easies instead
 * of eulers
 *
 * @constructor
 * @this {Quaternion}
 *  {Euler} this.euler Auto determines after creation
 * @param {number} x, y, z, w
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

		this.euler = Euler.Quaternion(x, y, z, w);
	}

	array() {
		var out = [this.x, this.y, this.z, this.w];

		return out;
	}

	static compare(quat0, quat1) {
		var out = true;

		if (typeof quat0 === 'undefined' || typeof quat1 === 'undefined') {
			out = false;
		}
		else {
			if (quat0.x !== quat1.x ||
				quat0.y !== quat1.y ||
				quat0.z !== quat1.z ||
				quat0.w !== quat1.w) {
				out = false;
			}
		}

		return out;
	}

	static dif(quat1, quat2) {
		if (!(quat1 instanceof Quaternion) ||
			!(quat2 instanceof Quaternion)) {
			throw new Error('Quaternion: dif: must be a Quaternions');
		}

		var euler1 = quat1.euler,
			euler2 = quat2.euler;
		var euler = new Euler(
			euler1.x - euler2.x,
			euler1.y - euler2.y,
			euler1.z - euler2.z
		);

		var out = Quaternion.Euler(euler);

		return out;
	}

	get euler() {
		return this.euler_;
	}
	set euler(val) {
		if (!(val instanceof Euler)) {
			throw new Error('Quaterion: euler: must be an Euler');
		}

		this.euler_ = val;
	}

	/**
	 * Transforms eulers to quaternions,
	 * function gets Eulers or x, y, and z numbers
	 *
	 * @param {Euler|number} x, y, z, w
	 * @return {Quaternion}
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
		quat.euler = new Euler(roll, pitch, yaw);

		return quat;
	}

	inverse() {
		var euler = this.euler;
		var x = -euler.x,
			y = -euler.y,
			z = -euler.z;

		var out = Quaternion.Euler(x, y, z);

		return out;
	}

	static sum(quat1, quat2) {
		if (!(quat1 instanceof Quaternion) ||
			!(quat2 instanceof Quaternion)) {
			throw new Error('Quaternion: sum: must be a Quaternions');
		}

		var euler1 = quat1.euler,
			euler2 = quat2.euler;
		var eul = new Euler(
			euler1.x + euler2.x,
			euler1.y + euler2.y,
			euler1.z + euler2.z
		);

		var out = Quaternion.Euler(eul);

		return out;
	}

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
