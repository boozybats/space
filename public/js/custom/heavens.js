/**
 * Heaven-item staned by sphere mesh, unique
 * shader for heaven objects
 *
 * @constructor
 * @this {Heaven}
 * @param {number} id
 * @param {string} name
 * @param {Body} body
 * @param {Physic} phsyic
 * @param {Mesh} mesh
 * @param {Collider} collider
 * @param {bool} me Is it player object
 * @param {Cursor} this.mouseControl Cursor binded to object
 *  for controll this direction
 */

class Heaven extends Sphere {
	constructor({
		id,
		name = 'asteroid',
		body = new Body,
		physic = new Physic({
			matter: {
				Fe: 50 * Math.pow(10, 5)
			}
		}),
		mesh,
		collider,
		me = false,
		mouseControl
	} = {}) {
		super({
			name,
			id,
			body,
			physic,
			mesh,
			collider,
			precision: 4
		});

		this.me = me;
		this.mouseControl = mouseControl;

		this.mesh.shader = Heaven.shader;

		var displacement = new Image();
		displacement.src = 'images/d_heaven.jpg';
		var normal = new Image();
		normal.src = 'images/n_heaven.jpg';

		this.changeUniforms({
			u_Maps: [displacement, normal]
		});
	}

	/**
	 * Binds camera to object, so it's follows object
	 * @param  {Camera} camera
	 */
	bindCamera(camera) {
		/** @private */ this.camera = camera;
	}

	get core() {
		var aggregation = this.physic.Pressure(CORE_MIN_RADIUS);

		var out = {
			aggregation: 0
		};

		return out;
	}

	get mouseControl() {
		return this.mouseControl_;
	}
	/**
	 * Sets velocity to object by mouse position
	 * @param  {Cursor} val
	 */
	set mouseControl(val) {
		if (val && !(val instanceof Cursor)) {
			throw new Error('Heaven: mouseControl: must be a Cursor');
		}

		this.mouseControl_ = val;
	}

	get me() {
		return this.me_;
	}
	set me(val) {
		if (typeof val !== 'boolean') {
			throw new Error('Heaven: me: must be a bool');
		}

		this.me_ = true;
	}

	oninstance() {
		var _private = this.private;
		var _public  = this.public;

		_public.velocity = new Vec2;
		_public.maxspeed = 0;
	}

	onupdate() {
		var _private = this.private;
		var _public  = this.public;

		var oldD = _private.D || 0,
			curD = this.physic.diameter;
		if (oldD != curD) {
			_private.D = curD;
			_private.sizeint = (curD - oldD) / 20;
		}

		var sizeint = _private.sizeint;
		if (sizeint) {
			var body = this.body;
			var scale = amc('+', this.body.scale, sizeint);
			body.scale = scale;

			if (sizeint > 0) {
				if (body.scale.x >= curD || body.scale.y >= curD || body.scale.z >= curD) {
					_private.sizeint = 0;
				}
			}
			else {
				if (body.scale.x <= curD || body.scale.y <= curD || body.scale.z <= curD) {
					_private.sizeint = 0;
				}
			}
		}

		var oldcol = _private.color,
			curcol = this.physic.color;
		if (oldcol !== curcol) {
			_private.color = curcol;
			this.changeUniforms({
				u_DiffuseColor: curcol
			});
		}

		if (this.mouseControl) {
			var mouse = this.mouseControl;

			var vec = mouse.position.xyz;
			var maxspeed = this.physic.maxspeed;

			var dir = amc('*', vec, maxspeed);

			var length = dir.length();
			if (length > maxspeed) {
				dir = amc('*', vec.normalize(), maxspeed);
			}

			_public.velocity = this.physic.velocity = dir;
			_public.maxspeed = maxspeed;
		}

		if (this.camera) {
			var cam = this.camera.body;
			var body = this.body;

			var z = body.scale.z * -12;

			cam.position = new Vec3(body.position.xy, z);
		}

		if (this.me) {
			var body = this.body;
			var position = this.private.position;
			var scale = this.private.scale;
			if (!position || !amc('=', position, body.position) || !amc('=', scale, body.scale)) {
				this.private.position = body.position;
				this.private.scale = body.scale;

				server.mydata({
					body: body
				});
			}
		}
	}

	static get shader() {
		var out = new ShaderTemplate(
			`#define MAX_LIGHTS 32

			struct Light {
				int    type;
				float  intensity;
				vec3   position;
				vec3   rotation;
			};

			attribute vec3 a_Position;
			attribute vec3 a_Normal;
			attribute vec3 a_Tangent;
			attribute vec3 a_Bitangent;
			attribute vec2 a_UI;

			uniform mat4 u_MVMatrix;
			uniform mat4 u_MVPMatrix;
			uniform mat3 u_MVNMatrix;
			uniform Light u_Lights[MAX_LIGHTS];
			uniform sampler2D u_Maps[2];

			varying vec3 v_lightDir;
			varying vec3 v_viewDir;
			varying vec2 v_UI;

			void main(void) {
				v_UI = a_UI;

				vec4 position4 = u_MVMatrix * vec4(a_Position, 1.0);
				vec3 position3 = position4.xyz / position4.w;

				vec3 n = normalize(u_MVNMatrix * a_Normal);
				vec3 t = normalize(u_MVNMatrix * a_Tangent);
				vec3 b = normalize(u_MVNMatrix * a_Bitangent);

				mat3 tbn = mat3(t, b, n);

				v_lightDir = tbn * (u_Lights[0].position - position3);
				v_viewDir = tbn * -position3;

				gl_Position = u_MVPMatrix * position4;
			}`,

			`precision mediump float;

			uniform vec4 u_DiffuseColor;
			uniform sampler2D u_Maps[2];

			varying vec3 v_lightDir;
			varying vec3 v_viewDir;
			varying vec2 v_UI;

			const vec3 intensity = vec3(0.0);

			vec3 phong(vec3 bumpDir, vec3 lightDir, vec3 viewDir, vec3 diffuseColor) {
			    vec3 reflectDir = reflect(-lightDir, bumpDir);

			    vec3 Ambient = vec3(0.0);
			    vec3 Diffuse = vec3(1.0) * u_DiffuseColor.rgb * max(dot(lightDir, bumpDir), 0.0) * diffuseColor;
			    vec3 Specular = vec3(1.0) * pow(max(dot(reflectDir, viewDir), 0.0), 0.8);

			    return (Ambient + Diffuse + Specular);
			}

			void main(void) {
				vec3 normal = normalize(texture2D(u_Maps[0], v_UI).xyz * 2.0 - 1.0);
				
				vec3 light = phong(-normal, normalize(v_lightDir), normalize(v_viewDir), u_DiffuseColor.rgb);

				gl_FragColor = vec4(light, 1.0);
			}`
		);

		return out;
	}
}
