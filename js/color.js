class Color {
	constructor(...arr) {
		var keys = ['r', 'g', 'b', 'a'];
		for (var i = 0; i < arr.length; i++) {
			this[i] = arr[i];
			this[keys[i]] = arr[i];
		}

		this.length = arr.length;
	}

	halfinverse() {
		var out = [];
		for (var i = 0; i < this.length; i++) {
			if (i <= 2) {
				out.push(Math.abs(125 - this[i]));
			}
		}

		out = new Color(...out);

		return out;
	}

	inverse() {
		var out = [];
		for (var i = 0; i < this.length; i++) {
			if (i <= 2) {
				out.push(255 - this[i]);
			}
		}

		out = new Color(...out);

		return out;
	}

	negative() {
		var out = [];
		for (var i = 0; i < this.length; i++) {
			if (i <= 2) {
				out.push(256 - this[i]);
			}
		}

		out = new Color(...out);

		return out;
	}

	get rgb() {
		var out = `rgb(${this[0]}, ${this[1]}, ${this[2]})`;

		return out;
	}
}
