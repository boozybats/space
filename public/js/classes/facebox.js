/**
 * Top layer for user vision, draws a direction arrow by
 * shader.
 */
function Facebox(options = {}) {
    if (typeof options !== 'object') {
        warn('Facebox', 'options', options);
        options = {};
    }

    options.width = RESOLUTION_MIN;
    options.height = RESOLUTION_MIN;

    UI.call(this, options);

    this.mesh.shader = options.shader;

    this.controller = options.controller;
    this.mesh.changeUniforms({
        u_Mouse: new Vec2,
        u_Resolution: new Vec2(RESOLUTION_MIN, RESOLUTION_MIN)
    });

    this.body.position = new Vec3;

    this.initialize();
}

Facebox.prototype = Object.create(UI.prototype);
Facebox.prototype.constructor = Facebox;

Object.defineProperties(Facebox.prototype, {
    controller: {
        get: function() {
            return this.controller_;
        },
        set: function(val) {
            if (!(val instanceof Item)) {
                warn('Facebox#controller', 'val', val);
                val = undefined;
            }

            this.controller_ = val;
        }
    }
});

/**
 * Sends uniforms velocity and maxspeed to shader
 * to draw arrow. Velocity is normal vector that draws
 * on circle radius.
 */
Facebox.prototype.initialize = function() {
    var self = this;
    this.onupdate = function() {
        var controller = self.controller;
        if (controller && controller.rigidbody && controller.physic) {
            var maxspeed = controller.physic.maxspeed,
                velocity = controller.rigidbody.velocity;
            var normalized = amc('/', velocity, maxspeed);

            self.mesh.changeUniforms({
                u_Mouse: new Vec2(normalized)
            });
        }
    }
}

Facebox.shader = function() {
    return [
        `attribute vec3 a_Position;
        attribute vec2 a_UV;

        uniform mat4 u_MVMatrix;

        varying vec3 v_Position;

        void main(void) {
            v_Position = a_Position.xyz;

            vec4 position4 = u_MVMatrix * vec4(a_Position, 1.0);
            vec3 position3 = position4.xyz / position4.w;

            gl_Position = position4;
        }`,

        `precision lowp float;

        uniform vec2 u_Mouse;
        uniform vec2 u_Resolution;

        varying vec3 v_Position;

        const float R = 0.65;
        const float D = 0.05;
        const float sqwidth = 0.0055;
        const float attenuation = 0.003;
        const float minangle = 0.3490658503988659;

        float angle(vec2 v0, vec2 v1) {
            float scalar = v0.x * v1.x + v0.y * v1.y;
            float module = sqrt(pow(v0.x, 2.0) + pow(v0.y, 2.0)) * sqrt(pow(v1.x, 2.0) + pow(v1.y, 2.0));
            return acos(scalar / module);
        }

        vec4 pixel(vec2 position) {
            vec4 frag = vec4(0.0);

            vec2 dir = normalize(u_Mouse);

            vec2 normal = normalize(position);
            float an = angle(dir, normal);

            float sqan = angle(dir, vec2(1.0, 0.0));
            if (dir.y < 0.0) {
                sqan = -sqan;
            }
            float sqcos = cos(sqan);
            float sqsin = sin(sqan);
            mat2 Mrot = mat2(sqcos, -sqsin, sqsin, sqcos);

            vec2 avg = dir * R;
            vec2 pos = Mrot * vec2(position.x - avg.x, position.y - avg.y);
            float square = abs(pos.x) + abs(pos.y);

            float radius = sqrt(pow(position.x, 2.0) + pow(position.y, 2.0));
            if (radius > R) {
                if (square <= D) {
                    if (square >= D - sqwidth) {
                        frag = vec4(1.0);
                    }
                }
                else if (an < minangle) {
                    frag = vec4(1.0) * min(R / (radius - R) * attenuation, 1.0);
                }
            }

            float bright = min(sqrt(pow(u_Mouse.x, 2.0) + pow(u_Mouse.y, 2.0)), 1.0);

            return bright * frag;
        }

        void main() {
            vec4 O = pixel(v_Position.xy);

            gl_FragColor = O;
        }`
    ];
}
