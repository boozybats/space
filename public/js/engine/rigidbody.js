function Rigidbody(options = {}) {
    if (typeof options !== 'object') {
        warn('Rigidbody', 'options', options);
        options = {};
    }

    this.actions = [];
    this.body = options.body;

    this.lastUpdate = Date.now();
    // Stores last values of properties
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

Rigidbody.prototype.addAction = function(type, value) {
    this.actions.push({
        type: type,
        value: value
    });
}

Rigidbody.prototype.clearActions = function() {
    this.actions = [];
}

Rigidbody.prototype.getActions = function() {
    return this.actions;
}

// Updates properties and send them to callbacks onchange
Rigidbody.prototype.initialize = function() {
    var self = this;
    this.onupdate = function(options) {
        if (typeof options !== 'object') {
            warn('Rigidbody#onupdate', 'options', options);
            return;
        }

        self.makeVelocity(options.deltaTime);
    }
}

Rigidbody.prototype.makeVelocity = function(deltaTime) {
    var velocity = this.velocity;
    if (velocity.length() === 0) {
        return;
    }

    var shift = amc('*', velocity, deltaTime);

    this.addAction('velocity', deltaTime);

    var body = this.body;
    if (body) {
        body.position = amc('+', body.position, shift);
    }
}
