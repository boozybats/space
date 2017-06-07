function Rigidbody(options = {}) {
    if (typeof options !== 'object') {
        warn('Rigidbody', 'options', options);
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
                warn('Rigidbody#body', 'val', val);
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
                warn('Rigidbody#onupdate', 'val', val);
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
                warn('Rigidbody#velocity', 'val', val);
                val = new Vec3;
            }

            this.velocity_ = val;
        }
    }
});

// Updates properties and send them to callbacks onchange
Rigidbody.prototype.initialize = function() {
    var self = this;
    this.onupdate = function({
        deltaTime
    }) {
        var tugged = [];

        var dataVelocity = self.data.velocity;
        var velocity = self.velocity,
            shift = amc('*', velocity, deltaTime);

        if (amc('=', dataVelocity.value, velocity)) {
            dataVelocity.duration += deltaTime;
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
        warn('Rigidbody#tug', 'list', list);
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
