/**
 * Contains light-object data on scene. More convenient than
 * use custom item for light because sends in shader
 * only the neccessary data. There are several types of light:
 * {@link DirectionalLight}, {@link PointLight}
 * @this {Light}
 * @param {Object} options
 * @param {String} options.name
 * @param {Body}   options.body
 * @class
 */
function Light(options = {}) {
    if (typeof options !== 'object') {
        warn('Light', 'options', options);
        options = {};
    }

    this.name = options.name || 'light';
    this.body = options.body || new Body;

    this.ambient = options.ambient || new Color(0, 0, 0, 1);
    this.diffuse = options.diffuse || new Color(255, 255, 255, 1);
    this.specular = options.specular || new Color(255, 255, 255, 1);
    this.intensity = options.intensity || 1000000;
}

Object.defineProperties(Light.prototype, {
    ambient: {
        get: function() {
            return this.ambient_;
        },
        set: function() {
            if (!(val instanceof Color)) {
                warn('Light#ambient', 'val', val);
                val = new Color(255, 255, 255, 1);
            }

            this.ambient_ = val;
        }
    },
    body: {
        get: function() {
            return this.body_;
        },
        set: function(val) {
            if (!(val instanceof Body)) {
                warn('Light#body', 'val', val);
                val = new Body;
            }

            this.body_ = val;
        }
    },
    diffuse: {
        get: function() {
            return this.diffuse_;
        },
        set: function() {
            if (!(val instanceof Color)) {
                warn('Light#diffuse', 'val', val);
                val = new Color(255, 255, 255, 1);
            }

            this.diffuse_ = val;
        }
    },
    intensity: {
        get: function() {
            return this.intensity_;
        },
        set: function(val) {
            if (typeof val !== 'number') {
                warn('Light#intensity', 'val', val);
                val = 0;
            }

            this.intensity_ = val;
        }
    },
    name: {
        get: function() {
            return this.name_;
        },
        set: function(val) {
            if (typeof val !== 'string') {
                warn('Light#name', 'val', val);
                val = 'light';
            }

            this.name_ = val;
        }
    },
    specular: {
        get: function() {
            return this.specular_;
        },
        set: function() {
            if (!(val instanceof Color)) {
                warn('Light#specular', 'val', val);
                val = new Color(255, 255, 255, 1);
            }

            this.specular_ = val;
        }
    }
});

/**
 * Makes an object from useful data.
 * @return {Object}
 */
Light.prototype.data = function() {
    var out = {};

    switch (this.constructor) {
        case DirectionalLight:
            out.type = 1;
            break;

        case PointLight:
            out.type = 2;
            break;
    }

    var position = amc('*', this.body.mvmatrix(), Vec.homogeneousPos).toCartesian();
    out.position = position;
    out.intensity = this.intensity;
    out.ambient = this.ambient;
    out.diffuse = this.diffuse;
    out.specular = this.specular;

    return out;
}

/**
 * Type of light that can be placed anywhere but rotation
 * must be choosen. Intensity has infinite value and
 * item has ininite scale with orthogonal light directivity.
 * @this {DirectionalLight}
 * @param {Object} options
 * @param {String} options.name
 * @param {Body} options.body
 * @param {Color} options.ambient Maximally dark color of the light.
 * As if the light was reflected an infinite number of times.
 * @param {Color} options.diffuse Takes values between
 * black and the brightest primary color (In this context max value
 * of the brightness doesn't make white from any color).
 * @param {Color} options.specular Shininess, reflected light
 * @class
 * @extends Light
 */
function DirectionalLight(options = {}) {
    Light.call(this, options);
}

DirectionalLight.prototype = Object.create(Light.prototype);
DirectionalLight.prototype.constructor = DirectionalLight;

/**
 * Type of light that lights around itself, position
 * must be choosen, rotation doesn't important. Point
 * light have limited intensity, so to see light on the
 * item must be placed near of it.
 * @this {PointLight}
 * @param {Object} options
 * @param {String} options.name
 * @param {Body} options.body
 * @param {Color} options.ambient Maximally dark color of the light.
 * As if the light was reflected an infinite number of times.
 * @param {Color} options.diffuse Takes values between
 * black and the brightest primary color (In this context max value
 * of the brightness doesn't make white from any color).
 * @param {Color} options.specular Shininess, reflected light
 * @param {Number} options.intensity
 * @class
 * @extends Light
 */
function PointLight(options = {}) {
    Light.call(this, options);
}

PointLight.prototype = Object.create(Light.prototype);
PointLight.prototype.constructor = PointLight;
