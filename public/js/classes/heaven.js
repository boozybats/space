/**
 * Main gameobject known as asteroid.
 * Doesn't pass a mesh because "Circle" will generate itself.
 */
function Heaven(options = {}) {
    if (typeof options !== 'object') {
        warn('Heaven', 'options', options);
        options = {};
    }

    options.physic = new Physic;
    options.rigidbody = new Rigidbody;
    options.precision = 3;

    Circle.call(this, options);

    this.player = options.player;

    this.initializeMesh(options.shader);
    this.initialize();

    // Latency of animation
    var inp = options.interpolationDelay;
    this.interpolationDelay = typeof inp === 'number' ? inp : INTERPOLATION_DELAY;
    // How much time needs to predict future after losing connection
    var exp = options.extrapolationDuration;
    this.extrapolationDuration = typeof exp === 'number' ? exp : EXTRAPOLATION_DURATION;

    this.tmpData = [];
}

Heaven.prototype = Object.create(Circle.prototype);
Heaven.prototype.constructor = Heaven;

Object.defineProperties(Heaven.prototype, {
    extrapolationDuration: {
        get: function() {
            return this.extrapolationDuration_;
        },
        set: function(val) {
            if (typeof val !== 'number') {
                warn('Heaven#extrapolationDuration', 'val', val);
                val = EXTRAPOLATION_DURATION;
            }

            this.extrapolationDuration_ = val;
        }
    },
    interpolationDelay: {
        get: function() {
            return this.interpolationDelay_;
        },
        set: function(val) {
            if (typeof val !== 'number') {
                warn('Heaven#interpolationDelay', 'val', val);
                val = INTERPOLATION_DELAY;
            }

            this.interpolationDelay_ = val;
        }
    },
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

Heaven.prototype.extrapolate = function(time) {
    var tmpData = this.tmpData;

    var data = tmpData[tmpData.length - 1];

    this.setChanges(data.data);
}

// Sets onupdate function for heaven
Heaven.prototype.initialize = function() {
    var _private = this.private;
    var self = this;

    this.attachEvent('update', options => {
        var time = options.time;

        self.mesh.changeUniforms({
            u_Time: (time - self.mesh.shader.startTime) / 1000
        });

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

            var z = body.scale.z * -2.5;

            obsbody.position = new Vec3(body.position.xy, z);
        }
    });

    this.attachEvent('attribute', (name, value) => {});
}

// Sets maps to shader
Heaven.prototype.initializeMesh = function(shader) {
    if (!(shader instanceof Shader)) {
        warn('Heaven#initializeMesh', 'shader', shader);
        return;
    }

    // Set heaven's shader, not parent's
    this.mesh.shader = shader;


    // Set own textures in material
    var normalmap = new Image();
    normalmap.src = 'images/n_heaven.jpg';
    var diffusemap = new Image();
    diffusemap.src = 'images/d_heaven.jpg';

    this.mesh.material.normalmap = normalmap;
    this.mesh.material.diffusemap = diffusemap;

    this.mesh.changeUniforms({
        u_Resolution: shader.options.resolution
    });
}

Heaven.prototype.interpolate = function(time) {
    var interval;

    var tmpData = this.tmpData;
    if (tmpData.length < 2) {
        return;
    }

    for (var i = 1; i < tmpData.length; i++) {
        var data = tmpData[i];

        if (data.time >= time - this.interpolationDelay) {
            interval = [tmpData[i - 1], tmpData[i]];
            tmpData.splice(0, i - 1);
            break;
        }
    }

    if (!interval) {
        this.tmpData = tmpData.slice(-1);

        this.extrapolate(time);
        return;
    }

    this.setInterstitialChanges(interval[0], interval[1], time);
}

Heaven.prototype.setChanges = function(options) {
    if (typeof options !== 'object') {
        warn('Heaven#setChanges', 'options', options);
        return;
    }

    if (options.body) {
        var pos = options.body.position;
        this.body.position = new Vec3(pos[0], pos[1], pos[2]);

        var rot = options.body.rotation;
        this.body.rotation = Quaternion.Euler(rot[0], rot[1], rot[2]);
    }

    if (options.physic) {
        this.physic.diameter = options.physic.diameter;
        this.physic.maxspeed = options.physic.maxspeed;
    }
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

    var changes = {};

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

        changes.body = {
            position: pos,
            rotation: rot
        };
    }

    var physic0 = data0.physic,
        physic1 = data1.physic;

    if (typeof physic0 === 'object' && typeof physic1 === 'object') {
        var diameter0 = physic0.diameter,
            diameter1 = physic1.diameter;
        var maxspeed0 = physic0.maxspeed,
            maxspeed1 = physic1.maxspeed;

        changes.physic = {
            diameter: getInstFloat(diameter0, diameter1, multiplier),
            maxspeed: getInstFloat(maxspeed0, maxspeed1, multiplier)
        }
    }

    this.setChanges(changes);
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
        `attribute vec3 a_Position;
        attribute vec2 a_UV;

        uniform mat4 u_MVMatrix;
        uniform mat4 u_MVPMatrix;

        varying vec2 v_UV;

        void main() {
            vec3 st = vec3(a_Position.xy, 0.);
            vec4 position4 = u_MVMatrix * vec4(a_Position, 1.);

            v_UV = a_UV;

            gl_Position = u_MVPMatrix * position4;
        }`,

        `precision mediump float;

        varying vec2 v_UV;

        void main() {
            vec2 st = v_UV;
            vec4 color = vec4(step(.5, length(st)));

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
