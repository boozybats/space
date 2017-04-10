class Storage {
	constructor() {
		this.data     = {};
		this.filter   = null;
		this.onremove = null;
	}

	array() {
		var out = [];
		var length = this.numberkeyLength;

		for (var i = 0; i < length; i++) {
			out.push(this.data[i]);
		}

		return out;
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
		while (typeof this.data[length] !== 'undefined') {
			length++;
		}

		return length;
	}

	push(data) {
		var result = true;
		if (typeof this.filter === 'function') {
			result = this.filter(data);
		}

		if (result) {
			result = this.numberkeyLength();
			this.data[result] = data;
		}

		return result;
	}

	remove(key) {
		var data = this.data[key];

		if (typeof this.onremove === 'function') {
			this.onremove(data, key, this.data);
		}

		if (typeof data !== 'undefined') {
			delete this.data[key];
			
			return true;
		}

		return false;
	}

	set(key, data) {
		var result = true;
		if (typeof this.filter === 'function') {
			result = this.filter(data);
		}

		if (result) {
			this.data[key] = data;
		}

		return result;
	}
}
