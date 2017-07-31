function Collider(options = {}) {
    if (typeof options !== 'object') {
        logger.warn('Collider', 'options', options);
        options = {};
    }

    this.type = options.type;
}

Object.defineProperties(Collider.prototype, {
    type: {
        get: function() {
            return this.type_;
        },
        set: function(val) {
            if (val && typeof val !== 'string') {
                logger.warn('Collider#type', 'val', val);
                val = undefined;
            }

            this.type_ = val;
        }
    }
});

Collider.prototype.defineProperties = function(options = {}) {
    if (typeof options !== 'object') {
        logger.warn('Collider#defineProperties', 'options', options);
        options = {};
    }

    this.center = options.center;
    this.diameter = options.diameter;

    if (typeof options.diameter !== 'undefined') {
        this.radius = options.diameter / 2;
    }
}

Collider.prototype.checkCollision = function(collider) {
    if (!(collider instanceof Collider)) {
        logger.warn('Collider#checkCollision', 'collider', collider);
        return;
    }

    if (collider === this) {
        return false;
    }

    var type = collider.type;

    if (this.type == 'sphere' && type == 'sphere') {
        var distance = amc('-', this.center, collider.center).length();
        var radius = this.radius + collider.radius;

        return distance <= radius;
    }

    return false;
}

Collider.prototype.sphere = function() {
    this.type_ = 'sphere';

    this.defineProperties({
        center: new Vec3(0, 0, 0),
        diameter: 1
    });
}

module.exports = Collider;

var math = require('./math');
var amc = math.amc;
var v = require('./vector');
var Vec3 = v.Vec3;
var logger = require('./logger');
var Body = require('./body');
