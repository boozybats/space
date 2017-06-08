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
        warn('Item', 'options', options);
        options = {};
    }

    this.enabled = options.enabled || true;
    this.id = options.id || -2;
    this.name = options.name || 'anonymous';
    this.body = options.body || new Body;
    this.collider = options.collider;
    this.physic = options.physic;
    this.rigidbody = options.rigidbody;

    // A variable environment that can be obtained by external methods
    this.public_ = {};
    // A variable environment that can be obtained only in this object
    this.private_ = {};

    this.onupdate = function() {};
}

Object.defineProperties(Item.prototype, {
    body: {
        get: function() {
            return this.body_;
        },
        set: function(val) {
            if (!(val instanceof Body)) {
                warn('Item#body', 'val', val);
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
                warn('Item#collider', 'val', val);
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
                warn('Item#enabled', 'val', val);
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
                warn('Item#id', 'val', val);
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
                warn('Item#name', 'val', val);
                val = 'anonymous';
            }

            this.name_ = val;
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
    physic: {
        get: function() {
            return this.physic_;
        },
        set: function(val) {
            if (val && !(val instanceof Physic)) {
                warn('Item#physic', 'val', val);
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
                warn('Item#rigidbody', 'val', val);
                val = undefined;
            }

            this.rigidbody_ = val;
        }
    }
});

Item.prototype.frameUpdate = function(options) {
    this.onupdate(options);

    if (this.physic) {
        this.physic.onupdate(options);
    }

    if (this.rigidbody) {
        this.rigidbody.onupdate(options);
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
