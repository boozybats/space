/**
 * Vector contains 2-4 values by keys x, y, z and w.
 * @this {Vec}
 * @param {Number} x
 * @param {Number} y
 * @param {Number} z
 * @param {Number} w
 * @class
 * @property {Vec} x-wzyx Returns new vector with coordinates
 * in new order.
 */
function Vec() {
    if (this.constructor === Vec) {
        var args = arguments;

        var x = args[0],
            y = args[1],
            z = args[2],
            w = args[3];

        var size = 0;

        if (x && typeof x !== 'number') {
            x = 0;
            size++;
        } else if (typeof x === 'number') {
            size++;
        }
        if (y && typeof y !== 'number') {
            y = 0;
            size++;
        } else if (typeof y === 'number') {
            size++;
        }
        if (z && typeof z !== 'number') {
            z = 0;
            size++;
        } else if (typeof z === 'number') {
            size++;
        }
        if (w && typeof w !== 'number') {
            w = 0;
            size++;
        } else if (typeof w === 'number') {
            size++;
        }

        switch (size) {
            case 4:
                this.w_ = w;

            case 3:
                this.z_ = z;

            case 2:
                this.x_ = x;
                this.y_ = y;
        }

        this.size_ = size;
    }
}

Object.defineProperties(Vec.prototype, {
    size: {
        get: function() {
            return this.size_;
        }
    },
    x: {
        get: function() {
            return this.x_;
        },
        set: function() {
            warnfree('"Vec" coordinates can not be changed, instance new "Vec"');
        }
    },
    y: {
        get: function() {
            return this.y_;
        },
        set: function() {
            warnfree('"Vec" coordinates can not be changed, instance new "Vec"');
        }
    },
    z: {
        get: function() {
            return this.z_;
        },
        set: function() {
            warnfree('"Vec" coordinates can not be changed, instance new "Vec"');
        }
    },
    w: {
        get: function() {
            return this.w_;
        },
        set: function() {
            warnfree('"Vec" coordinates can not be changed, instance new "Vec"');
        }
    },
    xy: {
        get: function() {
            var out = new Vec2(this.x_, this.y_);

            return out;
        }
    },
    xz: {
        get: function() {
            var out = new Vec2(this.x_, this.z_);

            return out;
        }
    },
    xw: {
        get: function() {
            var out = new Vec2(this.x_, this.w_);

            return out;
        }
    },
    yx: {
        get: function() {
            var out = new Vec2(this.y_, this.x_);

            return out;
        }
    },
    yz: {
        get: function() {
            var out = new Vec2(this.y_, this.z_);

            return out;
        }
    },
    yw: {
        get: function() {
            var out = new Vec2(this.y_, this.w_);

            return out;
        }
    },
    zx: {
        get: function() {
            var out = new Vec2(this.z_, this.x_);

            return out;
        }
    },
    zy: {
        get: function() {
            var out = new Vec2(this.z_, this.y_);

            return out;
        }
    },
    zw: {
        get: function() {
            var out = new Vec2(this.z_, this.w_);

            return out;
        }
    },
    wx: {
        get: function() {
            var out = new Vec2(this.w_, this.x_);

            return out;
        }
    },
    wy: {
        get: function() {
            var out = new Vec2(this.w_, this.y_);

            return out;
        }
    },
    wz: {
        get: function() {
            var out = new Vec2(this.w_, this.z_);

            return out;
        }
    },
    xyz: {
        get: function() {
            var out = new Vec3(this.x_, this.y_, this.z_);

            return out;
        }
    },
    xyw: {
        get: function() {
            var out = new Vec3(this.x_, this.y_, this.w_);

            return out;
        }
    },
    xzw: {
        get: function() {
            var out = new Vec3(this.x_, this.z_, this.w_);

            return out;
        }
    },
    xwz: {
        get: function() {
            var out = new Vec3(this.x_, this.w_, this.z_);

            return out;
        }
    },
    xzy: {
        get: function() {
            var out = new Vec3(this.x_, this.z_, this.y_);

            return out;
        }
    },
    xwy: {
        get: function() {
            var out = new Vec3(this.x_, this.w_, this.y_);

            return out;
        }
    },
    yzw: {
        get: function() {
            var out = new Vec3(this.y_, this.z_, this.w_);

            return out;
        }
    },
    ywz: {
        get: function() {
            var out = new Vec3(this.y_, this.w_, this.z_);

            return out;
        }
    },
    yxz: {
        get: function() {
            var out = new Vec3(this.y_, this.x_, this.z_);

            return out;
        }
    },
    yxw: {
        get: function() {
            var out = new Vec3(this.y_, this.x_, this.w_);

            return out;
        }
    },
    yzx: {
        get: function() {
            var out = new Vec3(this.y_, this.z_, this.x_);

            return out;
        }
    },
    ywx: {
        get: function() {
            var out = new Vec3(this.y_, this.w_, this.x_);

            return out;
        }
    },
    zwx: {
        get: function() {
            var out = new Vec3(this.z_, this.w_, this.x_);

            return out;
        }
    },
    zwy: {
        get: function() {
            var out = new Vec3(this.z_, this.w_, this.y_);

            return out;
        }
    },
    zxw: {
        get: function() {
            var out = new Vec3(this.z_, this.x_, this.w_);

            return out;
        }
    },
    zxy: {
        get: function() {
            var out = new Vec3(this.z_, this.x_, this.y_);

            return out;
        }
    },
    zyw: {
        get: function() {
            var out = new Vec3(this.z_, this.y_, this.w_);

            return out;
        }
    },
    zyx: {
        get: function() {
            var out = new Vec3(this.z_, this.y_, this.x_);

            return out;
        }
    },
    wxy: {
        get: function() {
            var out = new Vec3(this.w_, this.x_, this.y_);

            return out;
        }
    },
    wxz: {
        get: function() {
            var out = new Vec3(this.w_, this.x_, this.z_);

            return out;
        }
    },
    wyx: {
        get: function() {
            var out = new Vec3(this.w_, this.y_, this.x_);

            return out;
        }
    },
    wyz: {
        get: function() {
            var out = new Vec3(this.w_, this.y_, this.z_);

            return out;
        }
    },
    wzx: {
        get: function() {
            var out = new Vec3(this.w_, this.z_, this.x_);

            return out;
        }
    },
    wzy: {
        get: function() {
            var out = new Vec3(this.w_, this.z_, this.y_);

            return out;
        }
    },
    xyzw: {
        get: function() {
            var out = new Vec4(this.x_, this.y_, this.z_, this.w_);

            return out;
        }
    },
    xywz: {
        get: function() {
            var out = new Vec4(this.x_, this.y_, this.w_, this.z_);

            return out;
        }
    },
    xzyw: {
        get: function() {
            var out = new Vec4(this.x_, this.z_, this.y_, this.w_);

            return out;
        }
    },
    xwyz: {
        get: function() {
            var out = new Vec4(this.x_, this.w_, this.y_, this.z_);

            return out;
        }
    },
    xzwy: {
        get: function() {
            var out = new Vec4(this.x_, this.z_, this.w_, this.y_);

            return out;
        }
    },
    xwzy: {
        get: function() {
            var out = new Vec4(this.x_, this.w_, this.z_, this.y_);

            return out;
        }
    },
    yxzw: {
        get: function() {
            var out = new Vec4(this.y_, this.x_, this.z_, this.w_);

            return out;
        }
    },
    yxwz: {
        get: function() {
            var out = new Vec4(this.y_, this.x_, this.w_, this.z_);

            return out;
        }
    },
    yzxw: {
        get: function() {
            var out = new Vec4(this.y_, this.z_, this.x_, this.w_);

            return out;
        }
    },
    ywxz: {
        get: function() {
            var out = new Vec4(this.y_, this.w_, this.x_, this.z_);

            return out;
        }
    },
    yzwx: {
        get: function() {
            var out = new Vec4(this.y_, this.z_, this.w_, this.x_);

            return out;
        }
    },
    yzxw: {
        get: function() {
            var out = new Vec4(this.y_, this.z_, this.x_, this.w_);

            return out;
        }
    },
    zxyw: {
        get: function() {
            var out = new Vec4(this.z_, this.x_, this.y_, this.w_);

            return out;
        }
    },
    zxwy: {
        get: function() {
            var out = new Vec4(this.z_, this.x_, this.w_, this.y_);

            return out;
        }
    },
    zyxw: {
        get: function() {
            var out = new Vec4(this.z_, this.y_, this.x_, this.w_);

            return out;
        }
    },
    zwxy: {
        get: function() {
            var out = new Vec4(this.z_, this.w_, this.x_, this.y_);

            return out;
        }
    },
    zywx: {
        get: function() {
            var out = new Vec4(this.z_, this.y_, this.w_, this.x_);

            return out;
        }
    },
    zwyx: {
        get: function() {
            var out = new Vec4(this.z_, this.w_, this.y_, this.x_);

            return out;
        }
    },
    wxyz: {
        get: function() {
            var out = new Vec4(this.w_, this.x_, this.y_, this.z_);

            return out;
        }
    },
    wxzy: {
        get: function() {
            var out = new Vec4(this.w_, this.x_, this.z_, this.y_);

            return out;
        }
    },
    wyxz: {
        get: function() {
            var out = new Vec4(this.w_, this.y_, this.x_, this.z_);

            return out;
        }
    },
    wzxy: {
        get: function() {
            var out = new Vec4(this.w_, this.z_, this.x_, this.y_);

            return out;
        }
    },
    wyzx: {
        get: function() {
            var out = new Vec4(this.w_, this.y_, this.z_, this.x_);

            return out;
        }
    },
    wzyx: {
        get: function() {
            var out = new Vec4(this.w_, this.z_, this.y_, this.x_);

            return out;
        }
    }
});

/**
 * Calculates angle between 2 vectors.
 * @param  {Vec} vec1
 * @param  {Vec} vec2
 * @return {Number} Degrees
 * @method
 * @static
 */
Vec.angle = function(vec1, vec2) {
    if (!(vec1 instanceof Vec)) {
        warn('Vec->angle', 'vec1', vec1);
        return 0;
    } else if (!(vec2 instanceof Vec)) {
        warn('Vec->angle', 'vec2', vec2);
        return 0;
    }

    var out = Math.acos(Vec.cos(vec1, vec2));

    return out;
}

/**
 * Returns an array with vector coordinates.
 * @return {Vec}
 * @method
 */
Vec.prototype.array = function() {
    var out = [this.x, this.y];

    switch (this.size) {
        case 4:
            out.push(this.z, this.w);
            break;

        case 3:
            out.push(this.z);
            break;
    }

    return out;
}

/**
 * Returns average vector between sended other.
 * @param  {...Vec} vectors
 * @return {Vec}
 * @method
 * @static
 * @example
 * var vec = Vec.avg(new Vec(3,5,6), new Vec(4,2,4), new Vec3(2,2,2));
 * vec;  // Vec {x: 3, y: 3, z: 4}
 */
Vec.avg = function() {
    var args = arguments;

    if (args.length == 0) {
        return new Vec2;
    }

    // Sum all vectors and validate them
    var out = args[0];
    for (var i = 0; i < args.length; i++) {
        var vec = args[i];

        if (!vec instanceof Vec) {
            warn('Vec->avg', 'vec', vec);
            return new Vec2;
        }

        // Skip first vector because it is "out"
        if (i === 0) {
            continue;
        }

        out = amc('+', out, vec);
    }

    // Divide all vectors on them count to get average value
    out = amc('/', out, args.length);

    if (!(out instanceof Vec)) {
        warn('Vec->avg', 'out', out);
        return new Vec2;
    }

    return out;
}

/**
 * Compares two vectors by x, y, z and w coordinates
 * and returns true if them equal else returns false.
 * P.S. Better use {@link amc} function, it is
 * much optimizing.
 * @param  {Vec} vec1
 * @param  {Vec} vec2
 * @return {Boolean}
 * @method
 * @static
 */
Vec.compare = function(vec1, vec2) {
    var out = true;

    if (!(vec1 instanceof Vec) || !(vec2 instanceof Vec)) {
        out = false;
    } else {
        var length0 = vec1.size,
            length1 = vec2.size;

        if (length0 == length1) {
            if (vec1.x !== vec2.x ||
                vec1.y !== vec2.y ||
                vec1.z !== vec2.z ||
                vec1.w !== vec2.w) {
                out = false;
            }
        } else {
            out = false;
        }
    }

    return out;
}

/**
 * Calculates cosinus between two vectors.
 * @param  {Vec} vec1
 * @param  {Vec} vec2
 * @return {Number} Radians
 * @method
 * @static
 */
Vec.cos = function(vec1, vec2) {
    if (!(vec1 instanceof Vec)) {
        warn('Vec->cos', 'vec1', vec1);
        return 0;
    } else if (!(vec2 instanceof Vec)) {
        warn('Vec->cos', 'vec2', vec2);
        return 0;
    }

    var out = (vec1.x * vec2.x + vec1.y * vec2.y) / (vec1.length() * vec2.length());

    return out;
}

/**
 * Calculates difference of two vectors and returns
 * result vector. P.S. Better use {@link amc} function, it is
 * much optimizing.
 * @param  {...Vec} vectors
 * @return {Vec}
 * @method
 * @static
 */
Vec.dif = function() {
    var args = arguments;

    if (args.length == 0) {
        return new Vec2;
    }

    var vec1 = args[0],
        vec2 = args[1];

    if (!(vec1 instanceof Vec)) {
        warn('Vec->dif', 'vec1', vec1);
        vec1 = new Vec2;
    }
    if (!(vec2 instanceof Vec)) {
        warn('Vec->dif', 'vec2', vec2);
        vec2 = new Vec2;
    }

    var Type = vec1.size >= vec2.size ? vec1.constructor : vec2.constructor;

    var out = new Type(
        vec1.x - vec2.x,
        vec1.y - vec2.y,
        (vec1.z || 0) - (vec2.z || 0),
        (vec1.w || 0) - (vec2.w || 0)
    );

    if (args.length > 2) {
        Array.prototype.splice.call(args, 0, 2, out);
        out = Vec.dif.apply(Vec, args);
    }

    return out;
}

/**
 * Scalar product of two vectors.
 * @param  {...Vec} vectors
 * @return {Number}
 * @method
 * @static
 */
Vec.dot = function() {
    var args = arguments;

    if (args.length == 0) {
        return new Vec2;
    }

    var vec1 = args[0],
        vec2 = args[1];

    if (!(vec1 instanceof Vec)) {
        vec1 = new Vec2;
    }
    if (!(vec2 instanceof Vec)) {
        vec2 = new Vec2;
    }

    var out = vec1.x * vec2.x + vec1.y * vec2.y;
    if (vec1.size > 3 && vec2.size > 3) {
        out += vec1.z * vec2.z;
        out += vec1.w * vec2.w;
    } else if (vec1.size > 2 && vec2.size > 2) {
        out += vec1.z * vec2.z;
    }

    if (args.length > 2) {
        Array.prototype.splice.call(args, 0, 2, out);
        out = Vec.dot.apply(Vec, args);
    }

    return out;
}

/**
 * Transforms vector to euler by x, y and z coordinates.
 * @return {Euler}
 * @method
 */
Vec.prototype.euler = function() {
    var x = this.x,
        y = this.y,
        z = this.z || 0;

    var out = new Euler(x, y, z);

    return out;
}

/**
 * Converts a vector into a vector into a smaller rank
 * by division on last coordinate.
 * @return {Vec}
 * @method
 * @example
 * (new Vec4(1, 5, 3, 2)).toCartesian();  // Vec3 {x: 0.5, y: 2.5, z: 1.5}
 */
Vec.prototype.toCartesian = function() {
    var out;

    switch (this.size) {
        case 3:
            out = amc('/', this.xy, this.z);
            break;

        case 4:
            out = amc('/', this.xyz, this.w);
            break;
    }

    return out;
}

/**
 * Converts a vector into a vector into a higher rank
 * by appending value as 1 to last coordinate.
 * @return {Vec}
 * @method
 * @example
 * (new Vec3(1, 5, 3)).toHomogeneousPos();  // Vec3 {x: 1, y: 5, z: 3, w: 1}
 */
Vec.prototype.toHomogeneousPos = function() {
    var out;

    switch (this.size) {
        case 2:
            out = new Vec3(this, 1);
            break;

        case 3:
            out = new Vec4(this, 1);
            break;
    }

    return out;
}

/**
 * Returns inversed vector.
 * @return {Vec}
 * @method
 */
Vec.prototype.inverse = function() {
    var x = -this.x,
        y = -this.y,
        z, w;

    if (this.size == 4) {
        z = -this.z;
        w = -this.w;
    } else if (this.size == 3) {
        z = -this.z;
    }

    var out = new this.constructor(x, y, z, w);

    return out;
}

/**
 * Returns length of vector.
 * @return {Number}
 * @method
 */
Vec.prototype.length = function() {
    var out = Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2) +
        Math.pow(this.z || 0, 2) + Math.pow(this.w || 0, 2));

    return out;
}

/**
 * Multiplies vector coordinates on number and returns
 * result vector. P.S. Better use {@link amc} function, it is
 * much optimizing.
 * @param  {Number} num
 * @return {Vec}
 * @method
 */
Vec.prototype.multi = function(num) {
    if (typeof num !== 'number') {
        warn('Vec#multi', 'num', num);
        return this;
    }

    var out = new this.constructor(
        this.x * num,
        this.y * num,
        (this.z || 0) * num,
        (this.w || 0) * num
    );

    return out;
}

/**
 * Calculates multiply of two vectors and returns
 * result vector. P.S. Better use {@link amc} function, it is
 * much optimizing.
 * @param  {...Vec} vectors Array
 * @return {Vec}
 * @method
 * @static
 */
Vec.multi = function() {
    var args = arguments;

    if (args.length == 0) {
        return new Vec2;
    }

    var vec1 = args[0],
        vec2 = args[1];

    if (!(vec1 instanceof Vec)) {
        warn('Vec->multi', 'vec1', vec1);
        vec1 = new Vec2;
    }
    if (!(vec2 instanceof Vec)) {
        warn('Vec->multi', 'vec2', vec2);
        vec2 = new Vec2;
    }

    var Type = vec1.size >= vec2.size ? vec1.constructor : vec2.constructor;

    var out = new Type(
        vec1.x * vec2.x,
        vec1.y * vec2.y,
        (vec1.z || 1) * (vec2.z || 1),
        (vec1.w || 1) * (vec2.w || 1)
    );

    if (args.length > 2) {
        Array.prototype.splice.call(args, 0, 2, out);
        out = Vec.sum.apply(Vec, args);
    }

    return out;
}

/**
 * Returns normalized vector.
 * @return {Vec}
 * @method
 */
Vec.prototype.normalize = function() {
    var length = this.length();

    var x = (this.x / length) || 0,
        y = (this.y / length) || 0,
        z = (this.z / length) || 0,
        w = (this.w / length) || 0;

    var out = new this.constructor(x, y, z, w);

    return out;
}

/**
 * Sum vector's coordinates on number and returns
 * result vector.
 * @param {Number} num
 * @return {Vec}
 * @method
 */
Vec.prototype.sum = function(num) {
    if (typeof num !== 'number') {
        warn('Vec#sum', 'num', num);
        return this;
    }

    var out = new this.constructor(
        this.x + num,
        this.y + num,
        (this.z || 0) + num,
        (this.w || 0) + num
    );

    return out;
}

/**
 * Calculates sum of two vectors and returns
 * result vector. P.S. Better use {@link amc} function, it is
 * much optimizing.
 * @param  {...Vec} vectors
 * @return {Vec}
 * @method
 * @static
 */
Vec.sum = function() {
    var args = arguments;

    if (args.length == 0) {
        return new Vec2;
    }

    var vec1 = args[0],
        vec2 = args[1];

    if (!(vec1 instanceof Vec)) {
        warn('Vec->sum', 'vec1', vec1);
        vec1 = new Vec2;
    }
    if (!(vec2 instanceof Vec)) {
        warn('Vec->sum', 'vec2', vec2);
        vec2 = new Vec2;
    }

    var Type = vec1.size >= vec2.size ? vec1.constructor : vec2.constructor;

    var out = new Type(
        vec1.x + vec2.x,
        vec1.y + vec2.y,
        (vec1.z || 0) + (vec2.z || 0),
        (vec1.w || 0) + (vec2.w || 0)
    );

    if (args.length > 2) {
        Array.prototype.splice.call(args, 0, 2, out);
        out = Vec.sum.apply(Vec, args);
    }

    return out;
}

/**
 * Vector with 2 coordinates x and y.
 * @this {Vec2}
 * @param {Number | Vec3 | Vec4} x
 * @param {Number} y
 * @class
 * @extends Vec
 */
function Vec2(x = 0, y = 0) {
    if (typeof x === 'number' && typeof y === 'number') {
        //
    } else if (x && (x.constructor === Vec3 || x.constructor === Vec4)) {
        y = x.y;
        x = x.x;
    } else {
        if (typeof x !== 'number') {
            warn('Vec2', 'x', x);
            x = 0;
        }
        if (typeof y !== 'number') {
            warn('Vec2', 'y', y);
            y = 0;
        }
    }

    this.x_ = x;
    this.y_ = y;

    this.size_ = 2;
}

Vec2.prototype = Object.create(Vec.prototype);
Vec2.prototype.constructor = Vec2;

/**
 * Vector with 3 coordinates x, y and z.
 * @this {Vec3}
 * @param {Number | Vec2 | Vec4} x
 * @param {Number | Vec2} y
 * @param {Number} z
 * @class
 * @extends Vec
 */
function Vec3(x = 0, y = 0, z = 0) {
    if (typeof x === 'number' && typeof y === 'number' &&
        typeof z === 'number') {
        //
    } else if (!z && x && x.constructor === Vec2) {
        if (typeof y !== 'number') {
            warn('Vec3', 'y', y);
            y = 0;
        }

        z = y;
        y = x.y;
        x = x.x;
    } else if (!z && y && y.constructor === Vec2) {
        if (typeof x !== 'number') {
            warn('Vec3', 'x', x);
            x = 0;
        }

        z = y.y;
        y = y.x;
    } else if (!y && x && x.constructor === Vec4) {
        z = x.z;
        y = x.y;
        x = x.x;
    } else {
        if (typeof x !== 'number') {
            warn('Vec3', 'x', x);
            x = 0;
        }
        if (typeof y !== 'number') {
            warn('Vec3', 'y', y);
            y = 0;
        }
        if (typeof z !== 'number') {
            warn('Vec3', 'z', z);
            z = 0;
        }
    }

    this.x_ = x;
    this.y_ = y;
    this.z_ = z;

    this.size_ = 3;
}

Vec3.prototype = Object.create(Vec.prototype);
Vec3.prototype.constructor = Vec3;

/**
 * Retruns cross product of 2 vectors.
 * @param  {Vec3} vec1
 * @param  {Vec3} vec2
 * @return {Vec3}
 * @method
 */
Vec3.cross = function(vec1, vec2) {
    if (!(vec1 instanceof Vec3)) {
        warn('Vec3->cross', 'vec1', vec1);
        vec1 = new Vec3;
    }
    if (!(vec2 instanceof Vec3)) {
        warn('Vec3->cross', 'vec2', vec2);
        vec2 = new Vec3;
    }

    var x = vec1.y * vec2.z - vec1.z * vec2.y,
        y = vec1.z * vec2.x - vec1.x * vec2.z,
        z = vec1.x * vec2.y - vec1.y * vec2.x;

    return new Vec3(x, y, z);
}

/**
 * Vector with 4 coordinates x, y, z and w.
 * @this {Vec4}
 * @param {Number | Vec2 | Vec3} x
 * @param {Number | Vec2 | Vec3} y
 * @param {Number | Vec2} z
 * @param {Number} w
 * @class
 * @extends Vec
 */
function Vec4(x = 0, y = 0, z = 0, w = 0) {
    if (typeof x === 'number' && typeof y === 'number' &&
        typeof z === 'number' && typeof w === 'number') {
        //
    } else if (!z && x && x.constructor === Vec2 && y && y.constructor === Vec2) {
        w = y.y;
        z = y.x;
        y = x.y;
        x = x.x;
    } else if (!w && x && x.constructor === Vec2) {
        if (typeof z !== 'number') {
            warn('Vec4', 'z', z);
            z = 0
        }
        if (typeof y !== 'number') {
            warn('Vec4', 'y', y);
            y = 0;
        }

        w = z;
        z = y;
        y = x.y;
        x = x.x;
    } else if (!w && y && y.constructor === Vec2) {
        if (typeof z !== 'number') {
            warn('Vec4', 'z', z);
            z = 0
        }
        if (typeof x !== 'number') {
            warn('Vec4', 'x', x);
            x = 0;
        }

        w = z;
        z = y.y;
        y = y.x;
    } else if (!w && z && z.constructor == Vec2) {
        if (typeof y !== 'number') {
            warn('Vec4', 'y', y);
            y = 0
        }
        if (typeof x !== 'number') {
            warn('Vec4', 'x', x);
            x = 0;
        }

        w = z.y;
        z = z.x;
    } else if (!z && x && x.constructor == Vec3) {
        if (typeof y !== 'number') {
            warn('Vec4', 'y', y);
            y = 0;
        }

        w = y;
        z = x.z;
        y = x.y;
        x = x.x;
    } else if (!z && y && y.constructor === Vec3) {
        if (typeof x !== 'number') {
            warn('Vec4', 'x', x);
            x = 0;
        }

        w = y.z;
        z = y.y;
        y = y.x;
    } else {
        if (typeof x !== 'number') {
            warn('Vec4', 'x', x);
            x = 0;
        }
        if (typeof y !== 'number') {
            warn('Vec4', 'y', y);
            y = 0;
        }
        if (typeof z !== 'number') {
            warn('Vec4', 'z', z);
            z = 0;
        }
        if (typeof w !== 'number') {
            warn('Vec4', 'w', w);
            w = 0;
        }
    }

    this.x_ = x;
    this.y_ = y;
    this.z_ = z;
    this.w_ = w;

    this.size_ = 4;
}

Vec4.prototype = Object.create(Vec.prototype);
Vec4.prototype.constructor = Vec4;

Object.defineProperties(Vec, {
    homogeneousDir: {
        value: new Vec4(0, 0, 0, 0),
        writable: false
    },
    homogeneousPos: {
        value: new Vec4(0, 0, 0, 1),
        writable: false
    },
    right: {
        value: new Vec3(1, 0, 0),
        writable: false
    },
    left: {
        value: new Vec3(-1, 0, 0),
        writable: false
    },
    up: {
        value: new Vec3(0, 1, 0),
        writable: false
    },
    down: {
        value: new Vec3(0, -1, 0),
        writable: false
    },
    front: {
        value: new Vec3(0, 0, 1),
        writable: false
    },
    back: {
        value: new Vec3(0, 0, -1),
        writable: false
    }
});
