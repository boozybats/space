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
    this.enabled = options.enabled || true;
    this.id = options.id || -2;
    this.name = options.name || 'anonymous';
    this.body = options.body || new Body;
    this.mesh = options.mesh;
    this.collider = options.collider;
    this.physic = options.physic;
    this.rigidbody = options.rigidbody;

    // Has been item instantiated
    this.isInstanced = false;
    // If item corrupted it will not be instantiated
    this.isCorrupted = false;
    // A variable environment that can be obtained by external methods
    this.public_ = {};
    // A variable environment that can be obtained only in this object
    this.private_ = {};

    this.oninstance = function() {};
    this.onremove = function() {};
    this.onupdate = function() {};
}

Object.defineProperties(Item, {
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
    mesh: {
        get: function() {
            return this.mesh_;
        },
        set: function(val) {
            if (val && !(val instanceof Mesh)) {
                warn('Item#mesh', 'val', val);
                val = undefined;
            }

            this.mesh_ = val;
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
    oninstance: {
        get: function() {
            return this.oninstance_;
        },
        set: function(val) {
            if (typeof val !== 'function') {
                val = function() {};
            }

            this.oninstance_ = val;
        }
    },
    onremove: {
        get: function() {
            return this.onremove_;
        },
        set: function(val) {
            if (typeof val !== 'function') {
                val = function() {};
            }

            this.onremove_ = val;
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
    project: {
        get: function() {
            return this.project_;
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
    },
    scene: {
        get: function() {
            return this.scene_;
        }
    },
    webGL: {
        get: function() {
            return this.webGL_;
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

/**
 * Instances item to scene. Intializes shader, attributes, uniforms
 * and write it to the shader, defines vertexIndices. Adds to
 * item's properties "scene", "project" and "webGL".
 * @param {Scene} scene
 * @param {Boolean} system Defines object type: system or regular
 * @method
 * @example
 * var item = new Item(options);
 *
 * var scene = new Scene('main');
 *
 * item.instance(scene, true);
 */
Item.prototype.instance = function(scene, isSystem = false) {
    if (this.isCorrupted) {
        log(`Warn: Item#instance: item is corrupted and can not be instantiated, id: ${this.id}`);
        return;
    }

    if (!(scene instanceof Scene)) {
        warn('Item#instance', 'scene', scene);
        return;
    }

    if (isSystem) {
        scene.appendSystemItem(this);
    } else {
        scene.appendItem(this);
    }

    this.isInstanced = true;
    this.scene_ = scene;
    this.project_ = scene.project;
    this.webGL_ = this.project.webGLRenderer.webGL;

    this.oninstance();
}

/**
 * Removes item from {@link Scene}'s objects. After
 * remove item can not be instantiated again, it needs
 * to create new item.
 * @method
 */
Item.prototype.remove = function() {
    if (this.onremove) {
        this.onremove();
    }

    if (this.scene) {
        this.scene.removeItem(this);
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
