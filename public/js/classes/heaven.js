/**
 * Main gameobject known as asteroid.
 * Doesn't pass a mesh because "Sphere" will generate itself.
 */
function Heaven(options = {}) {
    if (typeof options !== 'object') {
        warn('Heaven', 'options', options);
        options = {};
    }

    options.physic = new Physic(new Matter({
        Fe: 200
    }));
    options.rigidbody = new Rigidbody;
    options.precision = 3;

    Sphere.call(this, options);

    this.initializeMesh(options.shader);
    this.initialize();
    this.initializeRigidbody();

    // Latency of animation
    this.interpolationDelay = options.interpolationDelay || INTERPOLATION_DELAY;
    // How much time needs to predict future after losing connection
    this.extrapolationDuration = options.extrapolationDuration || EXTRAPOLATION_DURATION;

    this.tmpData = [];
}

Heaven.prototype = Object.create(Sphere.prototype);
Heaven.prototype.constructor = Heaven;

Object.defineProperties(Heaven.prototype, {
    observer: {
        get: function() {
            return this.observer_;
        },
        set: function(val) {
            if (val && !(val instanceof Camera)) {
                warn('Heaven#observer', 'val', val);
                val = undefined;
            }

            this.observer_ = val;
        }
    },
    physic: {
        get: function() {
            return this.physic_;
        },
        set: function(val) {
            if (!(val instanceof Physic)) {
                warnfree('Heaven#physic', 'val', val);
                return;
            }

            this.physic_ = val;
        }
    },
    rigidbody: {
        get: function() {
            return this.rigidbody_;
        },
        set: function(val) {
            if (!(val instanceof Rigidbody)) {
                warnfree('Heaven#rigidbody', 'val', val);
                return;
            }

            this.rigidbody_ = val;
        }
    }
});

Heaven.prototype.addTempData = function(data, time) {
    this.tmpData.push({
        time: time,
        data: data
    });
}

// Sets onupdate function for heaven
Heaven.prototype.initialize = function() {
    var _private = this.private;
    var self = this;

    this.onupdate = function({
        time
    }) {
        self.interpolate(time);

        var oldDiameter = _private.diameter,
            diameter = self.physic.diameter;
        if (oldDiameter !== diameter) {
            _private.diameter = diameter;
            self.body.scale = new Vec3(diameter, diameter, diameter);
        }

        if (self.observer) {
            var obsbody = self.observer.body;
            var body = self.body;

            var z = body.scale.z * -6;

            obsbody.position = new Vec3(body.position.xy, z);
        }
    }
}

Heaven.prototype.interpolate = function(time) {
    var interval;

    var tmpData = this.tmpData;
    for (var i = 0; i < tmpData.length; i++) {
        var data = tmpData[i];

        if (data.time >= time) {
            interval = [tmpData[i - 1], tmpData[i]];
            tmpData.splice(0, i - 1);
            break;
        }
    }

    if (!interval) {
        return;
    }
}

// Sets maps to shader
Heaven.prototype.initializeMesh = function(shader) {
    if (!(shader instanceof Shader)) {
        warn('Heaven#initializeMesh', 'shader', shader);
        return;
    }

    // Add maps to shader
    var normalmap = new Image();
    normalmap.src = 'images/n_heaven.jpg';

    var diffusemap = new Image();
    diffusemap.src = 'images/d_heaven.jpg';

    // Set heaven's shader, not parent's
    this.mesh.shader = shader;
    this.mesh.material = new Material({
        normalmap: normalmap,
        diffusemap: diffusemap
    });
}

// Sets onupdate function for heaven's rigidbody
Heaven.prototype.initializeRigidbody = function() {
    if (!this.player) {
        return;
    }

    this.rigidbody.onсhange('velocity', (value, duration) => {
        this.player.addAction('velocity', {
            value: value.array(),
            duration: duration
        });
    });
}

Heaven.shader = function() {
    return [
        `#define MAX_LIGHTS 8

        struct Light {
            vec4  ambient;
            vec4  diffuse;
            vec4  specular;
            vec3  position;
            float type;
            float intensity;
        };

        attribute vec3 a_Position;
        attribute vec3 a_Normal;
        attribute vec2 a_UV;

        uniform mat4 u_MVMatrix;
        uniform mat4 u_MVPMatrix;
        uniform mat3 u_MVNMatrix;
        uniform Light u_Lights[MAX_LIGHTS];

        varying vec4 v_LightAmbient[MAX_LIGHTS];
        varying vec4 v_LightDiffuse[MAX_LIGHTS];
        varying vec2 v_UV;

        void main(void) {
            vec4 position4 = u_MVMatrix * vec4(a_Position, 1.0);
            gl_Position = u_MVPMatrix * position4;

            v_UV = a_UV;

            vec3 position3 = position4.xyz / position4.w;
            vec3 normal = normalize(u_MVNMatrix * a_Normal);

            for (int i = 0; i < MAX_LIGHTS; i++) {
                Light light = u_Lights[i];
                if (light.type != 2.0) {
                    continue;
                }

                vec3 dir = normalize(light.position - position3);
                float cosTheta = clamp(dot(normal, dir), 0.0, 1.0);

                float dist = distance(position3, light.position);

                v_LightDiffuse[i] = light.diffuse * light.intensity * cosTheta / pow(dist, 2.0);
                v_LightAmbient[i] = light.ambient;
            }
        }`,

        `precision mediump float;

        #define MAX_LIGHTS 8

        struct Material {
            vec4 ambient;
            vec4 diffuse;
            vec4 specular;
            sampler2D ambientmap;
            sampler2D diffusemap;
            sampler2D specularmap;
            sampler2D normalmap;
        };

        uniform Material u_Material;

        varying vec4 v_LightAmbient[MAX_LIGHTS];
        varying vec4 v_LightDiffuse[MAX_LIGHTS];
        varying vec2 v_UV;

        void main(void) {
            vec4 diffuseTex = texture2D(u_Material.diffusemap, v_UV);

            vec4 color = vec4(0.0);

            for (int i = 0; i < MAX_LIGHTS; i++) {
                vec4 ambient = u_Material.ambient * v_LightAmbient[i];
                vec4 diffuse = diffuseTex * v_LightDiffuse[i];
                color += ambient + diffuse;
            }

            color = vec4(
                min(color.x, diffuseTex.x),
                min(color.y, diffuseTex.y),
                min(color.z, diffuseTex.z),
                min(color.w, diffuseTex.w)
            );

            gl_FragColor = color;
        }`
    ];
}

Heaven.prototype.toJSON = function() {
    var out = {};

    if (this.body) {
        out.body = this.body.toJSON();
    }

    return out;
}
