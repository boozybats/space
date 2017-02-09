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

	get array() {
		var out = [this.x, this.y];

		if (typeof this.w !== 'undefined') {
			out.push(this.z, this.w);
		}
		else if (typeof this.z !== 'undefined') {
			out.push(this.z);
		}

		return out;
	}

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
			var length0 = vec0.length,
				length1 = vec1.length;

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

	static dot(...vectors) {
		//multiply 2 vectors (not module)

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

	get length() {
		return this.length_;
	}

	module() {
		//convert vector to module vector

		var length = Math.pow(this.x, 2) + Math.pow(this.y, 2);
		if (typeof this.w !== 'undefined') {
			length += Math.pow(this.z, 2) + Math.pow(this.w, 2);
		}
		else if (typeof this.z !== 'undefined') {
			length += Math.pow(this.z, 2);
		}

		return Math.sqrt(length);
	}

	multi(num) {
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
		var Type = vec1.length >= vec2.length ? vec1.constructor : vec2.constructor;

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
		var x = this.x,
			y = this.y,
			z = this.z || 0,
			w = this.w || 0;
		var length = Math.sqrt(x * x + y * y + z * z + w * w);

		var x = (this.x / length) || 0,
			y = (this.y / length) || 0,
			z = (this.z / length) || 0,
			w = (this.w / length) || 0;

		var Type = this.constructor;
		var out = new Type(x, y, z, w);

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
