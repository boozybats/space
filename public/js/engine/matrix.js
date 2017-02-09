class Mat {
	constructor(a = 0, b = 0, arr) {
		//custom matrix usable only for squad matrix functions

		if (this.constructor === Mat) {
			if (!arr || arr.length == a * b) {
				for (var i = 0; i < a; i++) {
					this[i] = [];
					for (var j = 0; j < b; j++) {
						this[i][j] = arr ? arr[i * b + j] : 0;
					}
				}

				this.a_ = a;
				this.b_ = b;
			}
			else {
				console.warn('Mat: error');
			}
		}
	}

	get a() {
		return this.a_;
	}

	get array() {
		//transform matrix format into array

		var out = [];
		var a = this.a,
			b = this.b;

		for (var i = 0; i < a; i++) {
			for (var j = 0; j < b; j++) {
				out[i * a + j] = this[i][j];
			}
		}

		return out;
	}

	get b() {
		return this.b_;
	}

	static compare(mat0, mat1) {
		var out = true;
		var a0 = mat0.a,
			b0 = mat0.b;
		var a1 = mat1.a,
			b1 = mat1.b;

		if (a0 == a1 && b0 == b1) {
			for (var i = 0; i < a0; i++) {
				for (var j = 0; j < b0; j++) {
					if (mat0[i][j] !== mat1[i][j]) {
						out = false;
					}
				}
			}
		}
		else {
			out = false;
		}

		return out;
	}

	console() {
		//draw matrix as a table in console

		var max = [0, 0, 0, 0];
		var a = this.a,
			b = this.b;

		for (var i = 0; i < a; i++) {
			for (var j = 0; j < b; j++) {
				var str = this[i][j].toFixed(2);
				str = (/-/.test(str)) ? ' ' + str : '  ' + str;
				if (str.length > max[j]) {
					max[j] = str.length;
				}
			}
		}

		for (var i = 0; i < a; i++) {
			var show = '';

			for (var j = 0; j < b; j++) {
				var str = this[i][j].toFixed(2);
				str = (/-/.test(str)) ? ' ' + str : '  ' + str;
				while(max[j] > str.length) str += ' ';
				show += str;
			}

			for (var v = 0; v < i; v++) {
				show += " ";
			}

			console.log(show);
		}
	}

	det() {
		//determenant of matrix

		var out = 0;
		var a = this.a,
			b = this.b;

		if (a == b) {
			if (a == 1) {
				out = this[0][0];
			}
			else if (a == 2) {
				out = this[0][0] * this[1][1] - this[1][0] * this[0][1];
			}
			else if (a == 3) {
				out = this[0][0] * this[1][1] * this[2][2] + this[2][0] * this[0][1] * this[1][2] + this[1][0] * this[2][1] * this[0][2] -
				this[2][0] * this[1][1] * this[0][2] - this[0][0] * this[2][1] * this[1][2] - this[1][0] * this[0][1] * this[2][2];
			}
			else if (a >= 4) {
				var arr = [];

				for (var i = 0; i < a; i++) {
					arr.push(this[0][i] * this.slice(0, i).det());
				}

				for (var i = 0; i < arr.length; i++) {
					out = i % 2 == 0 ? out + arr[i] : out - arr[i];
				}
			}

			return out;
		}
		else {
			console.warn('Mat: det: error');
		}
	}

	static dif(...matrixes) {
		var mat1 = matrixes[0],
			mat2 = matrixes[1];
		var a = mat1.a,
			b = mat1.b,
			a1 = mat2.a,
			b1 = mat2.b;

		if (a == a1 && b == b1) {
			var out = new Mat(a, b);

			for (var i = 0; i < a; i++) {
				for (var j = 0; j < b; j++) {
					out[i][j] = mat1[i][j] - mat2[i][j];
				}
			}

			if (matrixes.length > 2) {
				matrixes.splice(0, 2, out);
				out = Mat.dif(...matrixes);
			}

			return out;
		}
		else {
			console.warn('Mat: dif: error');
		}
	}

	inverse() {
		var out = this;
		var a = this.a,
			b = this.b;

		if (a == b) {
			var det = this.det();

			if (det != 0) {
				var sub = [];
				for (var i = 0; i < a; i++) {
					for (var j = 0; j < b; j++) {
						sub.push(this.sub(j, i));
					}
				}

				out = new Mat(a, b, sub);
				out = out.multi(1 / det);
			}

			return out;
		}
		else {
			console.warn('Mat: inverse: error');
		}
	}

	multi(num) {
		if (typeof num === 'number') {
			var a = this.a,
				b = this.b;
			var out = new Mat(a, b);

			for (var i = 0; i < a; i++) {
				for (var j = 0; j < b; j++) {
					out[i][j] = this[i][j] * num;
				}
			}

			return out;
		}
	}

	static multi(...matrixes) {
		//multiply of matrixes

		var mat1 = matrixes[0],
			mat2 = matrixes[1];

		var a = mat1.a,
			b = mat1.b,
			b1 = mat2.a,
			c = mat2.b;
		var out = new Mat(a, c);

		if (b == b1) {
			for (var i = 0; i < a; i++) {
				for (var k = 0; k < c; k++) {
					for (var j = 0; j < b; j++) {
						out[i][j] += mat1[i][k] * mat2[k][j];
					}
				}
			}

			if (matrixes.length > 2) {
				matrixes.splice(0, 2, out);
				out = Mat.multi(...matrixes);
			}

			return out;
		}
		else {
			console.warn('Mat: multi: error');
		}
	}

	normalize() {
		var out = this;
		var a = this.a,
			b = this.b;

		out = out.transpose().inverse().slice(a - 1, b - 1);

		return out;
	}

	slice(x, y) {
		//matrix with sliced column and row

		var a = this.a,
			b = this.b;
		var s = 0, z = 0;

		var out = this.slicer(x);
		out = out.slicec(y);

		return out;
	}

	slicec(x) {
		//matrix with sliced column

		var a = this.a,
			b = this.b;

		if (b > 1) {
			var z = 0;
			var out = new Mat(a, b - 1);

			for (var i = 0; i < a; i++) {
				for (var j = 0; j < b; j++) {
					if (j != x) {
						z = j < x ? j : j - 1;
						out[i][z] = this[i][j];
					}
				}
			}

			return out;
		}
		else {
			console.warn('Mat: slicec: error');
		}
	}

	slicer(y) {
		//matrix with sliced row

		var a = this.a,
			b = this.b;

		if (a > 1) {
			var z = 0;
			var out = new Mat(a - 1, b);

			for (var i = 0; i < a; i++) {
				for (var j = 0; j < b; j++) {
					if (i != y) {
						z = i < y ? i : i - 1;
						out[z][j] = this[i][j];
					}
				}
			}

			return out;
		}
		else {
			console.warn('Mat: slicer: error');
		}
	}

	sub(x, y) {
		//sub-matrixes of matrix, x and y - key's positions

		var out;
		var a = this.a,
			b = this.b;

		if (a == b) {
			var cut = this.slice(x, y);
			out = Math.pow(-1, x + y) * cut.det();

			return out;
		}
		else {
			console.warn('Mat: sub: error');
		}
	}

	static sum(...matrixes) {
		var mat1 = matrixes[0],
			mat2 = matrixes[1];
		var a = mat1.a,
			b = mat1.b,
			a1 = mat2.a,
			b1 = mat2.b;

		if (a == a1 && b == b1) {
			var out = new Mat(a, b);

			for (var i = 0; i < a; i++) {
				for (var j = 0; j < b; j++) {
					out[i][j] = mat1[i][j] + mat2[i][j];
				}
			}

			if (matrixes.length > 2) {
				matrixes.splice(0, 2, out);
				out = Mat.sum(...matrixes);
			}

			return out;
		}
		else {
			console.warn('Mat: sum: error');
		}
	}

	transform(arr) {
		//vectorize array by matrix

		var num = this.a - 1;
		var narr = [];

		for (var i = 0, length = arr.length / num; i < length; i++) {
			var vecarr = [];
			for (var z = 0; z < num; z++) {
				vecarr.push(arr[i * num + z]);
			}

			var vec = new Vec(...vecarr);
			vec = this.Vec(vec);

			for (z in vec) {
				if (z.length == 1) {
					narr.push(vec[z]);
				}
			}
		}

		return narr;
	}

	transpose() {
		//reverse matrix

		var a = this.a,
			b = this.b;
		var out = new Mat(b, a);

		for (var i = 0; i < a; i++) {
			for (var j = 0; j < b; j++) {
				out[j][i] = this[i][j];
			}
		}

		return out;
	}

	Vec(vec, ...args) {
		//transform matrix(x + 1) and vector(x) at vector(x)

		function isNum(val) {
			return typeof val === 'number';
		}

		var a = this.a,
			b = this.b;

		if (a == b) {
			var x, y, z, w;
			if (typeof vec === 'number') {
				x = vec,
				y = args[0],
				z = args[1],
				w = args[2];
			}
			else {
				x = vec.x,
				y = vec.y,
				z = vec.z,
				w = vec.w;
			}

			var res = isNum(x) + isNum(y) + isNum(z) + isNum(w);
			var out;
			var oldvec = [x, y, z, w],
				newvec = [
					this[res][0],
					this[res][1],
					this[res][2],
					this[res][3]
				];

			if (a == res + 1) {
				for (var i = 0; i < res; i++) {
					for (var j = 0; j < res; j++) {
						newvec[i] += oldvec[j] * this[i][j];
					}
				}

				var Type = res == 2 ? Vec2 : Vec3;

				out = new Type(newvec[0], newvec[1], newvec[2], newvec[3]);
				return out;
			}
			else {
				console.warn('Mat: vec: error');
			}
		}
		else {
			console.warn('Mat: vec: error');
		}
	}
}

class Mat2 extends Mat {
	constructor(arr = []) {
		super();
		var filler = typeof arr == 'number' ? arr : undefined;

		for (var i = 0; i < 2; i++) {
			this[i] = [];
			for (var j = 0; j < 2; j++) {
				if (arr && isFinite(arr[i * 2 + j])) {
					this[i][j] = arr[i * 2 + j];
				}
				else {
					this[i][j] = isFinite(filler) ? filler : (i == j ? 1 : 0);
				}
			}
		}

		this.a_ = this.b_ = 2;
	}
}

class Mat3 extends Mat {
	constructor(arr = []) {
		super();
		var filler = typeof arr == 'number' ? arr : undefined;

		for (var i = 0; i < 3; i++) {
			this[i] = [];
			for (var j = 0; j < 3; j++) {
				if (arr && isFinite(arr[i * 3 + j])) {
					this[i][j] = arr[i * 3 + j];
				}
				else {
					this[i][j] = isFinite(filler) ? filler : (i == j ? 1 : 0);
				}
			}
		}

		this.a_ = this.b_ = 3;
	}

	static scale(vec) {
		var x = vec.x,
			y = vec.y;
		var out = new Mat3();

		out[0][0] = x;
		out[1][1] = y;

		return out;
	}

	static translate(vec) {
		var x = vec.x,
			y = vec.y;
		var out = new Mat3;

		out[2][0] = x;
		out[2][1] = y;

		return out;
	}
}

class Mat4 extends Mat {
	constructor(arr = []) {
		super();
		var filler = typeof arr == 'number' ? arr : undefined;

		for (var i = 0; i < 4; i++) {
			this[i] = [];
			for (var j = 0; j < 4; j++) {
				if (arr && isFinite(arr[i * 4 + j])) {
					this[i][j] = arr[i * 4 + j];
				}
				else {
					this[i][j] = isFinite(filler) ? filler : (i == j ? 1 : 0);
				}
			}
		}

		this.a_ = this.b_ = 4;
	}

	static orthogonal(near, far) {
		var d = far - near;
		var out = new Mat4([
				d, 0, 0, 0,
				0, d, 0, 0,
				0, 0, 1, 0,
				0, 0, 0, 1
			]);

		return out;
	}

	static perspective(ratio, near, far, fov) {
		fov = Math.DTR(fov);
		var y = Math.cos(fov / 2) / Math.sin(fov / 2);
		var x = y / ratio;
		var d = 1;
		var out = new Mat4([
			x, 0, 0, 0,
			0, y, 0, 0,
			0, 0, far / (far - near), d,
			0, 0, -(far * near) / (far - near), 0
		]);

		return out;
	}

	static rotate(quat) {
		var x = quat.x,
			y = quat.y,
			z = quat.z,
			w = quat.w;
		var out = new Mat4;

		out[0][0] = 1 - 2 * Math.pow(y, 2) - 2 * Math.pow(z, 2);
		out[0][1] = 2 * x * y - 2 * z * w;
		out[0][2] = 2 * x * z + 2 * y * w;
		out[1][0] = 2 * x * y + 2 * z * w;
		out[1][1] = 1 - 2 * Math.pow(x, 2) - 2 * Math.pow(z, 2);
		out[1][2] = 2 * y * z - 2 * x * w;
		out[2][0] = 2 * x * z - 2 * y * w;
		out[2][1] = 2 * y * z + 2 * x * w;
		out[2][2] = 1 - 2 * Math.pow(x, 2) - 2 * Math.pow(y, 2);

		return out;
	}

	static scale(vec) {
		var x = vec.x,
			y = vec.y,
			z = vec.z;
		var out = new Mat4;

		out[0][0] = x;
		out[1][1] = y;
		out[2][2] = z;

		return out;
	}

	static translate(vec) {
		var x = vec.x,
			y = vec.y,
			z = vec.z;
		var out = new Mat4;

		out[3][0] = x;
		out[3][1] = y;
		out[3][2] = z;

		return out;
	}
}
