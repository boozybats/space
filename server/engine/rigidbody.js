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

    // Stores last values of properties
    this.data = {
        velocity: {
            value: new Vec3,
            duration: 0
        }
    };
    this.velocity = new Vec3;

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

// Updates properties and send them to callbacks onchange
Rigidbody.prototype.initialize = function() {
    var self = this;
    this.onupdate = function(options) {
        if (typeof options !== 'object') {
            logger.warn('Rigidbody#onupdate', 'options', options);
            return;
        }

        var tugged = [];

        var dataVelocity = self.data.velocity;
        var velocity = self.velocity,
            shift = amc('*', velocity, options.deltaTime);

        if (amc('=', dataVelocity.value, velocity)) {
            dataVelocity.duration += options.deltaTime;
        } else {
            tugged.push('velocity');
        }

        self.tug(tugged);

        var body = self.body;
        if (body) {
            body.position = amc('+', body.position, shift);
        }
    }
}

Rigidbody.prototype.onсhange = function(handler, callback) {
    this.handlers.set(handler, callback);
}

// Triggers selected changes, if list aren't selected when choose every property
Rigidbody.prototype.tug = function(list) {
    if (list && !(list instanceof Array)) {
        logger.warn('Rigidbody#tug', 'list', list);
        return;
    }

    var self = this;
    if (!list || ~list.indexOf('velocity')) {
        var dataVelocity = self.data.velocity;
        var velocity = self.velocity;

        var callback = self.handlers.get('velocity');
        if (callback) {
            callback(dataVelocity.value, dataVelocity.duration);
        }

        dataVelocity.value = velocity;
        dataVelocity.duration = 0;
    }
}

var logger = require('./logger');
var v = require('./vector');
var Vec3 = v.Vec3;
var Storage = require('./storage');
var math = require('./math');
var amc = math.amc;
