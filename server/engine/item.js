/**
 * Item stores info about object: {@link Body}, {@link Mesh},
 * {@link Physic}, {@link Collider}, etc. Created item doesn't
 * instantly binds to scene, it must be instantiated by same method.
 * @this {Item}
 * @param {Object} options
 * @param {Boolean} options.enabled Does item exist on scene.
 * @param {Number} options.id
 * @param {String} options.name
 * @param {Body} options.body
 * @param {Mesh} options.mesh
 * @param {Physic} options.physic
 * @param {Collider} options.collider
 * @class
 */
function Item(options = {}) {
    if (typeof options !== 'object') {
        logger.warn('Item', 'options', options);
        options = {};
    }

    this.enabled = options.enabled || true;
    this.id = options.id || -1;
    this.name = options.name || 'anonymous';
    this.body = options.body || new Body;
    this.collider = options.collider || new Collider;
    this.physic = options.physic;
    this.rigidbody = options.rigidbody;

    this.events = {
        destroy: [],
        update: []
    };

    // A variable environment that can be obtained by external methods
    this.public_ = {};
    // A variable environment that can be obtained only in this object
    this.private_ = {};
}

Object.defineProperties(Item.prototype, {
    body: {
        get: function() {
            return this.body_;
        },
        set: function(val) {
            if (!(val instanceof Body)) {
                logger.warn('Item#body', 'val', val);
                val = new Body;
            }

            this.body_ = val;
        }
    },
    collider: {
        get: function() {
            return this.collider_;
        },
        set: function(val) {
            if (val && !(val instanceof Collider)) {
                logger.warn('Item#collider', 'val', val);
                val = undefined;
            }

            this.collider_ = val;
        }
    },
    enabled: {
        get: function() {
            return this.enabled_;
        },
        set: function(val) {
            if (typeof val !== 'boolean') {
                logger.warn('Item#enabled', 'val', val);
                val = true;
            }

            this.enabled_ = val;
        }
    },
    id: {
        get: function() {
            return this.id_;
        },
        set: function(val) {
            if (typeof val !== 'number') {
                logger.warn('Item#id', 'val', val);
                val = -2;
            }

            this.id_ = val;
        }
    },
    name: {
        get: function() {
            return this.name_;
        },
        set: function(val) {
            if (typeof val !== 'string') {
                logger.warn('Item#name', 'val', val);
                val = 'anonymous';
            }

            this.name_ = val;
        }
    },
    physic: {
        get: function() {
            return this.physic_;
        },
        set: function(val) {
            if (val && !(val instanceof Physic)) {
                logger.warn('Item#physic', 'val', val);
                val = undefined;
            }

            this.physic_ = val;
        }
    },
    private: {
        get: function() {
            return this.private_;
        }
    },
    public: {
        get: function() {
            return this.public_;
        }
    },
    rigidbody: {
        get: function() {
            return this.rigidbody_;
        },
        set: function(val) {
            if (val && !(val instanceof Rigidbody)) {
                logger.warn('Item#rigidbody', 'val', val);
                val = undefined;
            }

            this.rigidbody_ = val;
        }
    }
});

Item.prototype.attachEvent = function(handlername, callback) {
    if (typeof callback !== 'function') {
        logger.warn('Item#attachEvent', 'callback', callback);
        return;
    }
    if (!this.events[handlername]) {
        logger.warnfree(`Item#attachEvent: unexpected handlername, handlername: ${handlername}`);
        return;
    }

    this.events[handlername].push(callback);

    return [handlername, callback];
}

Item.prototype.destroy = function(method) {
    this.enabled = false;

    this.fireEvent('destroy', [method]);
}

Item.prototype.detachEvent = function(handler) {
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

Item.prototype.fireEvent = function(handlername, args) {
    var events = this.events[handlername];

    if (events) {
        for (var i = 0; i < events.length; i++) {
            events[i].apply(events[i], args);
        }
    }
}

Item.prototype.streamUpdate = function(options) {
    this.fireEvent('update', [options]);

    if (this.rigidbody) {
        this.rigidbody.fireEvent('update', [options]);
    }

    if (this.physic) {
        this.physic.fireEvent('update', [options]);
    }
}

Item.prototype.toJSON = function() {
    var out = {};

    out.id = this.id;

    if (this.body) {
        out.body = this.body.toJSON();
    }

    if (this.physic) {
        out.physic = this.physic.toJSON();
    }

    return out;
}

module.exports = Item;

var Body = require('./body');
var Collider = require('./collider');
var Physic = require('./physic');
var Rigidbody = require('./rigidbody');
