class Heaven extends Sphere {
	constructor({
		id,
		name = 'asteroid',
		body = new Body,
		physic,
		player = false,
		mesh,
		collider,
		mouseControl
	} = {}) {
		super({
			name: name,
			id: id,
			body: body,
			physic: physic,
			mesh: mesh,
			collider: collider,
			precision: 3
		});

		// Defines item as player's item
		this.player = player;

		// Binds object movements depends on mouse axis
		this.mouseControl = mouseControl;

		// Add maps to shader
		var normalmap = new Image();
		normalmap.src = 'images/n_heaven.jpg';

		var diffusemap = new Image();
		diffusemap.src = 'images/d_heaven.jpg';

		// Set heaven's shader, not parent's
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
		if (!(camera instanceof Camera)) {
			console.warn(`Heaven: bindCamera: must be a Camera, type: ${typeof camera}, value: ${camera}, item id: ${this.id}`);
			return;
		}

		this.camera = camera;
	}

	get mouseControl() {
		return this.mouseControl_;
	}
	set mouseControl(val) {
		if (val && !(val instanceof Cursor)) {
			console.warn(`Heaven: mouseControl: must be a Cursor, type: ${typeof val}, value: ${val}, item id: ${this.id}`);
			return;
		}

		this.mouseControl_ = val;
	}

	get player() {
		return this.player_;
	}
	set player(val) {
		if (typeof val !== 'boolean') {
			console.warn(`Heaven: player: must be a boolean, type: ${typeof val}, value: ${val}, item id: ${this.id}`);
			return;
		}

		this.player_ = val;
	}

	oninstance() {
	}

	onupdate() {
		var _private = this.private;
		var _public  = this.public;

		if (this.mouseControl) {
			var mouse = this.mouseControl;

			var vec = mouse.position.xyz;
			var maxspeed = this.physic.maxspeed;

			var dir = amc('*', vec, maxspeed);

			var length = dir.length();
			if (length > maxspeed) {
				dir = amc('*', vec.normalize(), maxspeed);
			}

			_public.velocity = dir;
			_public.maxspeed = maxspeed;
		}

		if (this.camera) {
			var cam = this.camera.body;
			var body = this.body;

			var z = body.scale.z * -6;

			cam.position = new Vec3(body.position.xy, z);
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

	toJSON() {
		var out = {};

		if (this.body) {
			out.body = this.body.toJSON();
		}

		return out;
	}

	uptodate(data) {
		if (typeof data !== 'object') {
			return;
		}

		if (typeof data.body === 'object') {
			var pos = data.body.position,
				rot = data.body.rotation,
				sca = data.body.scale;

			if (typeof pos !== 'object' ||
				typeof rot !== 'object' ||
				typeof sca !== 'object') {
				console.warn('Heaven: uptodate: "body" bad request from server');
				return;
			}

			if (!this.body) {
				this.body = new Body;
			}

			this.body.position = new Vec3(pos[0], pos[1], pos[2]);
			this.body.rotation = new Quaternion(rot[0], rot[1], rot[2], rot[3]);
			this.body.scale = new Vec3(sca[0], sca[1], sca[2]);
		}

		if (typeof data.physic === 'object') {
			var matter = data.physic.matter;

			if (typeof matter !== 'object') {
				console.warn('Heaven: uptodate: "physic" bad request from server');
				return;
			}

			if (!this.physic) {
				this.physic = new Physic({
					matter: new Matter(matter)
				});
			}
		}
	}
}
