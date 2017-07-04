/**
 * Stores elements in object, filter can be setted by {@Storage#filter},
 * remove event by {@Storage#onremove}.
 * @class
 */
function Storage() {
    this.data = {};
    this.filter = null;
    this.onadd = null;
    this.onremove = null;

    this.numberkeyLength_ = 0;
}

Object.defineProperties(Storage.prototype, {
    filter: {
        get: function() {
            return this.filter_;
        },
        set: function(val) {
            if (typeof val !== 'function') {
                val = function() {
                    return true;
                }
            }

            this.filter_ = val;
        }
    },
    length: {
        get: function() {
            var length = 0;
            for (var key in this.data) {
                if (this.data.hasOwnProperty(key)) {
                    length++;
                }
            }

            return length;
        }
    },
    numberkeyLength: {
        get: function() {
            return this.numberkeyLength_;
        }
    },
    onadd: {
        get: function() {
            return this.onadd_;
        },
        set: function(val) {
            if (typeof val !== 'function') {
                val = function() {};
            }

            this.onadd_ = val;
        }
    },
    onremove: {
        get: function() {
            return this.onremove_;
        },
        set: function(val) {
            if (typeof val !== 'function') {
                val = function() {};
            }

            this.onremove_ = val;
        }
    }
});

Storage.prototype.clear = function() {
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
Storage.prototype.each = function(callback) {
    if (typeof callback !== 'function') {
        return;
    }

    var data = this.data;
    for (var key in data) {
        if (data.hasOwnProperty(key)) {
            var item = data[key];
            var result = callback(item, key, this);

            if (result === false) {
                break;
            }
        }
    }
}

/**
 * Goes through all elements and adds to array if callback returns positive
 * value. Sends element, key-position, and data-array to callback.
 * @param  {Function} callback
 */
Storage.prototype.find = function(callback) {
    if (typeof callback !== 'function') {
        return;
    }

    var self = this;
    var out = [];

    var data = this.data;
    for (var key in data) {
        if (data.hasOwnProperty(key)) {
            bust(data[key], key);
        }
    }

    return out;

    function bust(item, key) {
        var result = callback(item, key, self);

        if (result) {
            out.push(item);
        }
    }
}

Storage.prototype.get = function(key) {
    return this.data[key];
}

Storage.prototype.getLast = function() {
    return this.data[this.numberkeyLength - 1];
}

Storage.prototype.indexOf = function(el) {
    var index = -1;

    this.each((value, key) => {
        if (el === value) {
            index = key;
            return false;
        }
    });

    return index;
}

/**
 * Equal to native "push"-function for array, but returns element's
 * key-position.
 * @return {Number}
 */
Storage.prototype.push = function() {
    var args = arguments;

    var index = this.numberkeyLength,
        result;
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

Storage.prototype.remove = function(key) {
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

Storage.prototype.set = function(key, value) {
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

Storage.prototype.splice = function(index, count = Infinity) {
    if (index < 0) {
        index = this.numberkeyLength + index;
    }

    var cuted = [];
    this.each((data, ind) => {
        if (ind >= index && ind < index + count) {
            cuted.push(data);
        }
    });

    var length = cuted.length;
    this.numberkeyLength_ -= length;
    var self = this;
    this.each((data, ind) => {
        if (ind >= index + length) {
            self.data[ind - length] = data;
            delete self.data[ind];
        } else if (ind >= index) {
            delete self.data[ind];
        }
    });

    return cuted;
}

/**
 * Returns array with numberic-keys elements in data leading in order.
 * @return {Array}
 */
Storage.prototype.toArray = function() {
    var out = [];
    var length = this.numberkeyLength;

    for (var i = 0; i < length; i++) {
        out.push(this.data[i]);
    }

    return out;
}

Storage.prototype.toObject = function() {
    var out = {};

    this.each((data, index) => {
        out[index] = data;
    });

    return out;
}

module.exports = Storage;
