class Storage {
	constructor() {
		this.data = {};
	}

	each(callback) {
		if (typeof callback !== 'function') {
			return;
		}

		var data = this.data;
		for (var key in data) {
			if (data.hasOwnProperty(key)) {
				var item = data[key];
				callback(item, key, data);
			}
		}
	}

	find(callback) {
		if (typeof callback !== 'function') {
			return;
		}

		var out = [];

		var data = this.data;
		for (var key in data) {
			if (data.hasOwnProperty(key)) {
				bust(data[key]);
			}
		}

		return out;

		function bust(item) {
			var result = callback(item);

			if (result) {
				out.push(item);
			}
		}
	}

	get(key) {
		return this.data[key];
	}

	length() {
		var length = 0;
		for (var key in this.data) {
			if (this.data.hasOwnProperty(key)) {
				length++;
			}
		}

		return length;
	}

	numberkeyLength() {
		var length = 0;
		for (var key in this.data) {
			if (this.data.hasOwnProperty(key) && ~~key == key) {
				length++;
			}
		}

		return length;
	}

	push(data) {
		this.data[this.numberkeyLength()] = data;
	}

	set(key, data) {
		this.data[key] = data;
	}
}

module.exports = Storage;
