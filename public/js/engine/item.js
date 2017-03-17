/**
 * Item stores info about object: {@link Body}, {@link Mesh},
 * {@link Physic}, {@link Collider}, etc. Created item doesn't
 * instantly binds to scene, it must be instantiated by same method.
 * @this {Item}
 * @param {Object} options
 * @param {Boolean} options.enabled Does item exist on scene.
 * @param {Number} options.id
 * @param {String} options.name
 * @param {Body} options.body
 * @param {Mesh} options.mesh
 * @param {Physic} options.physic
 * @param {Collider} options.collider
 * @class
 * @property {Boolean} enabled Does item exist on scene.
 * @property {Number} id
 * @property {String} name
 * @property {Body} body
 * @property {Mesh} mesh
 * @property {Physic} physic
 * @property {Collider} collider
 * @property {Object} public A variable environment that can be
 * obtained by external methods.
 * @property {Object} private A variable environment that can be
 * obtained only in this object.
 * @property {Scene} scene On wich scene was instantiated.
 * @property {Project} project Binded project.
 * @property {WebGLContext} webGL WebGL item of {@link Project}'s
 * {@link WebGLRenderer}.
 */

class Item {
	constructor({
		enabled = true,
		id,
		name = 'empty',
		body = new Body,
		mesh,
		physic,
		collider
	} = {}) {
		this.enabled = enabled;
		this.id = id;
		this.name = name;
		this.body = body;
		this.mesh = mesh;
		this.collider = collider;
		this.physic = physic;

		/**
		 * Has been item instantiated.
		 * @type {Boolean}
		 * @private
		 */
		this.isInstanced = false;
		/**
		 * Stores last results of {@link Item#mvmatrix} calculations.
		 * @type {Array}
		 * @private
		 */
		this.matmem = [];
		/**
		 * A variable environment that can be obtained by external methods.
		 * @type {Object}
		 * @private
		 */
		this.public_ = {};
		/**
		 * A variable environment that can be obtained only in this object.
		 * @type {Object}
		 * @private
		 */
		this.private_ = {};

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

	/**
	 * Activates texture by index.
	 * @param  {Number} ind
	 * @param  {WebGLBuffer} buf
	 * @method
	 */
	activeTexture(ind, buf) {
		var gl = this.webGL;

		gl.activeTexture(gl.TEXTURE0 + +ind);
		gl.bindTexture(gl.TEXTURE_2D, buf);
	}

	/**
	 * Creates WebGLBuffer of the image and adds it to the
	 * {@link Shader.textures}-ojbect. Buffer acquires an
	 * array index equal the length of all images added in shader.
	 * @param {Image} image
	 * @return {Number} Texture index in shader position
	 * @method
	 * @example
	 * var item = new Item(options);
	 * 
	 * var img = new Image();
	 * img.src = './favouriteImage.jpg';
	 * 
	 * var index = item.addTexture(img);  // 0
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
	 * If item has been instantiated then adds attribute to {@link Shader}
	 * with initialized location, else adds attribute to {@link Mesh}.
	 * Each attribute-array must have parameter "size" that shows how
	 * much coordinates have a one vertex.
	 * @param {Object} obj Object with attribute-arrays.
	 * @method
	 * @example
	 * var item = new Item(options);
	 * 
	 * var vertices = [-1,-1, -1,1, 1,1, 1,-1];
	 * vertices.size = 2;  // 2 coordinates on a vertex
	 *
	 * item.changeAttributes({a_Position: vertices});
	 */
	changeAttributes(options) {
		var shader = this.mesh.shader;

		if (this.isInstanced) {
			for (var i in options) {
				if (options.hasOwnProperty(i)) {
					var val = options[i];

					this.initializeAttribute(i, val, shader.attributes);
				}
			}
		}
		else {
			if (this.mesh) {
				for (var i in options) {
					if (options.hasOwnProperty(i)) {
						var val = options[i];

						this.mesh.attributes[i] = val;
					}
				}
			}
		}
	}

	/**
	 * If item has been instantiated then adds uniform to {@link Shader}
	 * with initialized location, else adds uniform to {@link Mesh}.
	 * @param {Object} options Object with uniforms.
	 * @method
	 * @example
	 * var item = new Item(options);
	 * item.changeUniforms({
	 * 	u_MVMatrix: new Mat4,
	 * 	u_Intensity: 20.125
	 * })
	 */
	changeUniforms(options) {
		var shader = this.mesh.shader;

		if (this.isInstanced) {
			for (var i in options) {
				if (options.hasOwnProperty(i)) {
					var val = options[i];

					this.initializeUniform(i, val, shader.uniforms);
				}
			}
		}
		else {
			if (this.mesh) {
				for (var i in options) {
					if (options.hasOwnProperty(i)) {
						var val = options[i];

						this.mesh.uniforms[i] = val;
					}
				}
			}
		}
	}

	/**
	 * Sets in "out" in "key" position the new object with created
	 * buffer from attribute-array, buffer size and defined location.
	 * @param  {String} key Uniform name
	 * @param  {Array} val
	 * @param  {Object} out Rewritable object
	 * @method
	 * @example
	 * var item = new Item(options);
	 *
	 * var attributes = {};
	 * var vertices = [-1,-1, -1,1, 1,1, 1,-1];
	 * vertices.size = 2;
	 *
	 * item.initializeUniform('a_Position', vertices, attributes);
	 * attributes;  // Object {a_Position: {buffer, size, location}}
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
			size,
			location
		};
	}

	/**
	 * Sets in "out" in "key" position the new object with defined
	 * uniform location, method, type and value. Called from
	 * {@link Item.changeUniforms}.
	 * @param  {String} key Uniform name
	 * @param  {Mat | Vec | Color | Euler | Quaternion |
	 * Image | Number | Array | Object} val
	 * @param  {Object} out Rewritable object
	 * @method
	 * @example
	 * var item = new Item(options);
	 *
	 * var uniforms = {};
	 *
	 * item.initializeUniform('u_MVMatrix', new Mat4, uniforms);
	 * uniforms;  // Object {u_MVMatrix: {location, method, type, value}}
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
			counter,
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
			counter = this.addTexture(value);
		}
		else if (typeof value === 'number') {
			method = 'uniform1f';
			type = 'num';
			location = getlocation();
		}
		else if (value instanceof Array) {
			// start recursion if value is an array
			var length = value.length;
			for (var i = 0; i < length; i++) {
				var nval = value[i];
				this.initializeUniform(`${key}[${i}]`, nval, out);
			}

			for (var i in out) {
				if (out.hasOwnProperty(i)) {
					var regexp = new RegExp(`^${key}[(\\d+)]`, '');
					var match = i.match(regexp);

					if (match) {
						var ind = ~~match[1];

						if (ind >= length) {
							this.nullifyUniform(i, out);
						}
					}
				}
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
			counter,
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
	 * Instances item to scene. Intializes shader, attributes, uniforms
	 * and write it to the shader, defines vertexIndices. Adds to
	 * item's properties "scene", "project" and "webGL".
	 * @param {Scene} scene
	 * @param {Boolean} system Defines object type: system or regular
	 * @method
	 * @example
	 * var item = new Item(options);
	 *
	 * var scene = new Scene('main');
	 *
	 * item.instance(scene, true);
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
			this.scene_ = scene;
			this.project_ = scene.project;
			this.webGL_ = this.project.webGLRenderer.webGL;

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
	 * Returns {@link Mat4} modified by {@link Body}'s position,
	 * rotation and scale, also include relation of body's
	 * parents.
	 * @return {Mat4}
	 * @method
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

			if (amc('=', body.position, cell.position) &&
				amc('=', body.rotation, cell.rotation) &&
				amc('=', body.scale, cell.scale)) {
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
				matU = amc('*', matT, matR, matS);
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

	/**
	 * Sets the uniform value as default value of this type.
	 * Uniform can not be removed so it's the only way, to
	 * clear it.
	 * @param  {String} key Uniform name
	 * @param  {Object} out Rewritable object
	 * @method
	 * @example
	 * var item = new Item(options);
	 *
	 * var uniforms = {};
	 *
	 * item.initializeUniform('u_Count', 5, uniforms);
	 * uniforms;  // Object {u_MVMatrix: {location, type, method, value: 5}}
	 * item.nullifyUniform('u_Count', uniforms);
	 * uniforms;  // Object {u_MVMatrix: {location, type, method, value: 0}}
	 */
	nullifyUniform(key, out) {
		var uniform = out[key];
		console.log(key);

		switch (uniform.type) {
			case 'mat':
			switch (uniform.method) {
				case 'uniformMatrix4fv':
				uniform.value = DEFAULT_VALUES.mat4;
				break;

				case 'uniformMatrix3fv':
				uniform.value = DEFAULT_VALUES.mat3;
				break;

				case 'uniformMatrix2fv':
				uniform.value = DEFAULT_VALUES.mat2;
				break;
			}
			break;

			case 'vec':
			switch (uniform.method) {
				case 'uniform4fv':
				uniform.value = DEFAULT_VALUES.vec4;
				break;

				case 'uniform3fv':
				uniform.value = DEFAULT_VALUES.vec3;
				break;

				case 'uniform2fv':
				uniform.value = DEFAULT_VALUES.vec2;
				break;
			}
			break;

			case 'col':
			uniform.value = DEFAULT_VALUES.col;
			break;

			case 'qua':
			uniform.value = DEFAULT_VALUES.qua;
			break;

			case 'eul':
			uniform.value = DEFAULT_VALUES.eul;
			break;

			case 'img':
			uniform.value = DEFAULT_VALUES.img;
			break;

			case 'num':
			uniform.value = DEFAULT_VALUES.num;
			break;
		}
	}

	/**
	 * Called after item instantiation
	 * @method
	 * @callback
	 */
	oninstance() {
	}

	/**
	 * Called after {@link Project} initialization on each frame
	 * @method
	 * @callback
	 */
	onupdate() {
	}

	/**
	 * Called after item remove
	 * @method
	 * @callback
	 */
	onremove() {
	}

	get private() {
		return this.private_;
	}

	get project() {
		return this.project_;
	}

	get public() {
		return this.public_;
	}

	/**
	 * Removes item from {@link Scene}'s objects. After
	 * remove item can not be instantiated again, it needs
	 * to create new item.
	 * @method
	 */
	remove() {
		if (this.onremove) {
			this.onremove();
		}

		this.scene.removeItem(this);
	}

	/**
	 * Sets the rotation of item's {@link Body} by {@link Vec3}.
	 * @param {Vec3} vec
	 * @method
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

	get scene() {
		return this.scene_;
	}

	/**
	 * Calls updateAttribute, updateUniform and activeTexture for
	 * every attribute, uniform and texture in shader.
	 * @method
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

	/**
	 * Sends all valid attribute-buffers to shader.
	 * @param {Object} options
	 * @param  {WebGLBuffer} options.buffer
	 * @param  {WebGLLocation} options.location
	 * @param  {Number} options.size
	 * @method
	 */
	updateAttribute({buffer, location, size} = {}) {
		var gl = this.webGL;

		if (location >= 0) {
			gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
			gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0);
			gl.enableVertexAttribArray(location);
			gl.bindBuffer(gl.ARRAY_BUFFER, null);
		}
	}

	/**
	 * Sends all valid uniform-values to shader.
	 * @param {Object} options
	 * @param  {Boolean} options.isActive
	 * @param  {String} options.type
	 * @param  {String} options.method
	 * @param  {WebGLLocation} options.location
	 * @param  {Mat | Vec | Color | Euler | Quaternion |
	 * Image | Number | Array | Object} options.value
	 * @method
	 */
	updateUniform({isActive, type, method, location, counter, value}) {
		if (isActive) {
			return;
		}

		var gl = this.webGL;

		if (!location) {
			return;
		}

		switch (type) {
			case 'mat':
			gl[method](location, null, new Float32Array(value.array()));
			break;

			case 'col':
			value = value.tounit();
			case 'vec':
			case 'eul':
			case 'qua':
			gl[method](location, new Float32Array(value.array()));
			break;

			case 'img':
			value = counter;
			case 'num':
			gl[method](location, value);
			break;
		}
	}

	get webGL() {
		return this.webGL_;
	}
}

/**
 * Contains default values for every available
 * uniform-types. Used to {@link Item.nullifyUniform}.
 * @type {Object}
 * @constant
 */
const DEFAULT_VALUES = {
	mat4: new Mat4(0),
	mat3: new Mat3(0),
	mat2: new Mat2(0),
	vec4: new Vec4,
	vec3: new Vec3,
	vec2: new Vec2,
	col: new Color(0, 0, 0, 0),
	qua: new Quaternion(0, 0, 0, 0),
	eul: new Euler(0, 0, 0),
	img: new Image,
	num: 0
};