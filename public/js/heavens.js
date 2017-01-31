class Heaven extends Item {
	constructor({
		name = 'asteroid',
		body = new Body,
		physic = new Physic({
			matter: {
				Fe: 50 * Math.pow(10, 5)
			}
		}),
		shader
	} = {}) {
		super({
			name: name,
			body: body,
			physic: physic
		});

		this.vertexCount_ = 360;

		this.initializeMesh(shader);
	}

	get core() {
		var aggregation = this.physic.Pressure(CORE_MIN_RADIUS);

		var out = {
			aggregation: 0
		};

		return out;
	}

	initializeMesh(shader) {
		var arr = this.verticesAndVI();
		var vertices = arr[0];
		var VI = arr[1];

		var a_Normal = this.normals();
		var a_Tangent = this.tangents();
		var a_UI = this.UIs(vertices);

		var normalmap = new Image();
		normalmap.src = 'images/heaven_normalmap.jpg';

		this.mesh = new Mesh({
			attributes: {
				a_Position: vertices,
				a_Normal,
				a_Tangent,
				a_UI
			},
			uniforms: {
				u_DiffuseColor: this.physic.color.normal.Vec,
				u_NormalMap: normalmap
			},
			vertexIndices: VI,
			shader: shader
		});
	}

	normals() {
		var out = [];
		out.size = 3;

		for (var i = 0; i < this.vertexCount_ + 1; i++) {
			var normal = [0, 0, -1];
			out.push(...normal);
		}

		return out;
	}

	tangents() {
		var out = [];
		out.size = 3;

		var vec = new Vec3(1, 0, 0);
		var normal = vec.normalize();

		for (var i = 0; i < this.vertexCount_ + 1; i++) {
			out.push(normal.x, normal.y, normal.z);
		}

		return out;
	}

	UIs(vertices) {
		//only if vertices.size == 3
		var out = [];
		out.size = 2;

		var min = {};
		var max = {};

		for (var i = 0; i < vertices.length; i += 3) {
			var x = vertices[i],
				y = vertices[i + 1];

			if (typeof min.x === 'undefined') {
				min.x = x;
				min.y = y;
				max.x = x;
				max.y = y;
			}

			min.x = Math.min(min.x, x);
			min.y = Math.min(min.y, y);
			max.x = Math.max(max.x, x);
			max.y = Math.max(max.y, y);
		}

		var distx = max.x - min.x,
			disty = max.y - min.y;

		for (var i = 0; i < vertices.length; i += 3) {
			var x = (vertices[i] - min.x) / distx,
				y = (vertices[i + 1] - min.y) / disty;

			out.push(x, y);
		}

		return out;
	}

	vertex(index, radius = this.physic.diameter / 2) {
		var out;

		var radius = radius;
		var interval = 360 / this.vertexCount_;
		var deg = index * interval;

		var rad = Math.DTR(deg);
		var x = Math.cos(rad) * radius,
			y = Math.sin(rad) * radius;

		out = [x, y, 0];

		return out;
	}

	verticesAndVI() {
		var vertices = [0, 0, 0];
		vertices.size = 3;
		var VI = [];
		var radius = this.physic.diameter / 2;

		for (var i = 0; i < this.vertexCount_; i++) {
			var index = i + 1;
			if (i == 0) {
				VI.push(index, 0);
			}
			else {
				VI.push(index, index, 0);
			}
			vertices.push(...this.vertex(i, radius));
		}
		VI.push(1);

		return [vertices, VI];
	}

	static get shader() {
		var out = new Shader(
			`precision mediump float;

			attribute vec3 a_Position;
			attribute vec3 a_Normal;
			attribute vec3 a_Tangent;
			attribute vec2 a_UI;

			const int MAX_POINTLIGHTS = 16;

			uniform mat4 u_MVMatrix;
			uniform mat4 u_MVPMatrix;
			uniform mat3 u_MVNMatrix;
			uniform vec3 u_PointLights[MAX_POINTLIGHTS];

			varying vec3 lightVec;
			varying vec3 halfVec;
			varying vec2 v_UI;

			void main(void) {
				v_UI = a_UI;

				vec3 n = normalize(u_MVNMatrix * a_Normal);
				vec3 t = normalize(u_MVNMatrix * a_Tangent);
				vec3 b = cross(n, t);

				vec4 position4 = u_MVMatrix * vec4(a_Position, 1.0);
				vec3 position3 = position4.xyz / position4.w;
				vec3 lightDir = normalize(u_PointLights[0] - position3);

				vec3 vec;
				vec.x = dot(lightDir, t);
				vec.y = dot(lightDir, b);
				vec.z = dot(lightDir, n);
				lightVec = normalize(vec);

				vec3 nposition = normalize(position3);
				vec3 halfVector = normalize(nposition + lightDir);
				vec.x = dot(halfVector, t);
				vec.y = dot(halfVector, b);
				vec.z = dot(halfVector, n);
				halfVec = vec;

				gl_Position = u_MVPMatrix * position4;
			}`,

			`precision mediump float;

			uniform vec4 u_DiffuseColor;
			uniform sampler2D u_NormalMap;

			varying vec3 lightVec;
			varying vec3 halfVec;
			varying vec2 v_UI;

			void main(void) {
				vec3 normal = normalize(texture2D(u_NormalMap, v_UI).rgb * 2.0 - 1.0);

				float lamberFactor = max(dot(lightVec, normal), 0.0);
				vec4 diffuseMaterial;
				vec4 diffuseLight;

				vec4 specularMaterial;
				vec4 speculerLight;
				float shininess;

				vec4 ambientLight = vec4(0.0, 0.0, 0.0, 1.0);
				vec4 combination = vec4(0.0);

				if (lamberFactor > 0.0) {
					diffuseMaterial = texture2D(u_NormalMap, v_UI);
					diffuseLight = u_DiffuseColor;

					specularMaterial = vec4(1.0);
					speculerLight = vec4(1.0);
					shininess = pow(max(dot(halfVec, normal), 0.0), 2.0);

					combination = (diffuseMaterial * diffuseLight * lamberFactor) + (specularMaterial * speculerLight * shininess);
				}

				vec4 color = combination + ambientLight;
				gl_FragColor = color;
			}`
		);

		return out;
	}
}
