function Rigidbody(options = {}) {
    if (typeof options !== 'object') {
        logger.warn('Rigidbody', 'options', options);
        options = {};
    }

    this.events = {
        update: []
    };

    this.velocity = options.velocity || new Vec3;
    this.speed = options.speed || new Vec3;
    this.protozoa = options.protozoa || false;

    this.externalities = new Vec3;

    this.initialize();
}

Object.defineProperties(Rigidbody.prototype, {
    body: {
        get: function() {
            return this.body_;
        },
        set: function(val) {
            if (val && !(val instanceof Body)) {
                logger.warn('Rigidbody#body', 'val', val);
                val = undefined;
            }

            this.body_ = val;
        }
    },
    externalities: {
        get: function() {
            return this.externalities_;
        },
        set: function(val) {
            if (!(val instanceof Vec3)) {
                logger.warn('Rigidbody#externalities', 'val', val);
                val = new Vec3;
            }

            this.externalities_ = val;
        }
    },
    physic: {
        get: function() {
            return this.physic_;
        },
        set: function(val) {
            if (val && !(val instanceof Physic)) {
                logger.warn('Rigidbody#physic', 'val', val);
                val = undefined;
            }

            this.physic_ = val;
        }
    },
    protozoa: {
        get: function() {
            return this.protozoa_;
        },
        set: function(val) {
            if (typeof val !== 'boolean') {
                logger.warn('Rigidbody#protozoa', 'val', val);
                val = false;
            }

            this.protozoa_ = val;
        }
    },
    speed: {
        get: function() {
            return this.speed_;
        },
        set: function(val) {
            if (!(val instanceof Vec3)) {
                logger.warn('Rigidbody#speed', 'val', val);
                val = new Vec3;
            }

            this.speed_ = val;
        }
    },
    velocity: {
        get: function() {
            return this.velocity_;
        },
        set: function(val) {
            if (!(val instanceof Vec3)) {
                logger.warn('Rigidbody#velocity', 'val', val);
                val = new Vec3;
            }

            this.velocity_ = val;
        }
    }
});

Rigidbody.prototype.attachEvent = function(handlername, callback) {
    if (typeof callback !== 'function') {
        logger.warn('Rigidbody#attachEvent', 'callback', callback);
        return;
    }
    if (!this.events[handlername]) {
        logger.warnfree(`Rigidbody#attachEvent: unexpected handlername, handlername: ${handlername}`);
        return;
    }

    this.events[handlername].push(callback);

    return [handlername, callback];
}

Rigidbody.prototype.detachEvent = function(handler) {
    if (!(handler instanceof Array)) {
        return;
    }

    var handlername = handler[0],
        callback = handler[1];

    var event = this.events[handlername];
    if (!event) {
        return;
    }

    event.splice(event.indexOf(callback), 1);
}

Rigidbody.prototype.fireEvent = function(handlername, args) {
    var events = this.events[handlername];

    if (events) {
        for (var i = 0; i < events.length; i++) {
            events[i].apply(events[i], args);
        }
    }
}

Rigidbody.prototype.initialize = function() {
    var self = this;

    this.attachEvent('update', options => {
        var body = self.body,
            physic = self.physic;

        if (body && physic) {

            if (!this.protozoa) {
                var velocity = amc('*', self.velocity, physic.maxspeed);

                // direction of speed
                var dif = amc('-', velocity, self.speed);

                if (dif.length() <= physic.acceleration) {
                    self.speed = velocity;
                } else {
                    // acceleration from start position to end position by vector
                    var shift = amc('*', dif.normalize(), physic.acceleration);

                    // add shift to current speed
                    self.speed = amc('+', self.speed, shift);
                }
            }

            var move = amc('+', self.externalities, self.speed);
            move = amc('*', move, options.deltaTime / 1000);
            body.position = amc('+', body.position, move);
        }
    });
}

Rigidbody.prototype.toJSON = function() {
    var out = {};

    out.speed = this.speed.array();

    return out;
}

module.exports = Rigidbody;

var logger = require('./logger');
var Body = require('./body');
var Physic = require('./physic');
var v = require('./vector');
var Vec3 = v.Vec3;
var Storage = require('./storage');
var math = require('./math');
var amc = math.amc;