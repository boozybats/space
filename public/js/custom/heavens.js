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
			precision: 3
		});

		this.me = me;
		this.mouseControl = mouseControl;

		var normalmap = new Image();
		normalmap.src = 'images/n_heaven.jpg';

		var diffusemap = new Image();
		diffusemap.src = 'images/diffuse.jpg';

		this.mesh.shader = Heaven.shader;
		this.mesh.material = new Material({
			normalmap,
			diffusemap
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
		);

		return out;
	}
}
