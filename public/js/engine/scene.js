/**
 * Collects cameras, items and lights. Scene must be binded to the project
 * and defined as current scene to start action here.
 * @this {Scene}
 * @param {Object} options
 * @param {String} options.name
 * @param {Project} options.project
 * @param {Color} options.skyBoxColor
 * @param {String} options.skyBoxType
 * @class
 * @property {Array} cameras
 * @property {Array} directionalLights
 * @property {Array} pointLights
 * @property {Array} items
 * @property {Array} systemitems Can be drawn separately from items.
 */
function Scene(options = {}) {
    if (typeof options !== 'object') {
        warn('Scene', 'options', options);
        options = {};
    }

    this.name = options.name || 'name';
    this.skyBoxColor = options.skyBoxColor || new Color(0, 0, 0, 1);
    this.skyBoxType = options.skyBoxType || 'fill';
    this.project = options.project;

    this.cameras_ = new Storage;
    this.directionalLights_ = new Storage;
    this.pointLights_ = new Storage;
    this.items_ = new Storage;
    this.systemitems_ = new Storage;
}

Object.defineProperties(Scene.prototype, {
    cameras: {
        get: function() {
            return this.cameras_;
        }
    },
    directionalLights {
        get: function() {
            return this.directionalLights_;
        }
    },
    items: {
        get: function() {
            return this.items_;
        }
    },
    name: {
        get: function() {
            return this.name_;
        },
        set: function(val) {
            if (typeof val !== 'string') {
                warn('Scene#name', 'val', val);
                val = 'name';
            }

            this.name_ = val;
        }
    },
    pointLights: {
        get: function() {
            return this.pointLights_;
        }
    },
    project: {
        get: function() {
            return this.project_;
        },
        set: function(val) {
            if (val && !(val instanceof Project)) {
                warn('Scene#project', 'val', val);
                val = undefined;
            }

            this.project_ = val;
        }
    },
    skyBoxColor: {
        get: function() {
            return this.skyBoxColor_;
        },
        set: function(val) {
            if (!(val instanceof Color)) {
                warn('Scene#skyBoxColor', 'val', val);
                val = new Color(0, 0, 0, 1);
            }

            this.skyBoxColor_ = val;
        }
    },
    skyBoxType: {
        get: function() {
            return this.skyBoxType_;
        },
        set: function(val) {
            if (typeof val !== 'string') {
                warn('Scene#skyBoxType', 'val', val);
                val = 'fill';
            }

            this.skyBoxType_ = val;
        }
    },
    systemitems: {
        get: function() {
            return this.systemitems_;
        }
    }
});

/**
 * Appends camera to scene. All binded enabled cameras
 * draw new WebGLRenderingContext view. To see all redrawed items
 * set skyBoxType as transparent.
 * @param  {Camera} camera
 * @method
 */
Scene.prototype.appendCamera = function(camera) {
    if (!(camera instanceof Camera)) {
        warn('Scene#appendCamera', 'camera', camera);
        return;
    }

    this.cameras.push(camera);
    camera.scene_ = this;
}

/**
 * Appends item to scene. Usualy function are
 * called by {@link Item#instance}.
 * @param  {Item} item
 * @method
 */
Scene.prototype.appendItem = function(item) {
    if (!(item instanceof Item)) {
        warn('Scene#appendItem', 'item', item);
        return;
    }

    this.items.push(item);
    item.scene_ = this;
}

/**
 * Appends system item to scene. Usualy function are
 * called by {@link Item#instance}.
 * @param  {Item} item
 * @method
 */
Scene.prototype.appendSystemItem = function(item) {
    if (!(item instanceof Item)) {
        warn('Scene#appendSystemItem', 'item', item);
        return;
    }

    this.systemitems.push(item);
    item.scene_ = this;
}

/**
 * Adds light of any type in scene, auto detection to class.
 * @param {Light} light
 * @method
 */
Scene.prototype.addLight = function(light) {
    if (!(light instanceof Light)) {
        warn('Scene#addLight', 'light', light);
        return;
    }

    var constructor = light.constructor;
    switch (constructor) {
        case DirectionalLight:
            this.directionalLights.push(light);
            break;

        case PointLight:
            this.pointLights.push(light);
            break;
    }
}

/**
 * Checks items by ids, if id doesn't selected then disables
 * item.
 * @param  {Array} items
 */
Scene.prototype.disableUnusableItems = function(items) {
    if (!(items instanceof Array)) {
        warn('Scene#disableUnusableItems', 'items', items);
        return;
    }

    this.items.each(item => {
        if (!item.enabled) {
            return;
        }

        if (!~items.indexOf(item.id)) {
            item.enabled = false;
        }
    });
}

/**
 * Returns finded item of scene by id, name (depending on
 * "type") else returns undefined.
 * @param {String} type id, name.
 * @param  {Number | String} val
 * @return {Item}
 * @method
 * @example
 * var scene = new Scene();
 *
 * var item = new Item({id: 2031, ...});
 * item.instance(scene);
 *
 * scene.findItem('id', 2031);  // Item {id: 2031, ...}
 */
Scene.prototype.findItem = function(type, val) {
    var out;
    var items = this.items;

    switch (type) {
        case 'id':
            out = items.find(item => {
                return item.id === val;
            });
            out = out[0];
            break;
    }

    return out;
}

/**
 * Returns an object with all lights of scene with calculated
 * position, rotations, intensity, etc.
 * @return {Object}
 * @method
 * @example
 * var scene = new Scene();
 * scene.getSceneLights();  // Object {pointLights: {position: ..., ambient: ...}, directionalLights: ...}
 */
Scene.prototype.getLights = function() {
    var out = [];

    var directionalLights = this.directionalLights;
    directionalLights.each(light => {
        out.push(light.data());
    });

    var pointLights = this.pointLights;
    pointLights.each(light => {
        out.push(light.data());
    });

    return out;
}

/**
 * Removes item from scene's items or systemitems.
 * @param  {item} item
 * @method
 */
Scene.prototype.removeItem = function(item) {
    if (!(item instanceof Item)) {
        warn('Scene#removeItem', item, item);
        return false;
    }

    var result = false;

    this.items.each((nitem, key) => {
        if (nitem === item) {
            this.items.remove(key);
            result = true;

            return false;
        }
    });
    this.systemitems.each((nitem, key) => {
        if (nitem === item) {
            this.systemitems.remove(key);
            result = true;

            return false;
        }
    });

    return result;
}

/**
 * Removes light from scene's lights, auto detection to class.
 * @param  {Light} light
 * @method
 */
Scene.prototype.removeLight = function(light) {
    if (!(light instanceof Light)) {
        warn('Scene#removeLight', 'light', light);
        return false;
    }

    var constructor = light.constructor;
    switch (constructor) {
        case DirectionalLight:
            var index = this.directionalLights.indexOf(light);
            if (~index) {
                this.directionalLights.splice(index, 1);

                return true;
            }

            break;

        case PointLight:
            var index = this.pointLights.indexOf(light);
            if (~index) {
                this.pointLights.splice(index, 1);

                return true;
            }

            break;
    }

    return false;
}
