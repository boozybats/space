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
		collider
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

		this.mesh.shader = Heaven.shader;

		var displacement = new Image();
		displacement.src = 'images/d_heaven.jpg';
		var normal = new Image();
		normal.src = 'images/n_heaven.jpg';

		this.changeUniforms({
			u_Maps: [displacement, normal]
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

	me() {
		this.onupdate = function() {
			var _private = this.private;
			var _public  = this.public;

			var oldD = _private.D || 0;
			var curD = this.physic.diameter;
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

			if (this.mouseControl) {
				var mouse = this.mouseControl;

				var vec = mouse.position;
				var maxspeed = this.physic.maxspeed;

				var dir = amc('*', vec, maxspeed);

				var length = dir.length;
				if (length > maxspeed) {
					dir = amc('*', vec.normalize(), maxspeed);
				}

				_public.velocity = this.physic.velocity = dir;
				_public.maxspeed = maxspeed;
			}

			if (this.camera_) {
				var cam = this.camera_.body;
				var body = this.body;

				var z = body.scale.z * -12;

				cam.position = new Vec3(body.position.xy, z);
			}

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

	onupdate() {
		var _private = this.private;
		var _public  = this.public;

		var oldD = _private.D || 0;
		var curD = this.physic.diameter;
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
			uniform sampler2D u_Maps[2];

			varying vec3 v_LightVecTang;
			varying vec2 v_UI;

			const float DISHEI = 1.0;

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

				float displace = texture2D(u_Maps[0], a_UI).x * DISHEI;

				gl_Position = u_MVPMatrix * (position4);
			}`,

			`precision mediump float;

			uniform vec4 u_DiffuseColor;
			uniform sampler2D u_Maps[2];

			varying vec3 v_LightVecTang;
			varying vec2 v_UI;

			void main(void) {
				vec3 normal = normalize(texture2D(u_Maps[1], v_UI).xyz * 2.0 - 1.0);
				float a = dot(normal, v_LightVecTang);

				gl_FragColor = vec4(normal, 1.0);
			}`
		);

		return out;
	}
}
