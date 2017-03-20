/**
 * Creates item with icosahedron's mesh.
 * @this {Icosahedron}
 * @param {Object} options
 * @param {Number} options.id
 * @param {String} options.name
 * @param {Body} options.body
 * @param {Collider} options.collider
 * @param {Physic} options.physic
 * @class
 * @extends Item
 */

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
				a_UV: mesh.uvs,
				a_Tangent: mesh.tangents,
				a_Bitangent: mesh.bitangents
			},
			vertexIndices: mesh.indices,
			shader: Icosahedron.shader
		});
	}

	/**
	 * Creates icosahedron in sphere with R = 1.
	 * @return {Object}
	 * @method
	 * @static
	 * @example
	 * var mesh = Icosachedron.mesh();
	 * mesh;  // {vertices, indices, normals, uvs, tangents, bitangents}
	 */
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

		var uvs = [0.5, 1];
		uvs.size = 2;

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

				var uv = [
					Math.asin(x) / Math.PI + 0.5, // 0.5 + Math.atan2(z, x) / (2 * Math.PI),
					Math.asin(y) / Math.PI + 0.5 // 0.5 + Math.asin(y) / Math.PI
				];

				var dis = 1 - Math.sqrt(Math.pow(vec.x, 2) + Math.pow(vec.y, 2) + Math.pow(vec.z, 2));
				vec = Vec.sum(vec, normal.multi(dis));

				vertices.push(...vec.array());
				normals.push(...normal.array());
				uvs.push(...uv);
			}
		}

		// 4th level
		vertices.push(0, -1, 0);
		normals.push(0, -1, 0);
		uvs.push(0.5, 0);

		var out = {
			vertices,
			indices,
			normals,
			uvs
		};

		var tbn = TBN(out);

		var tg = tbn.tangents;
		tg.size = 3;

		var btg = tbn.bitangents;
		btg.size = 3;

		out.tangents = tg;
		out.bitangents = btg;

		return out;
	}

	/**
	 * Usual shader with vertex shadow.
	 * @return {ShaderTemplate}
	 * @method
	 * @static
	 */
	static get shader() {
		var out = new ShaderTemplate(
			`attribute vec3 a_Position;

			uniform mat4 u_MVMatrix;
			uniform mat4 u_MVPMatrix;

			varying float v_Light;

			void main(void) {
				vec4 position4 = u_MVMatrix * vec4(a_Position, 1.0);

				gl_Position = u_MVPMatrix * position4;
			}`,

			`precision mediump float;

			void main(void) {
				gl_FragColor = vec4(1.0);
			}`
		);

		return out;
	}
}

/**
 * Creates item with mesh of sphere by icosachedron mesh. This
 * is the one of the best ways to make sphere's mesh.
 * @this {Sphere}
 * @param {Object} options
 * @param {Number} options.id
 * @param {String} options.name
 * @param {Body} options.body
 * @param {Collider} options.collider
 * @param {Physic} options.physic
 * @param {Number} options.precision How much times sphere must be
 * updated by upgrade system, must be between 0 and 4.
 * @class
 * @extends Item
 */

class Sphere extends Item {
	constructor({
		id,
		name = 'sphere',
		body = new Body,
		collider,
		physic,
		precision = 3
	} = {}) {
		super({
			id,
			name,
			body,
			collider,
			physic
		});

		var mesh = sphereMesh[precision];

		this.mesh = new Mesh({
			attributes: {
				a_Position: mesh.vertices,
				a_Normal: mesh.normals,
				a_UV: mesh.uvs,
				a_Tangent: mesh.tangents,
				a_Bitangent: mesh.bitangents
			},
			vertexIndices: mesh.indices,
			shader: Icosahedron.shader
		});
	}

	/**
	 * Adds 4 new faces for each face of spher's mesh.
	 * @return {Object}
	 * @param {Array} vertices
	 * @param {Array} normals
	 * @param {Array} uvs
	 * @param {Array} indices
	 * @example
	 * var mesh = Sphere.mesh();
	 * mesh;  // {vertices, indices, normals, uvs, tangents, bitangents}
	 */
	static mesh({
		vertices,
		normals,
		uvs,
		indices
	} = {}) {
		var [nvertices, nnormals, nuvs, nindices] = [[], [], [], []];
		nvertices.size = 3;
		nnormals.size = 3;
		nuvs.size = 2;

		for (var i = 0; i < vertices.length; i++) {
			nvertices.push(vertices[i]);
			nnormals.push(normals[i]);
		}
		for (var i = 0; i < uvs.length; i++) {
			nuvs.push(uvs[i]);
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
			var ad = 1 - a.length(),
				bd = 1 - b.length(),
				cd = 1 - c.length();

			// normalization to recovery radius
			var an = a.normalize(),
				bn = b.normalize(),
				cn = c.normalize();

			// make right point for radius "R = 1"
			a = amc('+', a, amc('*', an, ad));
			b = amc('+', b, amc('*', bn, bd));
			c = amc('+', c, amc('*', cn, cd));

			var uv = [];
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
				uv.push(...arr);
			}

			var length = nvertices.length / 3;
			nvertices.push(...a.array(), ...b.array(), ...c.array());
			nnormals.push(...an.array(), ...bn.array(), ...cn.array());
			nuvs.push(...uv);

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
			uvs: nuvs
		};

		var tbn = TBN(out);

		var tg = tbn.tangents;
		tg.size = 3;

		var btg = tbn.bitangents;
		btg.size = 3;

		out.tangents = tg;
		out.bitangents = btg;

		return out;
	}
}

var icosahedronMesh,
	sphereMesh;

/**
 * Creates item with cube's mesh.
 * @this {Cube}
 * @param {Object} options
 * @param {Number} options.id
 * @param {String}options. name
 * @param {Body} options.body
 * @param {Collider} options.collider
 * @param {Physic} options.physic
 * @class
 * @extends Item
 */
class Cube extends Item {
	constructor({
		id,
		name = 'cube',
		body = new Body,
		collider,
		physic
	} = {}) {
		super({
			id,
			name,
			body,
			collider,
			physic,
		});

		var indices = [
			0, 1, 3, 3, 1, 2,
			7, 6, 4, 4, 6, 5,
			11, 10, 8, 8, 10, 9,
			12, 13, 15, 15, 13, 14,
			17, 16, 18, 18, 16, 19,
			20, 21, 23, 23, 21, 22
		];

		var vertices = [
			-1,-1,1, -1,1,1, 1,1,1, 1,-1,1,
			-1,-1,-1, -1,1,-1, 1,1,-1, 1,-1,-1,
			-1,-1,1, -1,1,1, -1,1,-1, -1,-1,-1,
			1,-1,1, 1,1,1, 1,1,-1, 1,-1,-1,
			-1,-1,1, -1,-1,-1, 1,-1,-1, 1,-1,1,
			-1,1,1, -1,1,-1, 1,1,-1, 1,1,1
		];
		vertices.size = 3;

		var uvs = [
			0,0, 0,1, 1,1, 1,0,
			1,0, 1,1, 0,1, 0,0,
			1,0, 1,1, 0,1, 0,0,
			0,0, 0,1, 1,1, 1,0,
			0,1, 0,0, 1,0, 1,1,
			0,0, 0,1, 1,1, 1,0
		];
		uvs.size = 2;

		var tbn = TBN({
			indices,
			vertices,
			uvs
		});

		var normals = tbn.normals;
		normals.size = 3;

		var tangents = tbn.tangents;
		tangents.size = 3;

		var bitangents = tbn.bitangents;
		bitangents.size = 3;

		this.mesh = new Mesh({
			attributes: {
				a_Position: vertices,
				a_UV: uvs,
				a_Normal: normals,
				a_Tangent: tangents,
				a_Bitangent: bitangents
			},
			vertexIndices: indices,
			shader: Cube.shader
		});
	}

	/**
	 * Creates cube shader.
	 * @return {ShaderTemplate}
	 * @method
	 * @static
	 */
	static get shader() {
		var out = new ShaderTemplate(
			`attribute vec3 a_Position;

			uniform mat4 u_MVMatrix;
			uniform mat4 u_MVPMatrix;

			void main(void) {
				vec4 position4 = u_MVMatrix * vec4(a_Position, 1.0);

				gl_Position = u_MVPMatrix * position4;
			}`,

			`precision mediump float;

			void main(void) {
				gl_FragColor = vec4(1.0);
			}`
		);

		return out;
	}
}

/**
 * Creates item with quad's mesh.
 * @this {UI}
 * @param {Object} options
 * @param {Number} options.id
 * @param {String} options.name
 * @param {Body} options.body
 * @param {Collider} options.collider
 * @param {Physic} options.physic
 * @param {Number} options.width
 * @param {Number} options.height
 * @class
 * @property {Vec2} position Defines position
 * in the project space by screen position.
 * @extends Item
 */

class UI extends Item {
	constructor({
		id,
		name = 'ui',
		body = new Body,
		collider,
		physic,
		width = RESOLUTION_WIDTH,
		height = RESOLUTION_HEIGHT
	} = {}) {
		super({
			id,
			name,
			body,
			collider,
			physic
		});

		this.width = width;
		this.height = height;
		this.position = new Vec3;

		this.initializeMesh();
	}

	get name() {
		return this.name_;
	}
	set name(val) {
		if (typeof val !== 'string') {
			throw new Error('UI: name: must be a string');
		}

		this.name_ = val;
	}

	get width() {
		return this.width_;
	}
	set width(val) {
		if (typeof val !== 'number') {
			throw new Error('UI: width: must be a number');
		}

		this.width_ = val;
		this.scale();
	}

	get height() {
		return this.height_;
	}
	set height(val) {
		if (typeof val !== 'number') {
			throw new Error('UI: height: must be a number');
		}

		this.height_ = val;
		this.scale();
	}

	/**
	 * Initializes mesh.
	 * @return {Object}
	 * @method
	 */
	initializeMesh() {
		var vertices = [
			-1, -1, 0,
			-1, 1, 0,
			1, 1, 0,
			1, -1, 0
		];
		vertices.size = 3;

		var uv = [
			0, 0,
			0, 1,
			1, 1,
			1, 0
		];
		uv.size = 2;

		var VI = [0, 1, 2, 2, 3, 0];

		this.mesh = new Mesh({
			attributes: {
				a_Position: vertices,
				a_UV: uv
			},
			vertexIndices: VI,
			shader: UI.shader
		});
	}

	get position() {
		return this.position_;
	}
	set position(val) {
		if (val instanceof Vec) {
			var x = (val.x) / RESOLUTION_WIDTH * 2 - 1;
			var y = -(val.y) / RESOLUTION_HEIGHT * 2 + 1;

			this.body.position = new Vec3(x, y, 0);
			this.position_ = val;
		}
		else {
			console.warn('Cursor: position: error');
		}
	}

	/**
	 * @private
	 */
	scale() {
		this.body.scale = new Vec3(
			1 * (this.width / RESOLUTION_WIDTH),
			1 * (this.height / RESOLUTION_HEIGHT),
			1
		);
	}

	/**
	 * Create UI's shader.
	 * @return {ShaderTemplate}
	 */
	static get Shader() {
		var out = new Shader(
			`attribute vec3 a_Position;
			attribute vec2 a_UV;

			uniform mat4 u_MVMatrix;

			varying vec2 v_UV;

			void main(void) {
				v_UV = a_UV;

				gl_Position = u_MVMatrix * vec4(a_Position, 1.0);
			}`,

			`precision highp float;

			uniform sampler2D u_Texture;

			varying vec2 v_UI;

			void main(void) {
				vec4 texel = texture2D(u_Texture, v_UV);

				gl_FragColor = texel;
			}`
		);

		return out;
	}
}

/**
 * Generates tangents and bitangents and normals for mesh.
 * @param {Array} indices
 * @param {Array} vertices
 * @param {Array} uvs
 * @param {Array} normals
 * @return {Object}
 * @example
 * TBN(Icosahedron.mesh());  // {indices, vertices, uvs, normals, tangents, bitangents}
 */
function TBN({indices, vertices, uvs, normals} = {}) {
	if (!indices || !vertices) {
		throw new Error('TBN: indices and array must be an arrays');
	}

	var out = {};

	if (!normals) {
		normals = [];
		var memory = [];

		for (var i = 0; i < indices.length; i += 3) {
			var ind0 = indices[i],
				ind1 = indices[i + 1],
				ind2 = indices[i + 2];

			var v0 = new Vec3(vertices[ind0 * 3], vertices[ind0 * 3 + 1], vertices[ind0 * 3 + 2]),
				v1 = new Vec3(vertices[ind1 * 3], vertices[ind1 * 3 + 1], vertices[ind1 * 3 + 2]),
				v2 = new Vec3(vertices[ind2 * 3], vertices[ind2 * 3 + 1], vertices[ind2 * 3 + 2]);

			var vec0 = new Vec3(
				v0.x - v1.x,
				v0.y - v1.y,
				v0.z - v1.z
			);
			var vec1 = new Vec3(
				v1.x - v2.x,
				v1.y - v2.y,
				v1.z - v2.z
			);

			var N = Vec3.cross(vec0, vec1).normalize();

			if (memory[ind0]) {
				memory[ind0].push(N);
			}
			else {
				memory[ind0] = [N];
			}
			if (memory[ind1]) {
				memory[ind1].push(N);
			}
			else {
				memory[ind1] = [N];
			}
			if (memory[ind2]) {
				memory[ind2].push(N);
			}
			else {
				memory[ind2] = [N];
			}
		}

		for (var i = 0; i < vertices.length / 3; i++) {
			var normal = Vec.avg(...memory[i]);
			normals.push(...normal.array());
		}

		out.normals = normals;
	}

	if (uvs) {
		out.tangents = [];
		out.bitangents = [];

		var tangents = [],
			bitangents = [];

		for (var i = 0; i < indices.length; i += 3) {
			var ind0 = indices[i],
				ind1 = indices[i + 1],
				ind2 = indices[i + 2];

			var v0 = new Vec3(vertices[ind0 * 3], vertices[ind0 * 3 + 1], vertices[ind0 * 3 + 2]),
				v1 = new Vec3(vertices[ind1 * 3], vertices[ind1 * 3 + 1], vertices[ind1 * 3 + 2]),
				v2 = new Vec3(vertices[ind2 * 3], vertices[ind2 * 3 + 1], vertices[ind2 * 3 + 2]);
			var s0 = uvs[ind0 * 2],
				t0 = uvs[ind0 * 2 + 1],
				s1 = uvs[ind1 * 2],
				t1 = uvs[ind1 * 2 + 1],
				s2 = uvs[ind2 * 2],
				t2 = uvs[ind2 * 2 + 1];

			var tb = calcBasis(v0, v1, v2, s0, t0, s1, t1, s2, t2);

			if (tangents[ind0]) {
				tangents[ind0].push(tb.tangent);
				bitangents[ind0].push(tb.bitangent);
			}
			else {
				tangents[ind0] = [tb.tangent];
				bitangents[ind0] = [tb.bitangent];
			}

			if (tangents[ind1]) {
				tangents[ind1].push(tb.tangent);
				bitangents[ind1].push(tb.bitangent);
			}
			else {
				tangents[ind1] = [tb.tangent];
				bitangents[ind1] = [tb.bitangent];
			}

			if (tangents[ind2]) {
				tangents[ind2].push(tb.tangent);
				bitangents[ind2].push(tb.bitangent);
			}
			else {
				tangents[ind2] = [tb.tangent];
				bitangents[ind2] = [tb.bitangent];
			}
		}

		for (var i = 0; i < vertices.length / 3; i++) {
			var tg = tangents[i];
			var btg = bitangents[i];

			tr = Vec.avg(...tg);
			br = Vec.avg(...btg);

			var normal = new Vec3(
				normals[i * 3],
				normals[i * 3 + 1],
				normals[i * 3 + 2]
			);
			tr = ortogonalize(normal, tr);
			br = ortogonalize(normal, br);

			out.tangents.push(...tr.array());
			out.bitangents.push(...br.array());
		}
	}

	return out;
	
	function calcBasis(E, F, G, sE, tE, sF, tF, sG, tG) {
		var P = amc('-', F, E),
			Q = amc('-', G, E);
		var s0 = sF - sE,
			t0 = tF - tE,
			s1 = sG - sE,
			t1 = tG - tE;

		var pqMatrix = new Mat(2, 3, [
			P.x, P.y, P.z,
			Q.x, Q.y, Q.z
		]);

		var temp = 1 / (s0 * t1 - s1 * t0);

		var stMatrix = new Mat(2, 2, [
			t1 * temp, -t0 * temp,
			-s1 * temp, s0 * temp
		]);

		var tbMatrix = amc('*', stMatrix, pqMatrix);

		var t = new Vec3(tbMatrix[0][0], tbMatrix[0][1], tbMatrix[0][2]).normalize(),
			b = new Vec3(tbMatrix[1][0], tbMatrix[1][1], tbMatrix[1][2]).normalize();

		var out = {
			tangent: t,
			bitangent: b
		};

		return out;
	}

	function ortogonalize(v0, v1) {
		var proj = getpoint(v0, amc('*', v0, -1), v1);
		var res = amc('-', v1, proj);
		res.normalize();

		return res;
	}

	function getpoint(a, b, p) {
		var c = amc('-', p, a),
			V = amc('-', b, a);

		var d = V.length();
		V = V.normalize();

		var t = Vec.dot(V, c);

		if (t < 0) {
			return a;
		}
		else if (t > d) {
			return b;
		}

		V = amc('*', V, t);
		var out = amc('+', a, V);

		return out;
	}
}

/***
 * Initializes icosahedron ans sphere meshes (with precision
 * from 1 to 4), it optimizes process because don't need to
 * initialize new mesh then creating new item.
 */
;(function() {
	icosahedronMesh = Icosahedron.mesh();

	sphereMesh = [];
	sphereMesh[0] = icosahedronMesh;
	for (var i = 1; i < 5; i++) {
		sphereMesh[i] = Sphere.mesh(sphereMesh[i - 1]);
	}
})();
