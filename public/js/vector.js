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
			this.length_ = arr.length;
		}
	}

	basis() {
		//return normalized vector

		var sum = Math.pow(this.x, 2) + Math.pow(this.y, 2);
		if (this.w) {
			sum += Math.pow(this.z, 2) + Math.pow(this.w, 2);
		}
		else if (this.z) {
			sum += Math.pow(this.z, 2);
		}

		var xx = this.x / sum,
			yy = this.y / sum,
			zz = this.z / sum,
			ww = this.w / sum;

		var out = this.constructor(xx, yy, zz, ww);

		return out;
	}

	static compare(vec0, vec1) {
		var out = true;
		var length0 = vec0.length,
			length1 = vec1.length;

		if (length0 == length1) {
			for (var i = 0; i < length0; i++) {
				if (vec0[i] !== vec1[i]) {
					out = false;
				}
			}
		}
		else {
			out = false;
		}

		return out;
	}

	static corner(vec1, vec2) {
		//calculate corner between 2 vectors
	
		var out = Vec.vecmulti(vec1, vec2) / (vec1.module() * vec2.module());
		out = Math.RTD(Math.acos(out));
	
		return out;
	}

	static cos(vec1, vec2) {
		//calculate cosinus between 2 vectors

		var out = Vec.vecmulti(vec1, vec2) / (vec1.module() * vec2.module());

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

	Euler() {
		var x = this.x,
			y = this.y,
			z = this.z;
	
		x = x * 180;
		y = y * 180;
		z = z * 180;

		var out = new Euler(x, y, z);
		
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

	get length() {
		return this.length_;
	}

	module() {
		//convert vector to module vector

		var length = Math.pow(this.x, 2) + Math.pow(this.y, 2);
		if (this.w) {
			length += Math.pow(this.z, 2) + Math.pow(this.w, 2);
		}
		else if (this.z) {
			length += Math.pow(this.z, 2);
		}

		return Math.sqrt(length);
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

	normal() {
		var sum = this.x + this.y;
		if (this.w) {
			sum += this.z + this.w;
		}
		else if (this.z) {
			sum += this.z;
		}

		sum = Math.abs(sum);
		var x = this.x / sum,
			y = this.y / sum,
			z = this.z / sum,
			w = this.w / sum;

		var out = this.constructor(x, y, z, w);

		return out;
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

	static vecmulti(vec1, vec2) {
		//multiply 2 vectors by module

		var out = vec1.module() * vec2.module() * Vec.cos(vec1, vec2);

		return out;
	}

	get w() {
		return this.w_;
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

	get right() {
		return [1, 0, 0];
	}

	get left() {
		return [-1, 0, 0];
	}

	get up() {
		return [0, 1, 0];
	}

	get down() {
		return [0, -1, 0];
	}

	get front() {
		return [0, 0, 1];
	}

	get back() {
		return [0, 0, -1];
	}
}

class Vec2 extends Vec {
	constructor(x = 0, y = 0) {
		super();
		if (x.constructor === Vec3 || x.constructor === Vec4) {
			y = x.y,
			x = x.x;
		}

		this.x_ = x || 0;
		this.y_ = y || 0;

		this.length_ = 2;
	}
}

class Vec3 extends Vec {
	constructor(x = 0, y = 0, z = 0) {
		super();
		if (!z && x && x.constructor === Vec2) {
			z = y,
			y = x.y,
			x = x.x;
		}
		else if (!z && y && y.constructor === Vec2) {
			x = x;
			z = y.y,
			y = y.x;
		}
		else if (!y && x && x.constructor === Vec4) {
			z = x.z,
			y = x.y,
			x = x.x;
		}

		this.x_ = x;
		this.y_ = y;
		this.z_ = z;

		this.length_ = 3;
	}
}

class Vec4 extends Vec {
	constructor(x = 0, y = 0, z = 0, w = 0) {
		super();
		if (!z && x && x.constructor == Vec2 && y && y.constructor == Vec2) {
			w = y.y,
			z = y.x,
			y = x.y,
			x = x.x;
		}
		else if (!w && x && x.constructor === Vec2) {
			w = z,
			z = y,
			y = x.y,
			x = x.x;
		}
		else if (!w && y && y.constructor === Vec2) {
			w = z,
			x = x,
			z = y.y,
			y = y.x;
		}
		else if (!w && z && z.constructor === Vec2) {
			x = x,
			y = y,
			w = z.y,
			z = z.x;
		}
		else if (!z && x && x.constructor === Vec3) {
			w = y,
			z = x.z,
			y = x.y,
			x = x.x;
		}
		else if (!z && y && y.constructor === Vec3) {
			x = x,
			w = y.z,
			z = y.y,
			y = y.x;
		}

		this.x_ = x;
		this.y_ = y;
		this.z_ = z;
		this.w_ = w;

		this.length_ = 4;
	}
}
