class Item {
	constructor({
		name = 'empty',
		body = new Body,
		mesh,
		collider,
		physic,
		enabled = true
	} = {}) {
		this.name = name;
		this.body = body;
		this.mesh = mesh;
		this.collider = collider;
		this.physic = physic;
		this.enabled = enabled;

		this.attributes = {};
		this.uniforms = {};

		this.matrixStorage_ = [];
	}

	allCollision(items) {
		//check collision with every object

		for (var item of items) {
			if (this !== item) {
				if (this.collision(item)) {
					return item;
				}
			}
		}

		return false;
	}

	get attributes() {
		return this.attributes_;
	}

	set attributes(val) {
		if (typeof val === 'object') {
			this.attributes_ = val;
		}
		else {
			console.warn('Item: attributes: error');
		}
	}

	get body() {
		return this.body_;
	}

	set body(val) {
		if (val instanceof Body) {
			this.body_ = val;
		}
		else {
			console.warn('Item: body: error');
		}
	}

	changeAttributes(val) {
		/* updates attributes:
			if new - add
			else - update */
		if (typeof val === 'object') {
			for (var i in val) {
				if (val.hasOwnProperty(i)) {
					var data = val[i];
					var attribute = this.initializeAttribute(i, data);
					this.attributes[i] = attribute;
				}
			}
		}
		else {
			console.warn('Item: changeAttributes: error');
		}
	}

	changeUniforms(val) {
		if (typeof val === 'object') {			
			for (var i in val) {
				if (val.hasOwnProperty(i)) {
					var data = val[i];
					var uniform = this.initializeUniform(i, data);
					if (uniform) {
						this.uniforms[i] = uniform;
					}
				}
			}
		}
		else {
			console.warn('Item: changeUniforms: error');
		}
	}

	get collider() {
		return this.collider_;
	}

	set collider(val) {
		if (!val || val instanceof Collider) {
			this.collider_ = val;
		}
		else {
			console.warn('Item: collider: error');
		}
	}

	collision(item) {
		if (!(item instanceof Item)) {
			console.warn('Item: collision: error');
		}

		if (this.collider && item.collider) {
			var result = SphereCollider.collision(this, element);
			return result;
		}
		else {
			return false;
		}
	}

	distance(item) {
		if (!(item instanceof Item)) {
			console.warn('Item: distance: error');
		}

		var matrix0 = this.mvmatrix,
			matrix1 = item.mvmatrix;

		//centers
		var c0 = matrix0.transform([0,0,0]),
			c1 = matrix1.transform([0,0,0]);

		var d = Math.sqrt(Math.pow(c1[0] - c0[0], 2) + Math.pow(c1[1] - c0[1], 2) + Math.pow(c1[2] - c0[2], 2));

		return d;
	}

	get drawStyle() {
		return this.drawStyle_;
	}

	set drawStyle(val) {
		if (typeof val === 'string') {
			this.drawStyle_ = val;
		}
		else {
			console.warn('Item: drawStyle: error');
		}
	}

	get enabled() {
		return this.enabled_;
	}

	set enabled(val) {
		if (typeof val === 'boolean') {
			this.enabled_ = val;
		}
		else {
			console.warn('Item: enabled: error');
		}
	}

	initializeAttribute(name, data) {
		var out;

		var gl = this.webGL;
		var shader = this.shader;
		var program = this.program;

		if (this.scene.lastShaderID != shader.id) {
			this.scene.lastShaderID = shader.id;
			gl.useProgram(program);
		}

		//methods to optimization of attributes initializing
		var old_attributes = this.attributes;
		var defines = shader.attributesDefines;

		var buffer = gl.createBuffer();
		var size = data.size;

		if (!size) {
			console.warn(`Doesnt selected size for attribute '${name}'`)
		}

		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);

		//if attribute location is determined
		if (defines[name]) {
			//so just change buffer and path for comparison
			out = old_attributes[name];

			out[0] = buffer;
			out[3] = data;
		}
		//if attribute first time in shader
		else {
			defines[name] = true;

			var index = gl.getAttribLocation(program, name);
			var arr = [buffer, index, size, data];

			//if shader contains attribute
			if (index >= 0) {
				gl.vertexAttribPointer(index, size, gl.FLOAT, false, 0, 0);
				gl.enableVertexAttribArray(index);
			}
			else {
				//console.warn(`Shader doesnt contain '${name}' attribute or this is unusable`);
			}

			out = arr;
		}

		gl.bindBuffer(gl.ARRAY_BUFFER, null);

		return out;
	}

	initializeUniform(name, data, defined = false) {
		var out;

		var gl = this.webGL;
		var shader = this.shader;
		var program = this.program;

		var defines = shader.uniformsDefines;

		if (this.scene.lastShaderID != shader.id) {
			this.scene.lastShaderID = shader.id;
			gl.useProgram(program);
		}

		//define type of uniform, uniform can have next types:
		//Mat, Vec, float

		var index = defines[name];
		if (typeof index === 'undefined' && !defined) {
			index = gl.getUniformLocation(program, name);
			defines[name] = index;

			if (!index) {
				//console.warn(`Shader doesnt contain '${name}' uniform or this is unusable`);
			}
		}

		if (data instanceof Euler || data instanceof Quaternion) {
			data = data.Vec();
		}

		var method;
		if (data instanceof Mat) {
			switch(data.a) {
				case 2:
				method = 'uniformMatrix2fv';
				break;

				case 3:
				method = 'uniformMatrix3fv';
				break;

				case 4:
				method = 'uniformMatrix4fv';
				break;
			}

			out = {
				data: new Float32Array(data.array),
				index,
				type: 'mat',
				method
			};
		}
		else if (data instanceof Vec) {
			switch(data.length) {
				case 2:
				method = 'uniform2f';
				break;

				case 3:
				method = 'uniform3f';
				break;

				case 4:
				method = 'uniform4f';
				break;
			}

			out = {
				data: new Float32Array(data.array),
				index,
				type: 'vec',
				method
			};
		}
		else if (data instanceof Color) {
			method = 'uniform4f';

			out = {
				data: new Float32Array(data.normalize().array),
				index,
				type: 'vec',
				method
			};
		}
		else if (typeof data === 'number') {
			out = {
				data,
				index,
				type: 'float',
				method: 'uniform1f'
			};
		}
		else if (data instanceof Image) {
			let buffer = gl.createTexture();
			gl.bindTexture(gl.TEXTURE_2D, buffer);
			gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.project.transparentImage);
			gl.bindTexture(gl.TEXTURE_2D, null);

			data.onload = function() {
				gl.bindTexture(gl.TEXTURE_2D, buffer);
				gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this);
				gl.bindTexture(gl.TEXTURE_2D, null);
			}
			//update onload
			data.src = data.src;

			out = {
				data: buffer,
				index,
				type: 'texture',
				method: 'uniform1i',
				count: ++shader.texturesCount
			};
		}
		else if (data instanceof Array) {
			var arr = [];
			var lastmethod, subtype;

			if (data.length > 0) {
				for (var i = 0; i < data.length; i++) {
					var ndata = data[i];
					var uniform = this.initializeUniform(`${name}${i}`, ndata, true);

					if (uniform[2] == 'array') {
						console.warn('Item: initializeUniform: array-uniform can\'t contain another arrays');
					}
					else {
						if (lastmethod && lastmethod !== uniform.method) {
							console.warn('Item: initializeUniform: array-uniform contains different types uniforms');
						}
						else {
							lastmethod = uniform.method;
							subtype = uniform.type;
							var ndata = uniform.data;

							switch (subtype) {
								case 'texture':
								ndata.count = uniform.count;
								arr.push(ndata);
								break;

								case 'vec':
								arr.push(...ndata);
								break;

								default:
								arr.push(ndata);
							}
						}
					}
				}

				out = {
					data: arr,
					index,
					type: 'array',
					subtype,
					method: lastmethod + 'v'
				};
			}
			else {
				out = undefined;
			}
		}

		return out;
	}

	initializeVertexIndices(vertices) {
		if (typeof vertices !== 'object') {
			console.warn('Item: initializeVertexIndices: error');
		}

		var gl = this.webGL;
		var VIOBuffer = gl.createBuffer();

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, VIOBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(vertices), gl.STATIC_DRAW);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

		VIOBuffer.length = vertices.length;

		return VIOBuffer;
	}

	instance(scene) {
		if ((scene instanceof Scene)) {
			scene.appendItem(this);
			this.scene = scene;
			this.project = scene.project;
			this.webGL = scene.project.webGLRenderer.webGL;

			if (this.mesh) {
				this.shader = this.mesh.shader;
				this.vertexIndices = this.mesh.vertexIndices;
				this.drawStyle = this.mesh.drawStyle;
				this.changeAttributes(this.mesh.attributes);
				this.changeUniforms(this.mesh.uniforms);
			}
		}
		else {
			console.warn('Item: instance: error');
		}
	}

	get mesh() {
		return this.mesh_;
	}

	set mesh(val) {
		if (!val || val instanceof Mesh) {
			this.mesh_ = val;
		}
		else {
			console.warn('Item: mesh: error');
		}
	}

	get mvmatrix() {
		var matS, matR, matT, matU, mvmatrix;
		var body = this.body;

		var storage = this.matrixStorage_;
		var ie = 0;
		var isBreaked = false;

		do {
			if (!storage[ie]) {
				storage[ie] = {};
			}
			var cell = storage[ie];

			if (Body.compare(body, cell, false)) {
				if (isBreaked) {
					mvmatrix = Mat.multi(mvmatrix, cell.matrix);
				}
				else {
					mvmatrix = cell.unity;
				}
			}
			else {
				isBreaked = true;

				cell.position = body.position;
				cell.rotation = body.rotation;
				cell.scale = body.scale;

				matS = Mat4.scale(body.scale);
				matR = Mat4.rotate(body.rotation);
				matT = Mat4.translate(body.position);

				matU = Mat.multi(matS, matR, matT);
				cell.matrix = matU;

				mvmatrix = mvmatrix ? Mat.multi(mvmatrix, matU) : matU;
				cell.unity = mvmatrix;
			}

			body = body.parent;
			ie++;
		}
		while(body);

		return mvmatrix;
	}

	get name() {
		return this.name_;
	}

	set name(val) {
		if (typeof val === 'string') {
			this.name_ = val;
		}
		else {
			console.warn('Item: name: error');
		}
	}

	static normals(vertices, indices) {
		var out = [];
		out.size = 3;

		var dependencies = {};

		for (var i = 0; i < indices.length; i += 3) {
			var i0 = indices[i] * 3,
				i1 = indices[i + 1] * 3,
				i2 = indices[i + 2] * 3;
			var v0 = [vertices[i0], vertices[i0 + 1], vertices[i0 + 2]],
				v1 = [vertices[i1], vertices[i1 + 1], vertices[i1 + 2]],
				v2 = [vertices[i2], vertices[i2 + 1], vertices[i2 + 2]];
			var x = ((v0[1] - v1[1]) * (v0[2] - v2[2])) - ((v0[2] - v1[2]) * (v0[1] - v2[1])),
				y = ((v0[2] - v1[2]) * (v0[0] - v2[0])) - ((v0[0] - v1[0]) * (v0[2] - v2[2])),
				z = ((v0[0] - v1[0]) * (v0[1] - v2[1])) - ((v0[1] - v1[1]) * (v0[0] - v2[0]));
			var length = Math.sqrt((x * x) + (y * y) + (z * z));
			x = x / length;
			y = y / length;
			z = z / length;

			i0 /= 3;
			i1 /= 3;
			i2 /= 3;

			if (!dependencies[i0]) {
				dependencies[i0] = [[x, y, z]];
			}
			else {
				dependencies[i0].push([x, y, z]);
			}

			if (!dependencies[i1]) {
				dependencies[i1] = [[x, y, z]];
			}
			else {
				dependencies[i1].push([x, y, z]);
			}

			if (!dependencies[i2]) {
				dependencies[i2] = [[x, y, z]];
			}
			else {
				dependencies[i2].push([x, y, z]);
			}
		}

		for (var i = 0; i < vertices.length / 3; i++) {
			var vec = dependencies[i];

			var x, y, z, count = 0;
			for (var arr of vec) {
				x = arr[0];
				y = arr[1];
				z = arr[2];
				count++;
			}

			var vec = new Vec3(x, y, z).normalize();

			out.push(vec.x, vec.y, vec.z);
		}

		return out;
	}

	get project() {
		return this.project_;
	}

	set project(val) {
		if (val instanceof Project) {
			this.project_ = val;
		}
		else {
			console.warn('Item: project: error');
		}
	}

	get physic() {
		return this.physic_;
	}

	set physic(val) {
		if (!val || val instanceof Physic) {
			this.physic_ = val;
			if (val) {
				this.physic.body = this.body;
			}
		}
		else {
			console.warn('Item: physic: error');
		}
	}

	get program() {
		if (this.shader) {
			return this.shader.program;
		}
	}

	get project() {
		return this.project_;
	}

	set project(val) {
		if (val instanceof Project) {
			this.project_ = val;
		}
		else {
			console.warn('Item: project: error');
		}
	}

	rotate(vec) {
		clearTimeout(this.rotateTimer);

		if (vec) {
			var self = this;
			;(function update() {
				var rotation = self.body.rotation;
				self.body.rotation = Quaternion.Euler(
					rotation.euler.x + vec.x,
					rotation.euler.y + vec.y,
					rotation.euler.z + vec.z
				);
				self.rotateTimer = setTimeout(update, FPS);
			})();
		}
	}

	get scene() {
		return this.scene_;
	}

	set scene(val) {
		if (val instanceof Scene) {
			this.scene_ = val;
		}
		else {
			console.warn('Item: scene: error');
		}
	}

	get shader() {
		return this.shader_;
	}

	set shader(val) {
		if (val instanceof Shader) {			
			var webGL = this.webGL;
			this.shader_ = val.initialize(webGL);
		}
		else {
			console.warn('Item: shader: error');
		}
	}

	get unavailableFrames() {
		return this.availableFrames_;
	}

	set unavailableFrames(array) {
		if (typeof array === 'object') {
			this.availableFrames_ = array;
		}
		else {
			console.warn('Item: availableFrames: error');
		}
	}

	get uniforms() {
		return this.uniforms_;
	}

	set uniforms(val) {
		if (typeof val === 'object') {
			this.uniforms_ = val;
		}
		else {
			console.warn('Item: uniforms: error');
		}
	}

	update() {
		var shader = this.shader;
		var program = this.program;

		if (this.scene.lastShaderID != shader.id) {
			this.scene.lastShaderID = shader.id;
			gl.useProgram(program);
		}

		this.updateAttributes();
		this.updateUniforms();
	}

	updateAttributes() {
		/* enables attributes in shader or miss them
		if already activated */

		var gl = this.webGL;
		var attributes = this.attributes;

		var shader = this.shader;
		var program = this.program;

		if (this.scene.lastShaderID != shader.id) {
			this.scene.lastShaderID = shader.id;
			gl.useProgram(program);
		}

		for (var i in attributes) {
			if (attributes.hasOwnProperty(i)) {
				var attribute = attributes[i];

				var [buffer, index, size, data] = [...attribute];

				if (index >= 0) {
					gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
					gl.vertexAttribPointer(index, size, gl.FLOAT, false, 0, 0);
					gl.enableVertexAttribArray(index);
					gl.bindBuffer(gl.ARRAY_BUFFER, null);
				}
			}
		}
	}

	updateUniforms() {
		/* enables uniforms in shader or miss them
		if already activated */

		var gl = this.webGL;
		var uniforms = this.uniforms;

		var shader = this.shader;
		var program = this.program;

		var storage = shader.uniformsStorage;

		if (this.scene.lastShaderID != shader.id) {
			this.scene.lastShaderID = shader.id;
			gl.useProgram(program);
		}

		for (var i in uniforms) {
			if (uniforms.hasOwnProperty(i)) {
				var uniform = uniforms[i];

				var index = uniform.index;
				var data = uniform.data;
				var method = uniform.method;

				if (index) {
					if (uniform.subtype == 'texture' || uniform.type == 'texture' || !compare(data, storage[i])) {
						storage[i] = data;

						switch (uniform.type) {
							case 'vec':
							gl[method](index, ...data);
							break;

							case 'mat':
							gl[method](index, false, data);
							break;

							case 'float':
							gl[method](index, data);
							break;

							case 'texture':
							gl.activeTexture(gl.TEXTURE0 + uniform.count);
							gl.bindTexture(gl.TEXTURE_2D, data);
							gl[method](index, uniform.count);
							break;

							case 'array':
							if (uniform.subtype == 'texture') {
								var samplerarray = [];
								for (var texture of data) {
									gl.activeTexture(gl.TEXTURE0 + texture.count);
									gl.bindTexture(gl.TEXTURE_2D, texture);

									samplerarray.push(texture.count);

									gl[method](index, samplerarray);
								}
							}
							else {
								gl[method](index, data);
							}

							break;
						}
					}
				}
			}
		}
	}

	set vertexIndices(vertices) {
		if (vertices instanceof Array) {
			this.VIOBuffer = this.initializeVertexIndices(vertices);
			this.VIOBuffer.length = vertices.length;
		}
		else {
			console.warn('Item: vertexIndices: error');
		}
	}

	get VIOBuffer() {
		return this.VIOBuffer_;
	}

	set VIOBuffer(val) {
		if (typeof val === 'object') {
			this.VIOBuffer_ = val;
		}
		else {
			console.warn('Item: VIOBuffer: error');
		}
	}

	get webGL() {
		return this.webGL_;
	}

	set webGL(val) {
		this.webGL_ = val;
	}
}

function compare(item0, item1) {
	var out = true;

	if (typeof item0 === 'undefined' || typeof item1 === 'undefined') {
		out = false;
		return out;
	}

	var type0 = item0.constructor,
		type1 = item1.constructor;

	if (type0 === type1) {
		switch(type0) {
			case Mat:
			case Mat2:
			case Mat3:
			case Mat4:
			out = Mat.compare(item0, item1);
			break;

			case Vec:
			case Vec2:
			case Vec3:
			case Vec4:
			out = Vec.compare(item0, item1);
			break;

			case Array:
			case Float32Array:
			if (item0.length != item1.length) {
				out = false;
			}
			else {
				for (var i = 0; i < item0.length; i++) {
					if (item0[i] !== item1[i]) {
						out = false;
						break;
					}
				}
			}
			break;

			default:
			out = item0 === item1;
		}
	}
	else {
		out = item0 === item1;
	}

	return out;
}
