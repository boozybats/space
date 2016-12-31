class Vec {
	constructor() {
	}

	static class(...arr) {
		//return vector class same arguments length

		var out;
		switch (arr.length) {
			case 2:
			out = new Vec2(...arr);
			break;

			case 3:
			out = new Vec3(...arr);
			break;

			case 4:
			out = new Vec4(...arr);
			break;
		}

		return out;
	}

	inline() {
		//transform vector in array [vec.x, vec.y, ...]

		var out = [this.x, this.y];

		if (isFinite(this.w)) {
			out.push(this.z, this.w);
		}
		else if (isFinite(this.z)) {
			out.push(this.z);
		}

		return out;
	}

	euler() {
		var x = this.x,
			y = this.y,
			z = this.z;
	
		x = x * 180;
		y = y * 180;
		z = z * 180;
	
		return new Euler(x, y, z);
	}

	static sum(...vectors) {
		var vec1 = vectors[0],
			vec2 = vectors[1];
		var Type = vec1.length >= vec2.length ? vec1.constructor : vec2.constructor;

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

	static dif(...vectors) {
		var vec1 = vectors[0],
			vec2 = vectors[1];
		var Type = vec1.length >= vec2.length ? vec1.constructor : vec2.constructor;

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

	inverse() {
		var x = -this.x,
			y = -this.y,
			z, w;

		if (this.w) {
			z = -this.z;
			w = -this.w;
		}
		else if (this.z) {
			z = -this.z;
		}

		var out = new this.constructor(x, y, z, w);

		return out;
	}

	static multi(...vectors) {
		//multiply 2 vectors (not module)

		var vec1 = vectors[0];
		var vec2 = vectors[1];

		var out = vec1.x * vec2.x + vec1.y * vec2.y;
		if (vec1.w && vec2.w) {
			out += vec1.z * vec2.z;
			out += vec1.w * vec2.w;
		}
		else if (vec1.z && vec2.z) {
			out += vec1.z * vec2.z;
		}

		if (vectors.length > 2) {
			vectors.splice(0, 2, out);
			out = Vec.sum(...vectors);
		}

		return out;
	}
}

vec.normal = function(vec1) {
	var sum = vec1.x + vec1.y;
	if (vec1.z) sum += vec1.z;
	if (vec1.w) sum += vec1.w;

	sum = Math.abs(sum);

	var x = vec1.x / sum,
		y = vec1.y / sum,
		z = vec1.z / sum,
		w = vec1.w / sum;

	return vec1.constructor(x, y, z, w);
};

vec.vecmulti = function(vec1, vec2) {
	//multiply 2 vectors by module

	var out = vec.module(vec1) * vec.module(vec2) * vec.cos(vec1, vec2);

	return out;
};

vec.module = function(vec) {
	//convert vector to module vector

	var len = Math.pow(vec.x, 2) + Math.pow(vec.y, 2);
	if (vec.z) len += Math.pow(vec.z, 2);
	if (vec.w) len += Math.pow(vec.w, 2);

	return Math.sqrt(len);
};

vec.basis = function(vec) {
	//return normalized vector

	var sum = Math.pow(vec.x, 2) + Math.pow(vec.y, 2);
	if (vec.z) sum += Math.pow(vec.z, 2);
	if (vec.w) sum += Math.pow(vec.w, 2);

	var xx = vec.x / sum,
		yy = vec.y / sum,
		zz = vec.z / sum,
		ww = vec.w / sum;

	return vec.constructor(xx, yy, zz, ww);
};

vec.Corner = function(vec1, vec2) {
	//calculate corner between 2 vectors

	var out = vec.vecmulti(vec1, vec2) / (vec.module(vec1) * vec.module(vec2));
	out = Madth.RTD(Math.acos(out));

	return out;
};

vec.cos = function(vec1, vec2) {
	//calculate cosinus between 2 vectors

	var out = vec.vecmulti(vec1, vec2) / (vec.module(vec1) * vec.module(vec2));

	return out;
};

function def(obj, name, value) {
	Object.defineProperty(obj, name, {
		value: value,
		writable: false
	});
};

def(vec, 'right',  [-1, 0, 0]);
def(vec, 'left',   [1, 0, 0]);
def(vec, 'up',     [0, 1, 0]);
def(vec, 'down',   [0, -1, 0]);
def(vec, 'front',  [0, 0, 1]);
def(vec, 'back',   [0, 0, -1]);

function vec2(x, y) {
	//return vector with x, y

	if (x.constructor == vec3 || x.constructor == vec4) {
		y = x.y,
		x = x.x;
	}

	var item = {
		x: x || 0,
		y: y || 0
	};

	item.length = 2;
	item.constructor = vec2;

	return item;
};

function vec3(x, y, z) {
	//return vector with x, y, z

	if (x && x.constructor == vec2 && !z) {
		z = y,
		y = x.y,
		x = x.x;
	}
	else if (y && y.constructor == vec2 && !z) {
		x = x;
		z = y.y,
		y = y.x;
	}
	else if (x && x.constructor == vec4 && !y) {
		z = x.z,
		y = x.y,
		x = x.x;
	}

	var item = {
		x: x || 0,
		y: y || 0,
		z: z || 0
	};

	item.length = 3;
	item.constructor = vec3;

	return item;
};

function vec4(x, y, z, w) {
	//return vector with x, y, z, w

	if (x && x.constructor == vec2 && y && y.constructor == vec2 && !z) {
		w = y.y,
		z = y.x,
		y = x.y,
		x = x.x;
	}
	else if (x && x.constructor == vec2 && !w) {
		w = z,
		z = y,
		y = x.y,
		x = x.x;
	}
	else if (y && y.constructor == vec2 && !w) {
		w = z,
		x = x,
		z = y.y,
		y = y.x;
	}
	else if (z && z.constructor == vec2 && !w) {
		x = x,
		y = y,
		w = z.y,
		z = z.x;
	}
	else if (x && x.constructor == vec3 && !z) {
		w = y,
		z = x.z,
		y = x.y,
		x = x.x;
	}
	else if (y && y.constructor == vec3 && !z) {
		x = x,
		w = y.z,
		z = y.y,
		y = y.x;
	}

	var item = {
		x: x || 0,
		y: y || 0,
		z: z || 0,
		w: w || 0
	};

	item.length = 4;
	item.constructor = vec4;

	return item;
};

function quaternion(x, y, z, w) {
	//return quaternion

	var item = {
		x: x || 0,
		y: y || 0,
		z: z || 0,
		w: typeof w === 'undefined' ? w : 1
	}

	item.euler = euler.quaternion(x, y, z, w);
	item.constructor = quaternion;
	return item;
};

quaternion.euler = function(eul) {
	//return quaternion by using eulers as arguments

	var roll, pitch, yaw,
		nroll, npitch, nyaw;
	if (typeof eul == "number" || !eul) {
		var arg = arguments;
		roll = arg[0] || 0;
		pitch = arg[1] || 0;
		yaw = arg[2] || 0;
	}
	else {
		roll = eul.x;
		pitch = eul.y;
		yaw = eul.z;
	}
	nroll = Madth.DTR(roll);
	npitch = Madth.DTR(pitch);
	nyaw = Madth.DTR(yaw);

	var sr, sp, sy, cr, cp, cy;

	sy = Math.sin(nyaw * .5);
	cy = Math.cos(nyaw * .5);
	sp = Math.sin(npitch * .5);
	cp = Math.cos(npitch * .5);
	sr = Math.sin(nroll * .5);
	cr = Math.cos(nroll * .5);

	var srcp = sr * cp, crsp=cr * sp,
		crcp = cr * cp, srsp=sr * sp;

	var quat = quaternion(srcp * cy - crsp * sy,
		crsp * cy + srcp * sy,
		crcp * sy - srsp * cy,
		crcp * cy + srsp * sy);
	quat.euler = euler(roll, pitch, yaw);

	return quat;
};

quaternion.inverse = function(quat) {
	//inverse quaternion

	var x = -quat.euler.x,
		y = -quat.euler.y,
		z = -quat.euler.z;

	return quaternion.euler(x, y, z);
};

quaternion.sum = function(quat1, quat2) {
	//sum of two quaternions

	var eul = euler(quat1.euler.x + quat2.euler.x,
		quat1.euler.y + quat2.euler.y,
		quat1.euler.z + quat2.euler.z);

	var out = quaternion.euler(eul);

	return out;
};

quaternion.dif = function(quat1, quat2) {
	//difference of two quaternions

	var eul = euler(quat1.euler.x - quat2.euler.x,
		quat1.euler.y - quat2.euler.y,
		quat1.euler.z - quat2.euler.z);

	var out = quaternion.euler(eul);

	return out;
};

function euler(x, y, z) {
	//return euler

	while(x>=360) x -= 360; while(x < 0) x += 360;
	while(y>=360) y -= 360; while(y < 0) y += 360;
	while(z>=360) z -= 360; while(z < 0) z += 360;

	var item = {
		x: x || 0,
		y: y || 0,
		z: z || 0
	}

	item.constructor = euler;
	return item;
};

euler.koeff = function(eul, k) {
	//multiply euler on argument

	var x = eul.x * k,
		y = eul.y * k,
		z = eul.z * k;

	return euler(x, y, z);
};

euler.quaternion = function(x, y, z, w) {
	//return euler by using quaternion as arguments

	var m = new Array(15),
		xx = x * x, x2 = x * 2,
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

	var a, xyDist = Math.sqrt(m[0] * m[0] + m[1] * m[1]);

	if (xyDist > Number.EPSILON) {
		var inv = m[10] > 0;

		if (inv) {
			a = vec3(
				Math.atan2(m[6], m[10]),
				Math.atan2(m[1], m[0]),
				Math.atan2(-m[2], xyDist)
			);
		}
		else {
			a = vec3(
				-Math.atan2(m[6], -m[10]),
				-Math.atan2(m[1], -m[0]),
				-Math.atan2(m[2], -xyDist)
			);
		}
	}

	else {
		a = vec3(0,
			Math.atan2( - m[4], m[5]),
			Math.atan2( - m[2], xyDist));
	}

	a = euler(Madth.RTD(a[0]), Madth.RTD(a[1]), Madth.RTD(a[2]));
	return a;
};