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
			precision: 2
		});

		this.me = me;
		this.mouseControl = mouseControl;

		var normalmap = new Image();
		normalmap.src = 'images/n_heaven.jpg';

		this.mesh.shader = Heaven.shader;
		this.mesh.material = new Material({
			normalmap
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
		if (false && sizeint) {
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

			var z = body.scale.z * -6;

			cam.position = new Vec3(body.position.xy, z);
		}

		if (this.me) {
			var body = this.body;
			var position = this.private.position;
			var scale = this.private.scale;
			if (!position || !amc('=', position, body.position) || !amc('=', scale, body.scale)) {
				this.private.position = body.position;
				this.private.scale = body.scale;

				/*server.mydata({
					body: body
				});*/
			}
		}
	}

	static get shader() {
		var out = new ShaderTemplate(
			`attribute vec3 a_Position;
			attribute vec3 a_Normal;
			attribute vec3 a_Tangent;
			attribute vec3 a_Bitangent;
			attribute vec2 a_UI;

			uniform mat4 u_MVMatrix;
			uniform mat4 u_MVPMatrix;
			uniform mat3 u_MVNMatrix;

			void main(void) {
				vec4 position4 = u_MVMatrix * vec4(a_Position, 1.0);
				vec3 position3 = position4.xyz / position4.w;

				gl_Position = u_MVPMatrix * position4;
			}`,

			`precision mediump float;

			#define MAX_LIGHTS 32

			struct Light {
				float type;
				float intensity;
				vec3  position;
				vec3  rotation;
				vec4  ambient;
				vec4  diffuse;
				vec4  specular;
			};

			struct Material {
				sampler2D ambient;
				sampler2D diffuse;
				sampler2D specular;
				sampler2D normalmap;
			};

			void main(void) {
				gl_FragColor = vec4(1.0);
			}`
		);

		return out;
	}
}
