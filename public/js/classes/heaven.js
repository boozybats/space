/**
 * Main gameobject known as asteroid.
 * Doesn't pass a mesh because "Sphere" will generate itself.
 */
function Heaven(options = {}) {
    if (typeof options !== 'object') {
        warn('Heaven', 'options', options);
        options = {};
    }

    options.physic = new Physic;
    options.rigidbody = new Rigidbody;
    options.precision = 3;

    Sphere.call(this, options);

    this.player = options.player;

    this.initializeMesh(options.shader);
    this.initialize();

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
    player: {
        get: function() {
            return this.player_;
        },
        set: function(val) {
            if (val && !(val instanceof Player)) {
                warn('Heaven#player', 'val', val);
                val = undefined;
            }

            this.player_ = val;
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
        data: data,
        time: time
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

Heaven.prototype.interpolate = function(time) {
    var interval;

    var tmpData = this.tmpData;
    if (tmpData.length < 2) {
        return;
    }

    for (var i = 0; i < tmpData.length; i++) {
        var data = tmpData[i];

        if (data.time >= time - this.interpolationDelay) {
            interval = [tmpData[i - 1], tmpData[i]];
            tmpData.splice(0, i - 1);
            break;
        }
    }

    if (!interval) {
        return;
    }

    this.setInterstitialChanges(interval[0], interval[1], time);
}

// Path where item get interstitial properties between two states in time
Heaven.prototype.setInterstitialChanges = function(state0, state1, time) {
    if (typeof state0 !== 'object') {
        warn('Heaven#setInterstitialChanges', 'state0', state0);
        return;
    }
    if (typeof state1 !== 'object') {
        warn('Heaven#setInterstitialChanges', 'state1', state1);
        return;
    }

    var time0 = state0.time,
        time1 = state1.time;

    if (typeof time0 !== 'number' || typeof time1 !== 'number') {
        return;
    }

    var multiplier = (time - time0) / (time1 - time0);

    var data0 = state0.data,
        data1 = state1.data;

    if (typeof data0 !== 'object' || typeof data1 !== 'object') {
        return;
    }

    var body0 = data0.body,
        body1 = data1.body;

    if (typeof body0 === 'object' && typeof body1 === 'object') {
        var pos0 = body0.position,
            pos1 = body1.position;
        var rot0 = body0.rotation,
            rot1 = body1.rotation;

        var pos = getInstlVec(pos0, pos1, multiplier),
            rot = getInstlVec(rot0, rot1, multiplier);

        this.body.position = new Vec3(pos[0], pos[1], pos[2]);
        this.body.rotation = Quaternion.Euler(rot[0], rot[1], rot[2]);
    }

    var physic0 = data0.physic,
        physic1 = data1.physic;

    if (typeof physic0 === 'object' && typeof physic1 === 'object') {
        var diameter0 = physic0.diameter,
            diameter1 = physic1.diameter;
        var maxspeed0 = physic0.maxspeed,
            maxspeed1 = physic1.maxspeed;

        this.physic.diameter = getInstFloat(diameter0, diameter1, multiplier);
        this.physic.maxspeed = getInstFloat(maxspeed0, maxspeed1, multiplier);
    }
}

function getInstFloat(val0, val1, multiplier) {
    return val0 + (val1 - val0) * multiplier;
}

// Returns interstital value between two values by multiplier
function getInstlVec(val0, val1, multiplier) {
    var out = [
        val0[0] + (val1[0] - val0[0]) * multiplier,
        val0[1] + (val1[1] - val0[1]) * multiplier,
        val0[2] + (val1[2] - val0[2]) * multiplier
    ];

    return out;
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

                v_LightDiffuse[i] = light.diffuse * cosTheta;
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
