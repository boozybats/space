function Physic(options = {}) {
    if (typeof options !== 'object') {
        warn('Physic', 'options', options);
        options = {};
    }

    this.color = options.color || new Color(0, 0, 0, 0);
    this.diameter = options.diameter || 0;
    this.mass = options.mass || 0;
    this.maxspeed = options.maxspeed || 0;
    this.volume = options.volume || 0;

    this.onupdate = function() {};
}

Object.defineProperties(Physic.prototype, {
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
    onupdate: {
        get: function() {
            return this.onupdate_;
        },
        set: function(val) {
            if (typeof val !== 'function') {
                val = function() {};
            }

            this.onupdate_ = val;
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
