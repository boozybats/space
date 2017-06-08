/**
 * Eulers angles define three turns of the system by
 * x, y and z coordinates. Store value between 0 and
 * 360 for each coordinate.
 * @this {Euler}
 * @param {Number} x
 * @param {Number} y
 * @param {Number} z
 * @class
 */
function Euler(x = 0, y = 0, z = 0) {
    if (typeof x !== 'number') {
        warn('Euler', 'x', x);
        x = 0;
    }
    if (typeof y !== 'number') {
        warn('Euler', 'y', y);
        y = 0;
    }
    if (typeof z !== 'number') {
        warn('Euler', 'z', z);
        z = 0;
    }

    while (x >= 360) {
        x -= 360;
    }
    while (x < 0) {
        x += 360;
    }
    while (y >= 360) {
        y -= 360;
    }
    while (y < 0) {
        y += 360;
    }
    while (z >= 360) {
        z -= 360;
    }
    while (z < 0) {
        z += 360;
    }

    this.x_ = x;
    this.y_ = y;
    this.z_ = z;
}

/**
 * Returns an array from eulers coordinates.
 * @return {Array}
 * @method
 */
Object.defineProperties(Euler.prototype, {
    x: {
        get: function() {
            return this.x_;
        }
    },
    y: {
        get: function() {
            return this.y_;
        }
    },
    z: {
        get: function() {
            return this.z_;
        }
    }
});

Euler.prototype.array = function() {
    return [this.x, this.y, this.z];
}

/**
 * Compares 2 Euler-objects by x, y, z
 * coordinates and return "true" if everything equal,
 * else - "false".
 * @param  {Euler} eul0
 * @param  {Euler} eul1
 * @return {Boolean}
 * @method
 * @static
 * @example
 * Euler.compare(new Euler(10, 20, 30), new Euler(11, 21, 31));  // false
 * Euler.compare(new Euler(40, 60, 80), new Euler(40, 60, 80));  // true
 */
Euler.compare = function(eul0, eul1) {
    var out = true;

    if (!(eul0 instanceof Euler) || !(eul1 instanceof Euler)) {
        out = false;
    } else {
        if (eul0.x !== eul1.x ||
            eul0.y !== eul1.y ||
            eul0.z !== eul1.z) {
            out = false;
        }
    }

    return out;
}

/**
 * Returns multiplied euler's coordinates by
 * specified number.
 * @param  {Number} num
 * @return {Euler}
 * @method
 * @example
 * var eul = new Euler(10, 0, 6);
 * eul.multi(5);  // Euler {x: 50, y: 0, z: 30}
 */
Euler.prototype.multi = function(num) {
    if (typeof num !== 'number') {
        warn('Euler#multi', 'num', num);
        return this;
    }

    var x = this.x * num,
        y = this.y * num,
        z = this.z * num;

    return new Euler(x, y, z);
}

/**
 * Transforms {@link Quaternion}-object to Euler-object
 * @param {Quaternion | Number} x Can take Quaternion-object
 * as value
 * @param {Number} y
 * @param {Number} z
 * @param {Number} w
 * @return {Euler}
 * @method
 * @static
 * @example
 * Euler.Quaternion(0.7071, 0, 0, 0.7071);  // Euler {x: 90, y: 0, z: 0}
 * 
 * var quat = new Quaternion(0.7071, 0, 0, 0.7071);
 * Euler.Quaternion(quat);  // Euler {x: 90, y: 0, z: 0}
 */
Euler.Quaternion = function(x, y, z, w) {
    if (x instanceof Quaternion) {
        x = x.x;
        y = x.y;
        z = x.z;
        w = x.w;
    } else {
        if (typeof x !== 'number') {
            warn('Euler->Quaternion', 'x', x);
            x = 0;
        }
        if (typeof y !== 'number') {
            warn('Euler->Quaternion', 'y', y);
            y = 0;
        }
        if (typeof z !== 'number') {
            warn('Euler->Quaternion', 'z', z);
            z = 0;
        }
        if (typeof w !== 'number') {
            warn('Euler->Quaternion', 'w', w);
            w = 1;
        }
    }

    var m = [];
    var xx = x * x,
        x2 = x * 2,
        yy = y * y,
        y2 = y * 2,
        zz = z * z,
        z2 = z * 2,
        ww = w * w,
        w2 = w * 2,
        L = xx + yy + zz + ww;

    if (L === 0) {
        warnfree('Euler->Quaternion: quaternion can not be length 0');
    }

    m[0] = (ww + xx - yy - zz) / L;
    m[1] = (x2 * y + w2 * z) / L;
    m[2] = (x2 * z - w2 * y) / L;
    m[3] = (x2 * y - w2 * z) / L;
    m[4] = (ww + yy - xx - zz) / L;
    m[5] = (y2 * z + w2 * x) / L;
    m[6] = (ww + zz - xx - yy) / L;

    var arr, xyDist = Math.sqrt(m[0] * m[0] + m[1] * m[1]);

    if (xyDist > Number.EPSILON) {
        if (m[6] > 0) {
            arr = [
                Math.atan2(m[5], m[6]),
                Math.atan2(m[1], m[0]),
                Math.atan2(-m[2], xyDist)
            ];
        } else {
            arr = [-Math.atan2(m[5], -m[6]), -Math.atan2(m[1], -m[0]), -Math.atan2(m[2], -xyDist)];
        }
    } else {
        arr = [
            0,
            Math.atan2(-m[3], m[4]),
            Math.atan2(-m[2], xyDist)
        ];
    }

    var out = new Euler(
        math.RTD(arr[0]),
        math.RTD(arr[1]),
        math.RTD(arr[2])
    );

    return out;
}

/**
 * Transforms Euler-object to Vec
 * @return {Vec}
 * @method
 */
Euler.prototype.vec = function() {
    return new Vec3(this.x, this.y, this.z);
}

module.exports = Euler;

var v = require('./vector');
var Vec3 = v.Vec3;
var Quaternion = require('./quaternion');
var math = require('./math');
