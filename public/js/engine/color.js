/**
 * Array of numbers (red, green, blue, alpha-channel) that
 * creates web-color.
 * @this {Color}
 * @param {Number} r Red (0-255)
 * @param {Number} g Green (0-255)
 * @param {Number} b Blue (0-255)
 * @param {Number} a Alpha-channel (0-1)
 * @class
 * @property {Number} size How much numbers in color (3-4)
 * @property {Color} rgb Red, Green and Blue channels color
 * @property {Color} rgba Red, Green, Blue and Alpha channels
 * color
 */
function Color() {
    var args = arguments;
    var length = Math.min(args.length, 4);

    for (var i = 0; i < length; i++) {
        var element = args[i];

        switch (i) {
            case 0:
            case 1:
            case 2:
                if (typeof element !== 'number') {
                    warn('Color', 'element', element);
                    element = 0;
                } else if (element < 0 || element > 255) {
                    log('Warn: Color: "rgb" must be in range 0-255');
                    element = 0;
                }
                break;

            case 3:
                if (typeof element !== 'number') {
                    warn('Color', 'element', element);
                    element = 0;
                } else if (element < 0 || element > 1) {
                    log('Warn: Color: "alpha" must be in range 0-1');
                    element = 0;
                }
                break;
        }
    }

    this.r_ = arr[0];
    this.g_ = arr[1];
    this.b_ = arr[2];
    this.a_ = arr[3];

    this.size_ = length;
}

Object.defineProperties(Color.prototype, {
    a: {
        get: function() {
            return this.a_;
        }
    },
    b: {
        get: function() {
            return this.b_;
        }
    },
    g: {
        get: function() {
            return this.g_;
        }
    },
    r: {
        get: function() {
            return this.r_;
        }
    },
    rgb: {
        get: function() {
            if (this.size == 4) {
                return new Color(this.x, this.y, this.z);
            } else {
                return this;
            }
        }
    },
    rgba: {
        get: function() {
            if (this.size == 3) {
                return new Color(this.x, this.y, this.z, 0);
            } else {
                return this;
            }
        }
    },
    size: {
        get: function() {
            return this.size_;
        }
    },
    x: {
        get: function() {
            return this.r_;
        }
    },
    y: {
        get: function() {
            return this.g_;
        }
    },
    z: {
        get: function() {
            return this.b_;
        }
    },
    w: {
        get: function() {
            return this.a_;
        }
    }
});

/**
 * Returns an array from color numbers.
 * @return {Array}
 * @method
 */
Color.prototype.array = function() {
    var out = [this.r, this.g, this.b];

    if (this.size === 4) {
        out.push(this.a);
    }

    return out;
}

/**
 * Returns color with divided Red, Green and Blue
 * channels on 255.
 * @return {Color}
 * @method
 */
Color.prototype.toUnit = function() {
    var arr = [
        this.r / 255,
        this.g / 255,
        this.b / 255
    ];

    if (this.size === 4) {
        var out = new Color(arr[0], arr[1], arr[2], this.a);
    } else {
        var out = new Color(arr[0], arr[1], arr[2]);
    }

    return out;
}

/**
 * Transforms Color in {@link Vec}.
 * @return {Vec}
 * @method
 */
Color.prototype.vec = function() {
	var arr = this.array();
    var out = new Vec(arr[0], arr[1], arr[2], arr[3]);

    return out;
}
