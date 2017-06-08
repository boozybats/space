const INTERPOLATION_DELAY = 100;
const EXTRAPOLATION_DURATION = 250;

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

    var tmpData = new Storage;
    tmpData.filter = (data => typeof data === 'object');
    this.temporaryData = tmpData;
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

// Sets changes for item
Heaven.prototype.applyChanges = function(state) {
    if (state.body) {
        var pos = state.body.position,
            rot = state.body.rotation,
            sca = state.body.scale;

        this.body.position = new Vec3(pos[0], pos[1], pos[2]);
        // this.body.rotation = new Quaternion(rot[0], rot[1], rot[2], rot[3]);
        // this.body.scale = new Vec3(sca[0], sca[1], sca[2]);
    }

    if (state.physic) {
        var matter = state.physic.matter;
        if (this.physic.matter.empty) {
            this.physic.matter = new Matter(matter);
        }
    }
}

// Are called by interpolation, sets interstitial changes for item between 2 states
Heaven.prototype.applyInterstitialChanges = function(state1, state2, time) {
    var state = {};

    var deltaTime = state2.receiveTime - state1.receiveTime;
    var relTime = state2.receiveTime - time;
    var precision = relTime / deltaTime;

    if (state1.body && state2.body) {
        var pos = vec3avg(state1.body.position, state2.body.position),
            // rot = qua3avg(state1.body.rotation, state2.body.rotation),
            sca = vec3avg(state1.body.scale, state2.body.scale);

        state.body = {
            position: pos,
            rotation: state2.body.rotation,
            scale: sca
        };
    }

    if (state1.physic) {
        state.physic = state1.physic;
    }

    this.applyChanges(state);

    function vec3avg(arr1, arr2) {
        var result = [
            arr1[0] + (arr2[0] - arr1[0]) * precision,
            arr1[1] + (arr2[1] - arr1[1]) * precision,
            arr1[2] + (arr2[2] - arr1[2]) * precision
        ];

        return result;
    }

    function qua3avg(arr1, arr2) {
        var qua1 = new Quaternion(arr1[0], arr1[1], arr1[2], arr1[3]),
            qua2 = new Quaternion(arr2[0], arr2[1], arr2[2], arr2[3]);

        var difference = amc('-', qua2, qua1);
        var bud = amc('*', difference, precision);
        var result = amc('+', qua1, bud);

        return result;
    }
}

// Predicts further actions if server distribution isn't received
Heaven.prototype.extrapolate = function() {}

// Sets onupdate function for heaven
Heaven.prototype.initialize = function() {
    var _private = this.private;
    var self = this;

    this.onupdate = function({
        time
    }) {
        // self.interpolate(time);

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

// Smooths actions between server distributions
Heaven.prototype.interpolate = function(time) {
    var isNext = false,
        startIndex;
    var interstitial = this.temporaryData.find((data, index) => {
        if (isNext) {
            isNext = false;
            return true;
        } else if (data.receiveTime + this.interpolationDelay >= time) {
            startIndex = index;
            isNext = true;
            return true;
        }

        return false;
    });

    if (interstitial.length < 2) {
        this.extrapolate(time);
        return;
    }

    this.temporaryData.splice(0, startIndex);

    this.applyInterstitialChanges(interstitial[0], interstitial[1], time);
}

/* Receives data from server and stores into temporary storage to use
by interpolation */
Heaven.prototype.receiveData = function(data, time) {
    if (typeof data !== 'object') {
        return;
    }

    var lastReceive = this.temporaryData.getLast();
    if (lastReceive && lastReceive.receiveTime >= time) {
        return;
    }

    if (typeof data.body === 'object') {
        var pos = data.body.position,
            rot = data.body.rotation,
            sca = data.body.scale;

        if (typeof pos !== 'object' ||
            typeof rot !== 'object' ||
            typeof sca !== 'object') {
            return;
        }
    }

    if (this.player) {
        this.applyChanges(data);
    } else {
        data.receiveTime = time;
        this.temporaryData.push(data);
    }
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
