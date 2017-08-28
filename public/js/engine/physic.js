function Physic(options = {}) {
    if (typeof options !== 'object') {
        warn('Physic', 'options', options);
        options = {};
    }

    this.acceleration = options.acceleration || 0;
    this.color = options.color || new Color(0, 0, 0, 0);
    this.diameter = options.diameter || 0;
    this.mass = options.mass || 0;
    this.maxspeed = options.maxspeed || 0;
    this.volume = options.volume || 0;

    this.events = {
        update: []
    };
}

Object.defineProperties(Physic.prototype, {
    acceleration: {
        get: function() {
            return this.acceleration_;
        },
        set: function(val) {
            if (typeof val !== 'number') {
                warn('Physic#acceleration', 'val', val);
                val = 0;
            }

            this.acceleration_ = val;
        }
    },
    color: {
        get: function() {
            return this.color_;
        },
        set: function(val) {
            if (!(val instanceof Color)) {
                warn('Physic#color', 'val', val);
                val = new Color(0, 0, 0, 0);
            }

            this.color_ = val;
        }
    },
    diameter: {
        get: function() {
            return this.diameter_;
        },
        set: function(val) {
            if (typeof val !== 'number') {
                warn('Physic#diameter', 'val', val);
                val = 0;
            }

            this.diameter_ = val;
        }
    },
    mass: {
        get: function() {
            return this.mass_;
        },
        set: function(val) {
            if (typeof val !== 'number') {
                warn('Physic#mass', 'val', val);
                val = 0;
            }

            this.mass_ = val;
        }
    },
    maxspeed: {
        get: function() {
            return this.maxspeed_;
        },
        set: function(val) {
            if (typeof val !== 'number') {
                warn('Physic#maxspeed', 'val', val);
                val = 0;
            }

            this.maxspeed_ = val;
        }
    },
    volume: {
        get: function() {
            return this.volume_;
        },
        set: function(val) {
            if (typeof val !== 'number') {
                warn('Physic#volume', 'val', val);
                val = 0;
            }

            this.volume_ = val;
        }
    }
});

Physic.prototype.attachEvent = function(handlername, callback) {
    if (typeof callback !== 'function') {
        logger.warn('Physic#attachEvent', 'callback', callback);
        return;
    }
    if (!this.events[handlername]) {
        logger.warnfree(`Physic#attachEvent: unexpected handlername, handlername: ${handlername}`);
        return;
    }

    this.events[handlername].push(callback);

    return [handlername, callback];
}

Physic.prototype.detachEvent = function(handler) {
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

Physic.prototype.fireEvent = function(handlername, args) {
    var events = this.events[handlername];

    if (events) {
        for (var i = 0; i < events.length; i++) {
            events[i].apply(events[i], args);
        }
    }
}
