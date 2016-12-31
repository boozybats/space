class Euler {
	constructor(x = 0, y = 0, z = 0) {
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

	koeff(k = 1) {
		var x = this.x * k,
			y = this.y * k,
			z = this.z * k;

		var out = new Euler(x, y, z);

		return out;
	}

	static Quaternion(x = 0, y = 0, z = 0, w = 1) {
		//return euler by using quaternion as arguments

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
			Math.RTD(vec[0]),
			Math.RTD(vec[1]),
			Math.RTD(vec[2])
		);

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
