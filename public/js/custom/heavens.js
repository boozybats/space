class Heaven extends Cube {
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

			var z = body.scale.z * 6;

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
			`#define MAX_LIGHTS 8

			struct Light {
				float type;
				float intensity;
				vec3  position;
				vec4  ambient;
				vec4  diffuse;
				vec4  specular;
			};

			struct Material {
				vec4 ambient;
				vec4 diffuse;
				vec4 specular;
				sampler2D ambientmap;
				sampler2D diffusemap;
				sampler2D specularmap;
				sampler2D normalmap;
			};

			attribute vec3 a_Position;
			attribute vec3 a_Normal;
			attribute vec3 a_Tangent;
			attribute vec3 a_Bitangent;
			attribute vec2 a_UV;

			uniform mat4 u_MVMatrix;
			uniform mat4 u_MVPMatrix;
			uniform mat3 u_MVNMatrix;
			uniform Light u_Lights[MAX_LIGHTS];
			uniform Material u_Material;

			varying vec4 v_Color;

			void main(void) {
				vec4 position4 = u_MVMatrix * vec4(a_Position, 1.0);
				gl_Position = u_MVPMatrix * position4;

				vec3 position3 = position4.xyz / position4.w;
				vec3 normal = normalize(u_MVNMatrix * a_Normal);

				vec4 color = vec4(0.0);

				for (int i = 0; i < MAX_LIGHTS; i++) {
					Light light = u_Lights[i];
					if (light.type != 2.0) {
						continue;
					}

					float dist = distance(light.position, position3);

					vec3 lightDir = normalize(light.position - position3);
					float cos = clamp(dot(normal, lightDir), 0.0, 1.0);
					color += u_Material.diffuse * light.diffuse * light.intensity * cos / pow(dist, 2.0);
				}

				v_Color = vec4(
					min(color.x, u_Material.diffuse.x),
					min(color.y, u_Material.diffuse.y),
					min(color.z, u_Material.diffuse.z),
					min(color.w, u_Material.diffuse.w)
				);
			}`,

			`precision mediump float;

			varying vec4 v_Color;

			void main(void) {
				gl_FragColor = v_Color;
			}`
		);

		return out;
	}
}
