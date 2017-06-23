/**
 * A system of hypercomplex numbers that forms a vector
 * space of dimension four over the field of real numbers.
 * @this {Quaternion}
 * @param {Number} x
 * @param {Number} y
 * @param {Number} z
 * @param {Number} w
 * @class
 */
function Quaternion(x = 0, y = 0, z = 0, w = 1) {
    if (typeof x !== 'number') {
        logger.warn('Quaternion', 'x', x);
        x = 0;
    }
    if (typeof y !== 'number') {
        logger.warn('Quaternion', 'y', y);
        y = 0;
    }
    if (typeof z !== 'number') {
        logger.warn('Quaternion', 'z', z);
        z = 0;
    }
    if (typeof w !== 'number') {
        logger.warn('Quaternion', 'w', w);
        w = 1;
    }

    this.x_ = x;
    this.y_ = y;
    this.z_ = z;
    this.w_ = w;

    this.euler_ = Euler.Quaternion(x, y, z, w);
}

Object.defineProperties(Quaternion.prototype, {
	euler: {
		get: function() {
			return this.euler_;
		}
	},
	w: {
		get: function() {
			return this.w_;
		}
	},
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

/**
 * Returns an array of quaternion numbers.
 * @return {Arrat}
 * @method
 */
Quaternion.prototype.array = function() {
    return [this.x, this.y, this.z, this.w];
}

Quaternion.avg = function() {
    var args = arguments;

    if (args.length == 0) {
        return new Quaternion;
    }

    var out = args[0];
    for (var i = 0; i < args.length; i++) {
        var quat = args[i];

        if (!quat instanceof Quaternion) {
            warn('Quaternion->avg', 'quat', quat);
            return new Quaternion;
        }

        if (i === 0) {
            continue;
        }

        out = amc('+', out, quat);
    }

    out = amc('/', out, args.length);

    if (!(out instanceof Quaternion)) {
        logger.warn('Quaternion->avg', 'out', out);
        return new Quaternion;
    }

    return out;
}

/**
 * Compares two quaternions by x, y, z and w coordinates
 * and returns true if them equal else returns false.
 * P.S. Better use {@link amc} function, it is
 * much optimizing.
 * @param  {Quaternion} quat1
 * @param  {Quaternion} quat2
 * @return {Boolean}
 * @method
 * @static
 */
Quaternion.compare = function(quat1, quat2) {
    var out = true;

    if (typeof quat1 === 'undefined' || typeof quat2 === 'undefined') {
        out = false;
    } else {
        if (quat1.x !== quat2.x ||
            quat1.y !== quat2.y ||
            quat1.z !== quat2.z ||
            quat1.w !== quat2.w) {
            out = false;
        }
    }

    return out;
}

/**
 * Transforms eulers to quaternions,
 * function gets {@link Euler} or x, y, and z coordinates.
 * @param {Euler|number} x, y, z, w
 * @return {Quaternion}
 * @method
 * @static
 */
Quaternion.Euler = function() {
	var args = arguments;

    var roll, pitch, yaw;
    if (args[0] instanceof Quaternion) {
        var euler = args[0];

        roll = euler.x;
        pitch = euler.y;
        yaw = euler.z;
    } else {
        roll = args[0];
        pitch = args[1];
        yaw = args[2];

        if (typeof roll !== 'number') {
        	logger.warn('Quaternion->Euler', 'roll', roll);
        	roll = 0;
        }
        if (typeof pitch !== 'number') {
        	logger.warn('Quaternion->Euler', 'pitch', pitch);
        	pitch = 0;
        }
        if (typeof yaw !== 'number') {
        	logger.warn('Quaternion->Euler', 'yaw', yaw);
        	yaw = 0;
        }
    }

    var nroll = math.DTR(roll),
        npitch = math.DTR(pitch),
        nyaw = math.DTR(yaw);

    var sr, sp, sy, cr, cp, cy;

    sy = Math.sin(nyaw * 0.5);
    cy = Math.cos(nyaw * 0.5);
    sp = Math.sin(npitch * 0.5);
    cp = Math.cos(npitch * 0.5);
    sr = Math.sin(nroll * 0.5);
    cr = Math.cos(nroll * 0.5);

    var srcp = sr * cp,
        crsp = cr * sp,
        crcp = cr * cp,
        srsp = sr * sp;

    var quat = new Quaternion(
        srcp * cy - crsp * sy,
        crsp * cy + srcp * sy,
        crcp * sy - srsp * cy,
        crcp * cy + srsp * sy
    );
    quat.euler_ = new Euler(roll, pitch, yaw);

    return quat;
}

/**
 * Returns inversed quaternion.
 * @return {Quaternion}
 * @method
 */
Quaternion.prototype.inverse = function() {
    var euler = this.euler;
    var x = -euler.x,
        y = -euler.y,
        z = -euler.z;

    var out = Quaternion.Euler(x, y, z);

    return out;
}

Quaternion.prototype.multi = function(num) {
    if (typeof num !== 'number') {
    	logger.warn('Quaternion#multi', 'num', num);
        return this;
    }

    var euler = this.euler;

    var eul = new Euler(
        euler.x * num,
        euler.y * num,
        euler.z * num
    );

    var out = Quaternion.Euler(eul);

    return out;
}

/**
 * Calculates sum between two quaternions and returns
 * result quaternion. P.S. Better use {@link amc} function, it is
 * much optimizing.
 * @param {Quaternion} quat1
 * @param {Quaternion} quat2
 * @return {Quaternion}
 * @method
 * @static
 */
Quaternion.sum = function() {
	var args = arguments;

    if (args.length == 0) {
        return new Quaternion;
    }

    var qua1 = quaternions[0],
        qua2 = quaternions[1];

    if (!(qua1 instanceof Quaternion)) {
        qua1 = new Quaternion;
    }
    if (!(qua2 instanceof Quaternion)) {
        qua2 = new Quaternion;
    }

    var euler1 = quat1.euler,
        euler2 = quat2.euler;

    var eul = new Euler(
        euler1.x + euler2.x,
        euler1.y + euler2.y,
        euler1.z + euler2.z
    );

    if (args.length > 2) {
        Array.prototype.splice.call(args, 0, 2, out);
        out = Quaternion.sum.apply(Quaternion, args);
    }

    var out = Quaternion.Euler(eul);

    return out;
}

Quaternion.prototype.sum = function(num) {
    if (typeof num !== 'number') {
        logger.warn('Quaternion#sum', 'num', num);
        return this;
    }

    var euler = this.euler;

    var eul = new Euler(
        euler.x + num,
        euler.y + num,
        euler.z + num
    );

    var out = Quaternion.Euler(eul);

    return out;
}

/**
 * Transforms quaternion to {@link Vec4}.
 * @return {Vec4}
 * @method
 */
Quaternion.prototype.vec = function() {
    return new Vec4(this.x, this.y, this.z, this.w);
}

module.exports = Quaternion;

var logger = require('./logger');
var Euler = require('./euler');
var v = require('./vector');
var Vec4 = v.Vec4;
var math = require('./math');
var amc = math.amc;
