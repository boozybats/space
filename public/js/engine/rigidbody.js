function Rigidbody(options = {}) {
    if (typeof options !== 'object') {
        warn('Rigidbody', 'options', options);
        options = {};
    }

    this.actions = [];
    this.body = options.body;

    // Stores last values of properties
    this.velocity = new Vec3;
    this.lastValues = {
        velocity: this.velocity
    };

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

Rigidbody.prototype.getActions = function(json) {
    if (json) {
        return this.actions.map(action => {
            return {
                type: action.type,
                value: action.value.array()
            };
        });
    } else {
        return this.actions;
    }
}

// Updates properties and send them to callbacks onchange
Rigidbody.prototype.initialize = function() {
    var self = this;
    this.onupdate = function(options) {
        if (typeof options !== 'object') {
            warn('Rigidbody#onupdate', 'options', options);
            return;
        }

        self.makeVelocity();
    }
}

Rigidbody.prototype.makeVelocity = function(deltaTime) {
    var velocity = this.velocity;

    if (!amc('=', this.lastValues.velocity, velocity)) {
        this.addAction('velocity', velocity);
        this.lastValues.velocity = velocity;
    }

    var body = this.body;
    if (body) {
        var shift = amc('*', velocity, deltaTime);

        body.position = amc('+', body.position, shift);
    }
}
