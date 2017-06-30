function Rigidbody(options = {}) {
    if (typeof options !== 'object') {
        logger.warn('Rigidbody', 'options', options);
        options = {};
    }

    this.body = options.body;

    // Stores a custom handlers, are called on change values
    var handlers = new Storage;
    handlers.filter = (data => typeof data === 'function');
    this.handlers = handlers;

    this.velocity = new Vec3;
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
    onupdate: {
        get: function() {
            return this.onupdate_;
        },
        set: function(val) {
            if (typeof val !== 'function') {
                logger.warn('Rigidbody#onupdate', 'val', val);
                val = function() {};
            }

            this.onupdate_ = val;
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

module.exports = Rigidbody;

var logger = require('./logger');
var Body = require('./body');
var v = require('./vector');
var Vec3 = v.Vec3;
var Storage = require('./storage');
var math = require('./math');
var amc = math.amc;
