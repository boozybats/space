class Icosahedron extends Item {
	constructor({
		id,
		name = 'icosahedron',
		body = new Body,
		collider,
		physic
	} = {}) {
		super({
			name,
			id,
			body,
			collider,
			physic,
		});

		var mesh = icosahedronMesh;

		this.mesh = new Mesh({
			attributes: {
				a_Position: mesh.vertices,
				a_Normal: mesh.normals,
				a_UI: mesh.uis
			},
			vertexIndices: mesh.indices,
			shader: Icosahedron.shader
		});
	}

	static mesh() {
		// 20 sides, 30 edges, 12 vertices

		var indices = [0, 1, 2, 0, 2, 3, 0, 3, 4, 0, 4, 5, 0, 5, 1,
			1, 6, 2, 2, 7, 3, 3, 8, 4, 4, 9, 5, 5, 10, 1,
			6, 2, 7, 7, 3, 8, 8, 4, 9, 9, 5, 10, 10, 1, 6,
			11, 10, 9, 11, 9, 8, 11, 8, 7, 11, 7, 6, 11, 6, 10];
			
		// 1st level
		var vertices = [0, 1, 0];
		vertices.size = 3;

		var normals = [0, 1, 0];
		normals.size = 3;

		// uis
		var uis = [0.5, 1];
		uis.size = 2;

		const n = 8;  //count of peaces
		var arclen = 2 * Math.pi,
			peawid = arclen / n;
		// \uis

		var y0 = 3 / (3 * 2),
			y1 = 6 / (3 * 2);
		// increase number if 5 vertices
		var degint = 360 / 5;
		var degoffset = degint / 2;

		// 4 levels of vertices (1 vertex, 5 vertices, 5 vertices, 1 vertex)
		// 2nd and 3rd levels
		for (var i = 0; i < 2; i++) {
			for (var j = 0; j < 5; j++) {
				// 2 levels myst be on different x-positions on half of length
				if (i == 1) {
					var rad = Math.DTR(degint * j + degoffset);
				}
				else if (i === 0) {
					var rad = Math.DTR(degint * j);
				}

				var x = Math.cos(rad);
				var y = 1 - (y0 + y1 * i);
				var z = Math.sin(rad);

				var vec = new Vec3(
					x,
					y,
					z
				);
				var normal = vec.normalize();

				var ui = [
					Math.asin(x) / Math.PI + 0.5, // 0.5 + Math.atan2(z, x) / (2 * Math.PI),
					Math.asin(y) / Math.PI + 0.5 // 0.5 + Math.asin(y) / Math.PI
				];

				var dis = 1 - Math.sqrt(Math.pow(vec.x, 2) + Math.pow(vec.y, 2) + Math.pow(vec.z, 2));
				vec = Vec.sum(vec, normal.multi(dis));

				vertices.push(...vec.array);
				normals.push(...normal.array);
				uis.push(...ui);
			}
		}

		// 4th level
		vertices.push(0, -1, 0);
		normals.push(0, -1, 0);
		uis.push(0.5, 0);

		var out =  {
			vertices,
			indices,
			normals,
			uis
		};

		return out;
	}

	static get shader() {
		var out = new Shader(
			`#define MAX_POINTLIGHTS 16

			attribute vec3 a_Position;
			attribute vec3 a_Normal;

			uniform mat4 u_MVMatrix;
			uniform mat4 u_MVPMatrix;
			uniform mat3 u_MVNMatrix;
			uniform vec3 u_PointLights[MAX_POINTLIGHTS];

			varying float v_Light;

			void main(void) {
				vec4 position4 = u_MVMatrix * vec4(a_Position, 1.0);
				vec3 position3 = position4.xyz / position4.w;

				float light = 0.0;
				for (int i = 0; i < 1; i++) {
					vec3 lightDir = normalize(u_PointLights[0] - position3);
					vec3 normal = normalize(u_MVNMatrix * a_Normal);

					light += max(dot(normal, lightDir), 0.0);
				}
				v_Light = min(light, 1.0);

				gl_Position = u_MVPMatrix * position4;
			}`,

			`precision mediump float;

			uniform vec4 u_DiffuseColor;

			varying float v_Light;

			void main(void) {
				gl_FragColor = vec4(u_DiffuseColor.rgb * v_Light, u_DiffuseColor.a);
			}`
		);

		return out;
	}
}

class Sphere extends Item {
	constructor({
		id,
		name = 'sphere',
		body = new Body,
		collider,
		physic,
		precision = 3
	}) {
		super({
			name,
			id,
			body,
			collider,
			physic
		});

		var mesh = sphereMesh[precision];

		this.mesh = new Mesh({
			attributes: {
				a_Position: mesh.vertices,
				a_Normal: mesh.normals,
				a_UI: mesh.uis
			},
			vertexIndices: mesh.indices,
			shader: Icosahedron.shader
		});
	}

	static mesh({
		vertices,
		normals,
		uis,
		indices
	} = {}) {
		var [nvertices, nnormals, nuis, nindices] = [[], [], [], []];
		nvertices.size = 3;
		nnormals.size = 3;
		nuis.size = 2;

		for (var i = 0; i < vertices.length; i++) {
			nvertices.push(vertices[i]);
			nnormals.push(normals[i]);
		}
		for (var i = 0; i < uis.length; i++) {
			nuis.push(uis[i]);
		}
		for (var i = 0; i < indices.length; i++) {
			nindices.push(indices[i]);
		}

		// break all triangles on 4 triangles
		for (var i = 0; i < indices.length; i += 3) {
			var [i0, i1, i2] = [indices[i], indices[i + 1], indices[i + 2]];

			var v0 = new Vec3(
				vertices[i0 * 3],
				vertices[i0 * 3 + 1],
				vertices[i0 * 3 + 2]
			);
			var v1 = new Vec3(
				vertices[i1 * 3],
				vertices[i1 * 3 + 1],
				vertices[i1 * 3 + 2]
			);
			var v2 = new Vec3(
				vertices[i2 * 3],
				vertices[i2 * 3 + 1],
				vertices[i2 * 3 + 2]
			);

			// define middlepoints of triangle's edges
			var a = Vec.avg(v0, v1),
				b = Vec.avg(v1, v2),
				c = Vec.avg(v2, v0);

			// how much distance need to full radius (R = 1)
			var ad = 1 - a.length,
				bd = 1 - b.length,
				cd = 1 - c.length;

			// normalization to recovery radius
			var an = a.normalize(),
				bn = b.normalize(),
				cn = c.normalize();

			// make right point for radius "R = 1"
			a = amc('+', a, an.multi(ad));
			b = amc('+', b, bn.multi(bd));
			c = amc('+', c, cn.multi(cd));

			var ui = [];
			for (var j = 0; j < 3; j++) {
				var x, y, z;

				switch (j) {
					case 0:
					x = a.x,
					y = a.y,
					z = a.z;
					break;

					case 1:
					x = b.x,
					y = b.y,
					z = b.z;
					break;

					case 2:
					x = c.x,
					y = c.y,
					z = c.z;
					break;
				}

				var arr = [
					Math.asin(x) / Math.PI + 0.5, // 0.5 + Math.atan2(z, x) / (2 * Math.PI),
					Math.asin(y) / Math.PI + 0.5 // 0.5 + Math.asin(y) / Math.PI
				];
				ui.push(...arr);
			}

			var length = nvertices.length / 3;
			nvertices.push(...a.array, ...b.array, ...c.array);
			nnormals.push(...an.array, ...bn.array, ...cn.array);
			nuis.push(...ui);

			a = length,
			b = length + 1,
			c = length + 2;
			// connection with all triangles
			nindices.splice(i * 4, 3,
				i0, a, c,
				a, i1, b,
				c, b, i2,
				a, b, c
			);
		}

		var out = {
			vertices: nvertices,
			normals: nnormals,
			indices: nindices,
			uis: nuis
		};

		return out;
	}
}

var icosahedronMesh,
	sphereMesh;

class Cube extends Item {
	constructor({
		name = 'cube',
		body = new Body,
		collider,
		physic
	} = {}) {
		super({
			name,
			body,
			collider,
			physic,
		});

		var indices = [
			0, 1, 2, 2, 3, 0,
			4, 5, 6, 6, 7, 4,
			8, 9, 10, 10, 11, 8,
			12, 13, 14, 14, 15, 12,
			16, 17, 18, 18, 19, 16,
			20, 21, 22, 22, 23, 20
		];

		var vertices = [
			-1, -1, 1, -1, 1, 1,
			1, 1, 1, 1, -1, 1,
			-1, -1, -1, -1, 1, -1,
			1, 1, -1, 1, -1, -1,
			-1, -1, 1, -1, 1, 1,
			-1, 1, -1, -1, -1, -1,
			1, -1, 1, 1, 1, 1,
			1, 1, -1, 1, -1, -1,
			-1, -1, 1, -1, -1, -1,
			1, -1, -1, 1, -1, 1,
			-1, 1, 1, -1, 1, -1,
			1, 1, -1, 1, 1, 1
		];
		vertices.size = 3;

		var uvs = [
			0.0, 0.0, 0.0, 1.0,
			1.0, 1.0, 1.0, 0.0,
			0.0, 0.0, 0.0, 1.0,
			1.0, 1.0, 1.0, 0.0,
			0.0, 0.0, 0.0, 1.0,
			1.0, 1.0, 1.0, 0.0,
			0.0, 0.0, 0.0, 1.0,
			1.0, 1.0, 1.0, 0.0,
			0.0, 0.0, 0.0, 1.0,
			1.0, 1.0, 1.0, 0.0,
			0.0, 0.0, 0.0, 1.0,
			1.0, 1.0, 1.0, 0.0
		];
		uvs.size = 2;

		var normals = [
			0.0, 0.0, 1.0, 0.0, 0.0, 1.0,
			0.0, 0.0, 1.0, 0.0, 0.0, 1.0,
			0.0, 0.0, -1.0, 0.0, 0.0, -1.0,
			0.0, 0.0, -1.0, 0.0, 0.0, -1.0,
			-1.0, 0.0, 0.0, -1.0, 0.0, 0.0,
			-1.0, 0.0, 0.0, -1.0, 0.0, 0.0,
			1.0, 0.0, 0.0, 1.0, 0.0, 0.0,
			1.0, 0.0, 0.0, 1.0, 0.0, 0.0,
			0.0, -1.0, 0.0, 0.0, -1.0, 0.0,
			0.0, -1.0, 0.0, 0.0, -1.0, 0.0,
			0.0, 1.0, 0.0, 0.0, 1.0, 0.0,
			0.0, 1.0, 0.0, 0.0, 1.0, 0.0
		];
		normals.size = 3;

		this.mesh = new Mesh({
			attributes: {
				a_Position: vertices,
				a_Normal: normals,
				a_UV: uvs
			},
			uniforms: {
				u_DiffuseColor: new Color(50, 50, 255, 1),
			},
			vertexIndices: indices,
			shader: Cube.shader
		});
	}

	static get shader() {
		var out = new Shader(
			`#define MAX_POINTLIGHTS 16

			attribute vec3 a_Position;
			attribute vec3 a_Normal;

			uniform mat4 u_MVMatrix;
			uniform mat4 u_MVPMatrix;
			uniform mat3 u_MVNMatrix;
			uniform vec3 u_PointLights[MAX_POINTLIGHTS];

			varying float v_Light;

			void main(void) {
				vec4 position4 = u_MVMatrix * vec4(a_Position, 1.0);
				vec3 position3 = position4.xyz / position4.w;

				float light = 0.0;
				for (int i = 0; i < 1; i++) {
					vec3 lightDir = normalize(u_PointLights[0] - position3);
					vec3 normal = normalize(u_MVNMatrix * a_Normal);

					light += max(dot(normal, lightDir), 0.0);
				}
				v_Light = min(light, 1.0);

				gl_Position = u_MVPMatrix * position4;
			}`,

			`precision mediump float;

			uniform vec4 u_DiffuseColor;

			varying float v_Light;

			void main(void) {
				gl_FragColor = vec4(u_DiffuseColor.rgb * v_Light, u_DiffuseColor.a);
			}`
		);

		return out;
	}
}

;(function() {
	icosahedronMesh = Icosahedron.mesh();
	sphereMesh = [];
	sphereMesh[0] = icosahedronMesh;
	for (var i = 1; i < 5; i++) {
		sphereMesh[i] = Sphere.mesh(sphereMesh[i - 1]);
	}
})();
