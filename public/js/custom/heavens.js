class Heaven extends Sphere {
	constructor({
		name = 'asteroid',
		body = new Body,
		physic = new Physic({
			matter: {
				Fe: 50 * Math.pow(10, 5)
			}
		}),
		mesh,
		collider
	} = {}) {
		super({
			name,
			body,
			physic,
			mesh,
			collider,
			precision: 1
		});
	}

	bindCamera(camera) {
		this.camera_ = camera;
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

	set mouseControl(val) {
		if (!val || val instanceof Cursor) {
			this.mouseControl_ = val;
		}
		else {
			console.warn('Heaven: mouseControl: error');
		}
	}

	onupdate() {
		if (this.mouseControl) {
			var mouse = this.mouseControl;

			var vec = mouse.axis;
			var maxspeed = this.physic.maxspeed;

			var dir = Vec.sum(this.physic.velocity, vec.multi(maxspeed));

			var length = dir.L;
			if (length > maxspeed) {
				dir = dir.normalize().multi(maxspeed);
			}

			this.physic.velocity = dir;

			mouse.onupdate();
		}

		if (this.camera_) {
			var cam = this.camera_.body;
			var body = this.body;

			var z = body.scale.z * -5;

			cam.position = new Vec3(body.position.xy, z);
		}
	}

	static get shader() {
		var out = new Shader(
			`#define MAX_POINTLIGHTS 16

			attribute vec3 a_Position;
			attribute vec3 a_Normal;
			attribute vec3 a_Tangent;
			attribute vec3 a_Bitangent;
			attribute vec2 a_UI;

			uniform mat4 u_MVMatrix;
			uniform mat4 u_MVPMatrix;
			uniform mat3 u_MVNMatrix;
			uniform vec3 u_PointLights[MAX_POINTLIGHTS];

			varying vec3 v_LightVecTang;
			varying vec2 v_UI;

			void main(void) {
				vec4 position4 = u_MVMatrix * vec4(a_Position, 1.0);
				vec3 position3 = position4.xyz / position4.w;
				v_UI = a_UI;

				vec3 n = normalize(u_MVNMatrix * a_Normal);
				vec3 t = normalize(u_MVNMatrix * a_Tangent);
				vec3 b = cross(n, t);

				mat3 tbn = mat3(t, b, n);

				vec3 lightVec = normalize(u_PointLights[0] - position3);
				v_LightVecTang = normalize(tbn * lightVec);

				gl_Position = u_MVPMatrix * position4;
			}`,

			`precision mediump float;

			uniform vec4 u_DiffuseColor;
			uniform sampler2D u_NormalMap; 

			varying vec3 v_LightVecTang;
			varying vec2 v_UI;

			void main(void) {
				vec3 normal = normalize(texture2D(u_NormalMap, v_UI).xyz * 2.0 - 1.0);
				float a = dot(normal, v_LightVecTang);

				gl_FragColor = vec4(1.0);
			}`
		);

		return out;
	}
}
