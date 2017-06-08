// To set in empty functions
var anonymousfunction = function() {};

/**
 * Stores elements in object, filter can be setted by {@Storage#filter},
 * remove event by {@Storage#onremove}.
 * @class
 */
class Storage {
	constructor() {
		this.data     = {};
		this.filter   = null;
		this.onadd    = null;
		this.onremove = null;

		this.numberkeyLength_ = 0;
	}

	clear() {
		var self = this;
		this.each((data, index) => {
			self.remove(index);
		});

		this.numberkeyLength_ = 0;
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

	getLast() {
		return this.data[this.numberkeyLength - 1];
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

	get onadd() {
		return this.onadd_;
	}
	set onadd(val) {
		if (typeof val !== 'function') {
			val = anonymousfunction;
		}

		this.onadd_ = val;
	}

	get onremove() {
		return this.onremove_;
	}
	set onremove(val) {
		if (typeof val !== 'function') {
			val = anonymousfunction;
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
				this.data[index] = value;
				this.onadd(value, index, this);

				index++;
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

	set(key, value) {
		var result = true;
		if (this.filter) {
			result = this.filter(value);
		}

		if (result) {
			this.data[key] = value;
			this.onadd(value, key, this);
		}

		return result;
	}

	splice(index, count = Infinity) {
		if (index < 0) {
			index = this.numberkeyLength + index;
		}

		var cuted = [];
		this.each(function(data, ind) {
			if (ind >= index && ind < index + count) {
				cuted.push(data);
			}
		});

		var length = cuted.length;
		var self = this;
		this.each(function(data, ind) {
			if (ind >= index + length) {
				self.numberkeyLength_--;
				self.data[ind - length] = data;
				delete self.data[ind];
			}
			else if (ind >= index) {
				self.numberkeyLength_--;
				delete self.data[ind];
			}
		});

		return cuted;
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

	toObject() {
		var out = {};

		this.each((data, index) => {
			out[index] = data;
		});

		return out;
	}
}

module.exports = Storage;
