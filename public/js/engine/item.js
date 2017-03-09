/**
 * Scene's item constructor. Creates new item which
 * only in memory; sets body, mesh, physic, e.t.c. To
 * make item appear in scene it must be instantiated
 * by method "instance"
 *
 * @constructor
 * @this {Item}
 *  {Function} this.oninstance Callback that is called after instance
 *  {Function} this.onupdate Callback that is called evey frame
 * @param {bool} enabled Is item enabled on scene
 * @param {number} id Not selfgenerated
 * @param {string} name
 * @param {Body} body
 * @param {Mesh} mesh
 * @param {Collider} collider
 * @param {Physic} physic
 */

class Item {
	constructor({
		enabled = true,
		id,
		name = 'empty',
		body = new Body,
		mesh,
		collider,
		physic
	} = {}) {
		this.enabled = enabled;
		this.id = id;
		this.name = name;
		this.body = body;
		this.mesh = mesh;
		this.collider = collider;
		this.physic = physic;

		/** @private */ this.isInstanced = false;
		/** @private matrix memory */ this.matmem = [];
		/** @private public variables */ this.public_ = {};
		/** @private private variables */ this.private_ = {};

		if (typeof this.oninstance === 'function') {
			this.oninstance();
		}
	}

	get enabled() {
		return this.enabled_;
	}
	set enabled(val) {
		if (typeof val !== 'boolean') {
			throw new Error('Item: enabled: must be a bool');
		}

		this.enabled_ = val;
	}

	get id() {
		return this.id_;
	}
	set id(val) {
		if (val && typeof val !== 'number') {
			throw new Error('Item: id: must be a number');
		}

		this.id_ = val;
	}

	get name() {
		return this.name_;
	}
	set name(val) {
		if (typeof val !== 'string') {
			throw new Error('Item: name: must be a string');
		}

		this.name_ = val;
	}

	get body() {
		return this.body_;
	}
	set body(val) {
		if (val && !(val instanceof Body)) {
			throw new Error('Item: body: must be a Body');
		}

		this.body_ = val;
	}

	get mesh() {
		return this.mesh_;
	}
	set mesh(val) {
		if (val && !(val instanceof Mesh)) {
			throw new Error('Item: mesh: must be a Mesh');
		}

		this.mesh_ = val;
	}

	get collider() {
		return this.collider_;
	}
	set collider(val) {
		if (val && !(val instanceof Collider)) {
			throw new Error('Item: collider: must be a Collider');
		}

		this.collider_ = val;
	}

	get physic() {
		return this.physic_;
	}
	set physic(val) {
		if (val && !(val instanceof Physic)) {
			throw new Error('Item: physic: must be a Physic');
		}

		this.physic_ = val;
	}

	activeTexture(ind, buf) {
		var gl = this.webGL;

		gl.activeTexture(gl.TEXTURE0 + +ind);
		gl.bindTexture(gl.TEXTURE_2D, buf);
	}

	/**
	 * Creates WebGLBuffer by image and adds it to the
	 * shader.textures; buffer takes index equal a length
	 * of all images added in shader
	 *
	 * @param {Image} image
	 * @return {number} index
	 */
	addTexture(image) {
		var gl = this.webGL;
		var shader = this.mesh.shader;
		var ind = shader.texturesCount++;

		// if image didn't load yet then temporarily replace it with system picture

		var buffer = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, buffer);
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.project.transparentImage);
		gl.bindTexture(gl.TEXTURE_2D, null);

		image.onload = function() {
			gl.bindTexture(gl.TEXTURE_2D, buffer);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this);
			gl.bindTexture(gl.TEXTURE_2D, null);
		}
		// update onload event (if it was yet)
		image.src = image.src;

		shader.textures[ind] = buffer;
		return ind;
	}

	/**
	 * Initializes new attributes and adds to mesh,
	 * if attribute already exists then compare them
	 * and update it or skip
	 *
	 * @param {Object} obj Object with attributes key-value
	 *
	 * example: {
	 *  a_Position: ...,
	 *  a_Normal: ...
	 * }
	 */
	changeAttributes(obj = {}) {
		var shader = this.mesh.shader;

		// if item not instantiated yet then pass him in mesh
		if (this.isInstanced) {
			for (var i in obj) {
				if (obj.hasOwnProperty(i)) {
					var val = obj[i];

					this.initializeAttribute(i, val, shader.attributes);
				}
			}
		}
		else {
			if (this.mesh) {
				for (var i in obj) {
					if (obj.hasOwnProperty(i)) {
						var val = obj[i];

						this.mesh.attributes[i] = val;
					}
				}
			}
		}
	}

	/**
	 * Initializes new uniforms and adds to mesh,
	 * if uniform already exists then compare them
	 * and update it or skip
	 *
	 * @param {Object} obj Object with uniforms key-value
	 *
	 * example: {
	 *  u_MVMatrix: ...,
	 *  u_Resolution: ...
	 * }
	 */
	changeUniforms(obj = {}) {
		var shader = this.mesh.shader;

		if (this.isInstanced) {
			for (var i in obj) {
				if (obj.hasOwnProperty(i)) {
					var val = obj[i];

					this.initializeUniform(i, val, shader.uniforms);
				}
			}
		}
		else {
			if (this.mesh) {
				for (var i in obj) {
					if (obj.hasOwnProperty(i)) {
						var val = obj[i];

						this.mesh.uniforms[i] = val;
					}
				}
			}
		}
	}

	/**
	 * Creates buffer, defines location and writes
	 * it to object "out" sended as argument
	 *
	 * @param {string} key Attribute's name, rewrites "out" with key-name
	 * @param {Array} val Attribute's value, it must be an array with
	 *  property "size" which means how much coordinates does in contain
	 * @param {object} out Rewritable object
	 */
	initializeAttribute(key, val, out) {
		// if attribute already exists and equal to new then skip
		if (out[key] && amc('=', out[key].value, val)) {
			return;
		}

		var gl = this.webGL;
		var shader = this.mesh.shader,
			program = this.mesh.program;

		if (this.scene.lastShaderID !== shader.id) {
			this.scene.lastShaderID = shader.id;
			gl.useProgram(program);
		}

		var size = val.size;
		if (typeof size === 'undefined') {
			console.warn(`Not selected size for attribute '${key}'`);
		}

		var location = gl.getAttribLocation(program, key);
		if (location < 0) {
			// console.warn(`Shader doesnt contain '${key}' attribute or this is unusable`);
		}

		var buffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(val), gl.STATIC_DRAW);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);

		out[key] = {
			buffer,
			location,
			size
		};
	}

	/**
	 * Transforms data in required format by value type, defines location,
	 * type and method to send in shader and writes it to object
	 * "out" sended as argument
	 *
	 * @param {string} key Uniform's name, rewrites "out" with key-name
	 * @param {Mat|Vec|Quaternion|Color|Image|number|Array|object} val
	 * @param {object} out Rewritable object
	 */
	initializeUniform(key, val, out) {
		// if uniform already exists and equal to new then skip
		if (out[key] && amc('=', out[key].value, val)) {
			return;
		}

		var gl = this.webGL;
		var shader = this.mesh.shader,
			program = this.mesh.program;

		if (this.scene.lastShaderID != shader.id) {
			this.scene.lastShaderID = shader.id;
			gl.useProgram(program);
		}

		var location,
			method,
			type,
			value = val;

		if (value instanceof Mat) {
			var num = value.a;
			method = `uniformMatrix${num}fv`;
			type = 'mat';
			location = getlocation();
		}
		else if (value instanceof Vec) {
			var num = value.size;
			method = `uniform${num}fv`;
			type = 'vec';
			location = getlocation();
		}
		else if (value instanceof Color) {
			method = 'uniform4fv';
			type = 'col';
			location = getlocation();
		}
		else if (value instanceof Quaternion) {
			method = 'uniform4fv';
			type = 'qua';
			location = getlocation();
		}
		else if (value instanceof Euler) {
			method = 'uniform3fv';
			type = 'eul';
			location = getlocation();
		}
		else if (value instanceof Image) {
			method = 'uniform1i';
			type = 'img';
			location = getlocation();

			value = this.addTexture(value);
		}
		else if (typeof value === 'number') {
			method = 'uniform1f';
			type = 'num';
			location = getlocation();
		}
		else if (value instanceof Array) {
			// start recursion if value is an array
			for (var i = 0; i < value.length; i++) {
				var nval = value[i];
				this.initializeUniform(`${key}[${i}]`, nval, out);
			}
			return;
		}
		else if (typeof value === 'object') {
			// start recursion if value is an object
			for (var i in value) {
				if (value.hasOwnProperty(i)) {
					var nval = value[i];
					this.initializeUniform(`${key}.${i}`, nval, out);
				}
			}
			return;
		}

		out[key] = {
			isActive: false,
			method,
			location,
			type,
			value
		};

		function getlocation() {
			var loc = gl.getUniformLocation(program, key);
			if (!loc) {
				// console.warn(`Shader doesnt contain '${key}' uniform or this is unusable`);
			}
			return loc;
		}
	}

	/**
	 * Instances item on scene. Intializes shader, attributes, uniforms
	 * and write it to the shader, defines vertexIndices; writes to
	 * item's properties "scene", "project" and "webgl"
	 *
	 * @param {Scene} scene Which scene belongs to
	 * @param {bool} system Defines object type: system or regular
	 */
	instance(scene, isSystem = false) {
		if ((scene instanceof Scene)) {
			if (isSystem) {
				scene.appendSystemItem(this);
			}
			else {
				scene.appendItem(this);
			}

			this.isInstanced = true;
			this.scene = scene;
			this.project = scene.project;
			this.webGL = this.project.webGLRenderer.webGL;

			if (this.mesh) {
				this.mesh.shader = this.mesh.shader.initialize(this.webGL);
				this.mesh.setVIOBuffer(this.webGL, this.mesh.vertexIndices);
				this.changeAttributes(this.mesh.attributes);
				this.changeUniforms(this.mesh.uniforms);
			}
		}
		else {
			console.warn('Item: instance: error');
		}
	}

	/**
	 * Calculates model-view matrix by position and parents
	 *
	 * @return {Mat4} mvmatrix
	 */
	mvmatrix() {
		var matS, matR, matT, matU, mvmatrix;
		var body = this.body;

		/**
		 * matrix memory contains data about last calculated
		 * matrix, it needs to save memory, so it's returning
		 * already calculated values
		 */
		var memory = this.matmem,
			level = 0;  // level means "Parent's body number"
		/**
		 * if previous levels wasn't equal with memory
		 * when multiply existing mvmatrix on memory cells instead
		 * of writing all mvmatrix as value
		 */
		var isBreaked = false;  

		// go through cicle until item have a parent
		do {
			if (!memory[level]) {
				memory[level] = {};
			}
			var cell = memory[level];

			if (amc('=', body, cell)) {
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

				// matrix from this level only
				matU = amc('*', matS, matR, matT);
				cell.matrix = matU;

				// result matrix from first level to this
				mvmatrix = mvmatrix ? amc('*', mvmatrix, matU) : matU;
				cell.unity = mvmatrix;
			}

			body = body.parent;
			level++;
		}
		while(body);

		return mvmatrix;
	}

	get private() {
		return this.private_;
	}

	get public() {
		return this.public_;
	}

	remove() {
		if (this.onremove) {
			this.onremove();
		}

		this.scene.removeItem(this);
	}

	/**
	 * Makes rotate the object on selected vector
	 *
	 * @param {Vec} vec
	 */
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

	/**
	 * Updates all attributes, uniforms and textures
	 * binded to shader
	 */
	update() {
		var gl = this.webGL;
		var shader = this.mesh.shader,
			program = this.mesh.program,
			attributes = shader.attributes,
			uniforms = shader.uniforms,
			textures = shader.textures;

		if (this.scene.lastShaderID != shader.id) {
			this.scene.lastShaderID = shader.id;
			gl.useProgram(program);
		}

		for (var i in attributes) {
			if (attributes.hasOwnProperty(i)) {
				this.updateAttribute(attributes[i]);
			}
		}

		for (var i in uniforms) {
			if (uniforms.hasOwnProperty(i)) {
				var uniform = uniforms[i];
				this.updateUniform(uniform);
				uniform.isActive = true;
			}
		}

		for (var i in textures) {
			if (textures.hasOwnProperty(i)) {
				this.activeTexture(i, textures[i]);
			}
		}
	}

	updateAttribute({buffer, location, size} = {}) {
		var gl = this.webGL;

		if (location >= 0) {
			gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
			gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0);
			gl.enableVertexAttribArray(location);
			gl.bindBuffer(gl.ARRAY_BUFFER, null);
		}
	}

	updateUniform({isActive, method, location, type, value}) {
		if (isActive) {
			return;
		}

		var gl = this.webGL;

		if (!location) {
			return;
		}

		switch (type) {
			case 'mat':
			gl[method](location, null, value.array());
			break;

			case 'col':
			value = value.tounit();
			case 'vec':
			case 'eul':
			case 'qua':
			gl[method](location, value.array());
			break;

			case 'img':
			case 'num':
			gl[method](location, value);
			break;
		}
	}
}
