/**
 * Physic of object, generates diameter, pressure, temperature
 * and e.t.c by matter. Contains info about velocity, acceleration,
 * gravity power, etc.
 * Physic must have a matter because all parameters calculated relative
 * on this.
 *
 * D - diameter
 * F - force
 * h - height
 * l - distance
 * M - molar mass
 * m - mass
 * p - density
 * P - pascal
 * R - radius
 * V - volume
 *
 * @constructor
 * @this {Physic}
 * @param {Matter} matter
 */
function Physic(matter = new Matter) {
    this.matter = matter;

    this.onupdate = function() {};
}

Object.defineProperties(Physic.prototype, {
    color: {
        get: function() {
            return this.matter.color;
        }
    },
    diameter: {
        get: function() {
            return this.matter.diameter;
        }
    },
    mass: {
        get: function() {
            return this.matter.mass;
        }
    },
    matter: {
        get: function() {
            return this.matter_;
        },
        set: function(val) {
            if (!(val instanceof Matter)) {
                logger.warn('Physic#matter', 'val', val);
                val = new Matter;
            }

            this.matter_ = val;
        }
    },
    maxspeed: {
        get: function() {
            // In second
            return this.matter.maxspeed;
        }
    },
    onupdate: {
        get: function() {
            return this.onupdate_;
        },
        set: function(val) {
            if (typeof val !== 'function') {
                logger.warn('Physic#onupdate', 'val', val);
                val = function() {};
            }

            this.onupdate_ = val;
        }
    },
    rotationSpeed: {
        get: function() {
            return consts.ROTATION_SPEED;
        }
    },
    volume: {
        get: function() {
            return this.matter.volume;
        }
    }
});

Physic.prototype.Density = function(R) {
    if (typeof R !== 'number') {
        logger.warn('Physic#Density', 'R', R);
        R = 0;
    }

    var out = 0;

    this.matter.each((layer, radius) => {
        if (radius >= R) {
            out = layer.density;

            return false;
        }
    });

    return out;
}

Physic.prototype.Mass = function(R) {
    if (typeof R !== 'number') {
        logger.warn('Physic#Mass', 'R', R);
        R = 0;
    }

    var out = 0;

    var self = this;
    this.matter.each((layer, radius) => {
        if (radius >= R) {
            var m0 = (radius - R) / layer.height * layer.mass;
            var sibling = self.matter.nextSibling(layer);
            var m1 = (sibling.height - sibling.radius + R) / sibling.height * sibling.mass;
            out = m0 + m1;

            return false;
        }
    });

    return out;
}

Physic.prototype.MassTotal = function(R = Infinity) {
    if (typeof R !== 'number') {
        logger.warn('Physic#MassTotal', 'R', R);
        R = Infinity;
    }

    var out = 0;

    this.matter.each((layer, radius) => {
        if (radius >= R) {
            var approx = (R - layer.radius) / layer.height * layer.mass;
            out += approx;

            return false;
        } else {
            out += layer.mass;
        }
    });

    return out;
}

Physic.prototype.Pressure = function(R) {
    if (typeof R !== 'number') {
        logger.warn('Physic#Pressure', 'R', R);
        R = 0;
    }

    var out = 0;

    var self = this;
    this.matter.each((layer, radius) => {
        if (radius >= R) {
            out = consts.G * (self.MassTotal(R) * self.Density(R) / Math.pow(R, 2));

            return false;
        }
    });

    return out;
}

Physic.prototype.Temperature = function(R) {
    if (typeof R !== 'number') {
        logger.warn('Physic#Temperature', 'R', R);
        R = 0;
    }

    return this.Pressure(R) * this.VolumeTotal(R) / consts.PRESSURE_TEMPERATURE_CONST;
}

Physic.prototype.toJSON = function() {
    var out = {};

    out.color = this.color.array();
    out.diameter = this.diameter;
    out.mass = this.mass;
    out.maxspeed = this.maxspeed;
    out.volume = this.volume;
    out.rotationSpeed = this.rotationSpeed;

    return out;
}

Physic.prototype.VolumeTotal = function(R = Infinity) {
    if (typeof R !== 'number') {
        logger.warn('Physic#VolumeTotal', 'R', R);
        R = Infinity;
    }

    var out = 0;

    this.matter.each((layer, radius) => {
        out += layer.volume;
        if (radius >= R) {
            return false;
        }
    });

    return out;
}

module.exports = Physic;

var logger = require('./logger');
var consts = require('./constants');
var Matter = require('./matter');
