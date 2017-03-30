class Storage() {
	constructor() {
		this.data_array = [];
		this.data_object = {};
	}

	each(callback) {
		if (typeof callback !== 'function') {
			return;
		}

		var array = this.data_array;
		for (var i = 0; i < array.length; i++) {
			callback(item, i, array);
		}

		var object = this.data_object;
		for (var key in object) {
			if (this.data_object.hasOwnProperty(key)) {
				var item = this.data_object[key];
				callback(item, key, object);
			}
		}
	}

	find(callback) {
		if (typeof callback !== 'function') {
			return;
		}

		var out = [];

		for (var item of this.data_array) {
			bust(item);
		}

		for (var key in this.data_object) {
			if (this.data_object.hasOwnProperty(key)) {
				bust(this.data_object[key]);
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
		return this.data_object[key];
	}

	length() {
		var length = this.data_array.length;
		for (var key in this.data_object) {
			if (this.data_object.hasOwnProperty(key)) {
				length++;
			}
		}

		return length;
	}

	push(data) {
		this.data_array.push(data);
	}

	set(key, data) {
		this.data_object[key] = data;
	}
}

module.exports = Storage;
