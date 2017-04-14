/**
 * Stores elements in object, filter can be setted by {@Storage#filter},
 * remove event by {@Storage#onremove}.
 * @class
 */
class Storage {
	constructor() {
		this.data     = {};
		this.filter   = null;
		this.onremove = null;

		this.numberkeyLength_ = 0;
	}

	/**
	 * Returns array with numberic-keys elements in data leading in order.
	 * @return {Array}
	 */
	toArray() {
		var out = [];
		var length = this.numberkeyLength;

		for (var i = 0; i < length; i++) {
			out.push(this.data[i]);
		}

		return out;
	}

	/**
	 * Goes through all elements and stop cycling if callback is
	 * returning "false".
	 * @param  {Function} callback
	 */
	each(callback) {
		if (typeof callback !== 'function') {
			return;
		}

		var data = this.data;
		for (var key in data) {
			if (data.hasOwnProperty(key)) {
				var item = data[key];
				var result = callback(item, key, data);

				if (result === false) {
					break;
				}
			}
		}
	}

	get filter() {
		return this.filter_;
	}
	set filter(val) {
		if (typeof val !== 'function') {
			val = function() {
				return true;
			}
		}

		this.filter_ = val;
	}

	/**
	 * Goes through all elements and adds to array if callback returns positive
	 * value. Sends element, key-position, and data-array to callback.
	 * @param  {Function} callback
	 */
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

	get length() {
		var length = 0;
		for (var key in this.data) {
			if (this.data.hasOwnProperty(key)) {
				length++;
			}
		}

		return length;
	}

	/**
	 * Returns length of object as it's array.
	 * @return {Number}
	 */
	get numberkeyLength() {
		return this.numberkeyLength_;
	}

	toObject() {
		var out = {};

		this.each((data, index) => {
			out[index] = data;
		});

		return out;
	}

	get onremove() {
		return this.onremove_;
	}
	set onremove(val) {
		if (typeof val !== 'function') {
			val = function() {};
		}

		this.onremove_ = val;
	}

	/**
	 * Equal to native "push"-function for array, but returns element's
	 * key-position.
	 * @return {Number}
	 */
	push() {
		var args = arguments;

		var index = this.numberkeyLength, result;
		for (var i = 0; i < args.length; i++) {
			var value = args[i];

			result = true;
			if (this.filter) {
				result = this.filter(value);
			}

			if (result) {
				this.numberkeyLength_++;
				this.data[index++] = value;
			}
		}

		return index;
	}

	remove(key) {
		var data = this.data[key];

		if (this.onremove) {
			this.onremove(data, key, this.data);
		}

		if (typeof data === 'undefined') {
			return false;
		}

		delete this.data[key];

		return true;
	}

	set(key, data) {
		var result = true;
		if (this.filter) {
			result = this.filter(data);
		}

		if (result) {
			this.data[key] = data;
		}

		return result;
	}
}
