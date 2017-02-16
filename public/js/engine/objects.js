class Icosahedron extends Item {
	constructor({
		name = 'icosahedron',
		body = new Body,
		mesh,
		collider,
		physic
	} = {}) {
		super({
			name,
			body,
			mesh,
			collider,
			physic,
		});

		var mesh = this.initializeMesh();

		this.mesh = new Mesh({
			attributes: {
				a_Position: mesh.vertices,
				a_Normal: mesh.normals
			},
			uniforms: {
				u_DiffuseColor: new Color(50, 50, 255, 1),
			},
			vertexIndices: mesh.indices,
			shader: Icosahedron.shader
		});
	}

	initializeMesh() {
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

				var y = 1 - (y0 + y1 * i);

				var vec = new Vec3(
					Math.cos(rad),
					y,
					Math.sin(rad)
				);
				var normal = vec.normalize();

				var dis = 1 - Math.sqrt(Math.pow(vec.x, 2) + Math.pow(vec.y, 2) + Math.pow(vec.z, 2));
				vec = Vec.sum(vec, normal.multi(dis));

				vertices.push(...vec.array);
				normals.push(...normal.array);
			}
		}

		// 4th level
		vertices.push(0, -1, 0);
		normals.push(0, -1, 0);

		var out =  {
			vertices,
			indices,
			normals
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

			varying float v_light;

			void main(void) {
				vec4 position4 = u_MVMatrix * vec4(a_Position, 1.0);
				vec3 position3 = position4.xyz / position4.w;

				vec3 lightDir = normalize(u_PointLights[0] - position3);
				vec3 normal = normalize(u_MVNMatrix * a_Normal);

				v_light = max(dot(normal, lightDir), 0.0);

				gl_Position = u_MVPMatrix * position4;
			}`,

			`precision mediump float;

			uniform vec4 u_DiffuseColor;

			varying float v_light;

			void main(void) {
				gl_FragColor = vec4(u_DiffuseColor.rgb * v_light, u_DiffuseColor.a);
			}`
		);

		return out;
	}
}

class Sphere extends Icosahedron {
	constructor({
		name = 'sphere',
		body = new Body,
		mesh,
		collider,
		physic,
		precision = 3
	}) {
		super({
			name,
			body,
			mesh,
			collider,
			physic,
		});

		var data = {
			vertices: this.mesh.attributes.a_Position,
			normals: this.mesh.attributes.a_Normal,
			indices: this.mesh.vertexIndices
		};

		for (var i = 0; i < precision; i++) {
			data = this.initializeSphereMesh({
				vertices: data.vertices,
				normals: data.normals,
				indices: data.indices
			});
		}

		this.mesh = new Mesh({
			attributes: {
				a_Position: data.vertices,
				a_Normal: data.normals
			},
			uniforms: {
				u_DiffuseColor: new Color(50, 255, 255, 1),
			},
			vertexIndices: data.indices,
			shader: Icosahedron.shader
		});
	}

	initializeSphereMesh({
		vertices,
		normals,
		indices
	} = {}) {
		var [nvertices, nnormals, nindices] = [[], [], []];
		nvertices.size = 3;
		nnormals.size = 3;

		for (var i = 0; i < vertices.length; i++) {
			nvertices.push(vertices[i]);
			nnormals.push(normals[i]);
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
			var ad = 1 - Math.sqrt(Math.pow(a.x, 2) + Math.pow(a.y, 2) + Math.pow(a.z, 2)),
				bd = 1 - Math.sqrt(Math.pow(b.x, 2) + Math.pow(b.y, 2) + Math.pow(b.z, 2)),
				cd = 1 - Math.sqrt(Math.pow(c.x, 2) + Math.pow(c.y, 2) + Math.pow(c.z, 2));

			// normalization to recovery radius
			var an = a.normalize(),
				bn = b.normalize(),
				cn = c.normalize();

			// make right point for radius "R = 1"
			a = Vec.sum(a, an.multi(ad));
			b = Vec.sum(b, bn.multi(bd));
			c = Vec.sum(c, cn.multi(cd));

			var length = nvertices.length / 3;
			nvertices.push(...a.array, ...b.array, ...c.array);
			nnormals.push(...an.array, ...bn.array, ...cn.array);

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
			indices: nindices
		};

		return out;
	}
}
