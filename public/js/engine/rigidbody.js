function Rigidbody(options = {}) {
    if (typeof options !== 'object') {
        warn('Rigidbody', 'options', options);
        options = {};
    }

    this.actions = {};
    this.body = options.body;

    this.events = {
        update: []
    };

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
    this.actions[type] = value;
}

Rigidbody.prototype.attachEvent = function(handlername, callback) {
    if (typeof callback !== 'function') {
        warn('Rigidbody#attachEvent', 'callback', callback);
        return;
    }
    if (!this.events[handlername]) {
        warnfree(`Rigidbody#attachEvent: unexpected handlername, handlername: ${handlername}`);
        return;
    }

    this.events[handlername].push(callback);

    return [handlername, callback];
}

Rigidbody.prototype.clearActions = function() {
    this.actions = {};
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

Rigidbody.prototype.getActions = function(json) {
    if (json) {
        var wrap = {};

        for (var i in this.actions) {
            var action = this.actions[i];
            wrap[i] = action.array();
        }

        return wrap;
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
