class Quaternion {
	constructor(x = 0, y = 0, z = 0, w = 1) {
		this.x_ = x;
		this.y_ = y;
		this.z_ = z;
		this.w_ = w;

		this.euler_ = Euler.Quaternion(x, y, z, w);
	}

	static dif(quat1, quat2) {
		var euler1 = quat1.euler,
			euler2 = quat2.euler;
		var eul = new Euler(
			euler1.x - euler2.x,
			euler1.y - euler2.y,
			euler1.z - euler2.z
		);

		var out = Quaternion.Euler(eul);

		return out;
	}

	get euler() {
		return this.euler_;
	}

	set euler(val) {
		if (val instanceof Euler) {
			this.euler_ = val;
		}
		else {
			console.warn('Quaternion: euler: error');
		}
	}

	static Euler(eul = new Euler) {
		//return quaternion by using eulers as arguments

		var roll = eul.x,
			pitch = eul.y,
			yaw = eul.z;
		var nroll, npitch, nyaw;

		nroll = Math.DTR(roll);
		npitch = Math.DTR(pitch);
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
