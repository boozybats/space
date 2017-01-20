class CloneItem {
	constructor(scene, {
		name = 'empty',
		body = new Body,
		collider,
		physic,
		enabled = true
	} = {}) {
		this.project = scene.project;
		this.scene = scene;
		this.enabled = enabled;
		this.name = name;
		this.body = new Body({
			position: body.position,
			rotation: body.rotation,
			scale: body.scale,
			parent: body.parent,
			children: body.children
		});
		this.collider = collider;
		this.physic = physic;

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
			console.warn('CloneItem: attributes: error');
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
			console.warn('CloneItem: body: error');
		}
	}

	changeAttributes(val) {
		/* updates attributes:
			if new - add
			else - update */
		if (typeof val === 'object') {
			var attributes = this.initializeAttributes(val);
			
			for (var i in attributes) {
				if (attributes.hasOwnProperty(i)) {
					var attribute = attributes[i];
					this.attributes[i] = attribute;
				}
			}
		}
		else {
			console.warn('CloneItem: changeAttributes: error');
		}
	}

	changeUniforms(val) {
		if (typeof val === 'object') {
			var uniforms = this.initializeUniforms(val);
			
			for (var i in uniforms) {
				if (uniforms.hasOwnProperty(i)) {
					var uniform = uniforms[i];
					this.uniforms[i] = uniform;
				}
			}
		}
		else {
			console.warn('CloneItem: changeUniforms: error');
		}
	}

	get collider() {
		return this.collider_;
	}

	set collider(val) {
		if (!val || val instanceof Project) {
			this.collider_ = val;
		}
		else {
			console.warn('CloneItem: collider: error');
		}
	}

	collision(item) {
		if (!(item instanceof CloneItem)) {
			console.warn('CloneItem: collision: error');
		}

		if (this.collider && item.collider) {
			var result = SphereCollider.collision(this, element);  //check to sphere collision
			return result;
		}
		else {
			return false;
		}
	}

	distance(item) {
		if (!(item instanceof CloneItem)) {
			console.warn('CloneItem: distance: error');
		}

		//calculates distance between elements

		var matrix0 = this.mvmatrix,
			matrix1 = item.mvmatrix;

		//centers
		var c0 = matrix0.transform([0,0,0]),
			c1 = matrix1.transform([0,0,0]);

		var d = Math.sqrt(Math.pow(c1[0] - c0[0], 2) + Math.pow(c1[1] - c0[1], 2) + Math.pow(c1[2] - c0[2], 2));

		return d;
	}

	get enabled() {
		return this.enabled_;
	}

	set enabled(val) {
		if (typeof val === 'boolean') {
			this.enabled_ = val;
		}
		else {
			console.warn('CloneItem: enabled: error');
		}
	}

	initializeAttributes(attributes = {}) {
		if (typeof attributes !== 'object') {
			console.warn('CloneItem: initializeAttributes: error');
		}

		/* gets as argument attributes-object with names of this attributes,
		as example: {a_Position: [...], a_UI: [...]}, every array must have
		method "size" (usually "3") which shows how much values in one vertex. */

		var out = {};

		var gl = this.project.webGLRenderer.webGL;
		var shader = this.shader;
		var program = this.program;

		if (this.scene.lastShaderID != shader.id) {
			this.scene.lastShaderID = shader.id;
			gl.useProgram(program);
		}

		//methods to optimization of attributes initializing
		var old_attributes = this.attributes;

		for (var i in attributes) {
			if (attributes.hasOwnProperty(i)) {
				var data = attributes[i];

				var buffer = gl.createBuffer();
				var size = data.size;

				gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
				gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);

				//if attribute location is determined
				if (old_attributes && typeof old_attributes[i] !== 'undefined') {
					//so just change buffer and path for comparison
					old_attributes[i][0] = buffer;
					old_attributes[i][3] = data;
				}
				//if attribute first time in shader
				else {
					var index = gl.getAttribLocation(program, i);
					var arr = [buffer, index, size, data];

					//if shader contains attribute
					if (index >= 0) {
						gl.vertexAttribPointer(index, size, gl.FLOAT, false, 0, 0);
						gl.enableVertexAttribArray(index);
					}
					else {
						//console.warn(`Shader doesnt contain '${i}' attribute or this is unusable`);
					}

					out[i] = arr;
				}

				gl.bindBuffer(gl.ARRAY_BUFFER, null);
			}
		}

		return out;
	}

	initializeUniforms(uniforms = {}) {
		if (typeof uniforms !== 'object') {
			console.warn('CloneItem: initializeUniforms: error');
		}

		/* gets as argument uniforms-object with names of this uniforms,
		as example: {u_MVMatrix: Mat4, u_Lights: [DirectionalLight, PointLight]},
		takes uniforms with classes: Mat, Vec, float */

		var out = {};

		var gl = this.project.webGLRenderer.webGL;
		var shader = this.shader;
		var program = this.program;

		var old_uniforms = this.uniforms;

		if (this.scene.lastShaderID != shader.id) {
			this.scene.lastShaderID = shader.id;
			gl.useProgram(program);
		}

		for (var i in uniforms) {
			if (uniforms.hasOwnProperty(i)) {
				var data = uniforms[i];

				if (old_uniforms && typeof old_uniforms[i] !== 'undefined') {
					old_uniforms[i][0] = data;
				}
				else {
					//define type of uniform, uniform can have next types:
					//Mat, Vec, float

					var index = gl.getUniformLocation(program, i);
					if (!index) {
						//console.warn(`Shader doesnt contain '${i}' uniform or this is unusable`);
					}

					var type, method;

					if (data instanceof Mat) {
						type = 'mat';

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
					}
					else if (data instanceof Vec) {
						type = 'vec';

						switch(data.length) {
							case 2:
							method = 'uniform2fv';
							break;

							case 3:
							method = 'uniform3fv';
							break;

							case 4:
							method = 'uniform4fv';
							break;
						}
					}
					else if (typeof data === 'number') {
						type = 'float';
					}
					else if (data instanceof Image) {
						type = 'image';

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

						[index, method] = [[index, ++shader.texturesCount], buffer];
					}

					var arr = [data, index, type, method];

					out[i] = arr;
				}
			}
		}

		return out;
	}

	initializeVertexIndices(vertices) {
		if (typeof vertices !== 'object') {
			console.warn('CloneItem: initializeVertexIndices: error');
		}

		var gl = this.project.webGLRenderer.webGL;
		var VIOBuffer = gl.createBuffer();

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, VIOBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(vertices), gl.STATIC_DRAW);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

		VIOBuffer.length = vertices.length;

		return VIOBuffer;
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

			if (cell.position === body.position &&
				cell.rotation === body.rotation &&
				cell.scale === body.scale) {
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
			console.warn('CloneItem: name: error');
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
			console.warn('CloneItem: project: error');
		}
	}

	set physic(val) {
		if (!val || val instanceof Physic) {
			this.physic_ = val;
		}
		else {
			console.warn('CloneItem: physic: error');
		}
	}

	get program() {
		if (this.shader) {
			return this.shader.program;
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
			console.warn('CloneItem: scene: error');
		}
	}

	get shader() {
		return this.shader_;
	}

	set shader(val) {
		if (val instanceof Shader) {			
			var webGL = this.scene.project.webGLRenderer.webGL;
			this.shader_ = val.initialize(webGL);
		}
		else {
			console.warn('CloneItem: shader: error');
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
			console.warn('CloneItem: availableFrames: error');
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
			console.warn('CloneItem: uniforms: error');
		}
	}

	update() {
		this.updateAttributes();
		this.updateUniforms();
	}

	updateAttributes() {
		/* enables attributes in shader or miss them
		if already activated */

		var gl = this.project.webGLRenderer.webGL;
		var attributes = this.attributes;
		var storage = this.shader.attributesStorage;

		var shader = this.shader;
		var program = this.program;

		if (this.scene.lastShaderID != shader.id) {
			this.scene.lastShaderID = shader.id;
			gl.useProgram(program);
		}

		if (attributes) {
			for (var i in attributes) {
				if (attributes.hasOwnProperty(i)) {
					var attribute = attributes[i];

					var [buffer, index, size, data] = [...attribute];

					if (!compare(data, storage[i])) {
						storage[i] = data;

						if (index >= 0) {
							gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
							gl.vertexAttribPointer(index, size, gl.FLOAT, false, 0, 0);
							gl.enableVertexAttribArray(index);
							gl.bindBuffer(gl.ARRAY_BUFFER, null);
						}
					}
				}
			}
		}
	}

	updateUniforms() {
		/* enables uniforms in shader or miss them
		if already activated */

		var gl = this.project.webGLRenderer.webGL;
		var uniforms = this.uniforms;
		var storage = this.shader.uniformsStorage;

		var shader = this.shader;
		var program = this.program;

		if (this.scene.lastShaderID != shader.id) {
			this.scene.lastShaderID = shader.id;
			gl.useProgram(program);
		}

		for (var i in uniforms) {
			if (uniforms.hasOwnProperty(i)) {
				var uniform = uniforms[i];
				var [data, index, type, method] = [...uniform];

				if (type == 'image' || index && !compare(data, storage[i])) {
					storage[i] = data;

					if (type == 'vec') {
						gl[method](index, new Float32Array(data.inline()));
					}
					else if (type == 'mat') {
						gl[method](index, false, new Float32Array(data.inline()));
					}
					else if (type == 'float') {
						gl.uniform1f(index, data);
					}
					else if (type == 'image') {
						gl.activeTexture(gl.TEXTURE0 + index[1]);
						gl.bindTexture(gl.TEXTURE_2D, method);
						gl.uniform1i(index[0], index[1]);
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
			console.warn('CloneItem: vertexIndices: error');
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
			console.warn('CloneItem: VIOBuffer: error');
		}
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
			case Array:
			if (item0.length != item1.length) {
				out = false;
				return out;
			}
			else {
				for (var i = 0; i < item0.length; i++) {
					if (item0[i] !== item1[i]) {
						out = false;
						return out;
					}
				}
			}
			break;

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

			default:
			out = item0 === item1;
		}
	}
	else {
		out = item0 === item1;
	}

	return out;
}
