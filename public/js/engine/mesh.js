/**
 * Mesh contains item's shader, material, uniforms, etc.
 * Initializes forms to send in shader after instantiation.
 * @this {Mesh}
 * @param {Object} options
 * @param {Shader} options.shader
 * @param {String} options.drawStyle How to connect vertices on WebGL context.
 * LINES, LINE_STRIP, LINE_LOOP, TRIANGLES, TRIANGLE_STRIP, TRIANGLE_FAN,
 * POINTS.
 * @param {Array} options.vertexIndices
 * @param {Object} options.attributes
 * @param {Object} options.uniforms
 * @param {Material} options.material
 * @class
 * @property {Shader} shader
 * @property {String} drawStyle How to connect vertices on WebGL context.
 * LINES, LINE_STRIP, LINE_LOOP, TRIANGLES, TRIANGLE_STRIP, TRIANGLE_FAN,
 * POINTS.
 * @property {Array} vertexIndices
 * @property {Object} attributes
 * @property {Object} uniforms
 * @property {Material} material
 * @property {webGLBuffer} VIOBuffer Initialized buffer of vertexIndices.
 */

class Mesh {
	constructor({
		shader,
		drawStyle = 'TRIANGLES',
		vertexIndices = [],
		attributes = {},
		uniforms = {},
		material = new Material
	} = {}) {
		this.shader = shader;
		this.drawStyle = drawStyle;
		this.vertexIndices = vertexIndices;
		this.attributes = attributes;
		this.uniforms = uniforms;
		this.material = material;
	}

	get shader() {
		return this.shader_;
	}
	set shader(shader) {
		if (shader && !(shader instanceof Shader)) {
			throw new Error('Mesh: shader: must be a Shader');
		}

		this.shader_ = shader;

		if (shader) {
			this.webGL = shader.webGL;

			this.shaderdata = {};
			shader.collection.push(this.shaderdata);

			this.changeAttributes(this.attributes);
			this.changeUniforms(this.uniforms);

			this.setVIOBuffer();
		}
		else {
			this.webGL = undefined;
			this.shaderdata = undefined;
		}
	}

	get drawStyle() {
		return this.drawStyle_;
	}
	set drawStyle(val) {
		if (typeof val !== 'string') {
			val = 'TRIANGLES';
		}

		this.drawStyle_ = val;
	}

	get vertexIndices() {
		return this.vertexIndices_;
	}
	set vertexIndices(val) {
		if (!(val instanceof Array)) {
			throw new Error('Mesh: vertexIndices: must be an Array');
		}

		this.vertexIndices_ = val;
	}

	get attributes() {
		return this.attributes_;
	}
	set attributes(val) {
		if (typeof val !== 'object') {
			val = {};
		}

		this.attributes_ = val;
	}

	get uniforms() {
		return this.uniforms_;
	}
	set uniforms(val) {
		if (typeof val !== 'object') {
			val = {};
		}

		this.uniforms_ = val;
	}

	get material() {
		return this.material_;
	}
	set material(val) {
		if (!(val instanceof Material)) {
			throw new Error('Mesh: material: must be a Material');
		}

		this.material_ = val;
	}

	get program() {
		if (this.shader) {
			return this.shader.program;
		}
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
	 * var index = item.addImage(img);  // 0
	 */
	addImage(image) {
		var gl = this.webGL;
		var shader = this.shader;

		// if image didn't load yet then temporarily replace it with system picture
		var buffer = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, buffer);
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

		// If default image selected
		if (shader.options.transparentImage) {
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, shader.options.transparentImage);
		}

		gl.bindTexture(gl.TEXTURE_2D, null);

		image.onload = function() {
			gl.bindTexture(gl.TEXTURE_2D, buffer);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this);
			gl.bindTexture(gl.TEXTURE_2D, null);
		}
		// update onload event (if it was yet)
		image.src = image.src;

		var index = this.addTexture(buffer);

		return index;
	}

	/**
	 * Adds texture buffer to shader.
	 * @param {WebGLBuffer} buffer
	 * @method
	 */
	addTexture(buffer) {
		var data = this.shaderdata;

		var index = data.texturesCount++;
		data.textures[index] = buffer;

		return index;
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
		if (!this.shader) {
			console.warn('Mesh: changeAttributes: attributes can not be applied without binded shader');
			return;
		}

		var data = this.shaderdata;

		for (var i in options) {
			if (options.hasOwnProperty(i)) {
				var val = options[i];

				this.initializeAttribute(i, val, data.attributes);
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
		if (!this.shader) {
			console.warn('Mesh: changeAttributes: attributes can not be applied without binded shader');
			return;
		}

		var data = this.shaderdata;

		for (var i in options) {
			if (options.hasOwnProperty(i)) {
				var val = options[i];

				this.initializeUniform(i, val, data.uniforms);
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
		var shader = this.shader,
			program = this.program;

		if (!checkIsLastShader(shader)) {
			shader.useProgram();
		}

		var size = val.size;
		if (typeof size === 'undefined') {
			console.warn(`Item: initializeAttribute: Not selected size for attribute '${key}'`);
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
	 * Image | WebGLTexture | Number | Array | Object} val
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
		var shader = this.shader,
			program = this.program;

		if (!checkIsLastShader(shader)) {
			shader.useProgram();
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
			type = 'tex';
			location = getlocation();
			counter = this.addImage(value);
		}
		else if (value instanceof WebGLTexture) {
			method = 'uniform1i';
			type = 'tex';
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
					var nkey = key.replace(/([\.\[\]])/g, '\\$1');
					var regexp = new RegExp(`^${nkey}\\[(\\d+)\\]`, '');
					var match = i.match(regexp);

					if (match) {
						var ind = match[1] - 0;

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

		var value, count;
		switch (uniform.type) {
			case 'mat':
			switch (uniform.method) {
				case 'uniformMatrix4fv':
				value = DEFAULT_VALUES.mat4;
				break;

				case 'uniformMatrix3fv':
				value = DEFAULT_VALUES.mat3;
				break;

				case 'uniformMatrix2fv':
				value = DEFAULT_VALUES.mat2;
				break;
			}
			break;

			case 'vec':
			switch (uniform.method) {
				case 'uniform4fv':
				value = DEFAULT_VALUES.vec4;
				break;

				case 'uniform3fv':
				value = DEFAULT_VALUES.vec3;
				break;

				case 'uniform2fv':
				value = DEFAULT_VALUES.vec2;
				break;
			}
			break;

			case 'col':
			value = DEFAULT_VALUES.col;
			break;

			case 'qua':
			value = DEFAULT_VALUES.qua;
			break;

			case 'eul':
			value = DEFAULT_VALUES.eul;
			break;

			case 'tex':
			count = DEFAULT_VALUES.tex;
			break;

			case 'num':
			value = DEFAULT_VALUES.num;
			break;
		}

		uniform.count = count;
		uniform.value = value;
		this.updateUniform(uniform);

		delete out[key];
	}

	/**
	 * Initializes vertexIndices array and crates buffer.
	 * @method
	 */
	setVIOBuffer() {
		var gl = this.webGL;
		var indices = this.vertexIndices;

		var buffer = gl.createBuffer();

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

		buffer.size = indices.length;

		this.VIOBuffer_ = buffer;
	}

	/**
	 * Calls updateAttribute, updateUniform and activeTexture for
	 * every attribute, uniform and texture in shader.
	 * @method
	 */
	update(lastUsedShader) {
		var gl = this.webGL;
		var data = this.shaderdata,
			attributes = data.attributes,
			uniforms = data.uniforms,
			textures = data.textures;

		for (var i in attributes) {
			if (attributes.hasOwnProperty(i)) {
				this.updateAttribute(attributes[i]);
			}
		}

		for (var i in uniforms) {
			if (uniforms.hasOwnProperty(i)) {
				var uniform = uniforms[i];
				this.updateUniform(uniform);
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
	updateAttribute({
		buffer,
		location,
		size
	} = {}) {
		var gl = this.webGL;
		var shader = this.shader;

		if (!checkIsLastShader(shader)) {
			shader.useProgram();
		}

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
	updateUniform({
		type,
		method,
		location,
		counter,
		value
	} = {}) {
		if (!location) {
			return;
		}

		var gl = this.webGL;
		var shader = this.shader;

		if (!checkIsLastShader(shader)) {
			shader.useProgram();
		}

		switch (type) {
			case 'mat':
			gl[method](location, null, new Float32Array(value.columnmajor()));
			break;

			case 'col':
			value = value.tounit();
			case 'vec':
			case 'eul':
			case 'qua':
			gl[method](location, new Float32Array(value.array()));
			break;

			case 'tex':
			value = counter;
			case 'num':
			gl[method](location, value);
			break;
		}
	}

	get VIOBuffer() {
		return this.VIOBuffer_;
	}

	get webGL() {
		return this.webGL_;
	}
	set webGL(val) {
		if (val && !(val instanceof WebGLRenderingContext)) {
			throw new Error(`Mesh: webGL: must be a WebGLRenderingContext, value: ${val}`);
		}

		this.webGL_ = val;
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
	col:  new Color(0, 0, 0, 0),
	qua:  new Quaternion(0, 0, 0, 0),
	eul:  new Euler(0, 0, 0),
	tex:  0,
	num:  0
};

var lastUsedShader;
function checkIsLastShader(shader) {
	lastUsedShader = shader;
	return (shader === lastUsedShader);
}

/**
 * Sends data about mesh's material in shader.
 * @this {Material}
 * @param {Object} options
 * @param {Image} options.ambient Shadow's color in item's surface.
 * @param {Image} options.diffuse Main color of the object.
 * @param {Image} options.specular Shininess color.
 * @class
 * @property {Image} ambient Shadow's color in item's surface.
 * @property {Image} diffuse Main color of the object.
 * @property {Image} specular Shininess color.
 */

class Material {
	constructor({
		ambient = new Color(0, 0, 0, 1),
		diffuse = new Color(161, 250, 206, 1),
		specular = new Color(230, 255, 247, 1),
		ambientmap,
		diffusemap,
		specularmap,
		normalmap
	} = {}) {
		this.ambient = ambient;
		this.diffuse = diffuse;
		this.specular = specular;
		this.ambientmap = ambientmap;
		this.diffusemap = diffusemap;
		this.specularmap = specularmap;
		this.normalmap = normalmap;
	}

	get ambient() {
		return this.ambient_;
	}
	set ambient(val) {
		if (!(val instanceof Color)) {
			throw new Error('Material: ambient: must be a Color');
		}

		this.ambient_ = val;
	}

	get diffuse() {
		return this.diffuse_;
	}
	set diffuse(val) {
		if (!(val instanceof Color)) {
			throw new Error('Material: diffuse: must be a Color');
		}

		this.diffuse_ = val;
	}

	get specular() {
		return this.specular_;
	}
	set specular(val) {
		if (!(val instanceof Color)) {
			throw new Error('Material: specular: must be a Color');
		}

		this.specular_ = val;
	}

	get ambientmap() {
		return this.ambientmap_;
	}
	set ambientmap(val) {
		if (val && !(val instanceof Image)) {
			throw new Error('Material: ambientmap: must be an image');
		}

		this.ambientmap_ = val;
	}

	get diffusemap() {
		return this.diffusemap_;
	}
	set diffusemap(val) {
		if (val && !(val instanceof Image)) {
			throw new Error('Material: diffusemap: must be an image');
		}

		this.diffusemap_ = val;
	}

	get specularmap() {
		return this.specularmap_;
	}
	set specularmap(val) {
		if (val && !(val instanceof Image)) {
			throw new Error('Material: specularmap: must be an image');
		}

		this.specularmap_ = val;
	}

	get normalmap() {
		return this.normalmap_;
	}
	set normalmap(val) {
		if (val && !(val instanceof Image)) {
			throw new Error('Material: normalmap: must be an image');
		}

		this.normalmap_ = val;
	}

	/**
	 * Returns an object with material's data.
	 * @return {Object}
	 * @method
	 */
	data() {
		var out = {};

		if (this.ambient) {
			out.ambient = this.ambient;
		}
		if (this.diffuse) {
			out.diffuse = this.diffuse;
		}
		if (this.specular) {
			out.specular = this.specular;
		}
		if (this.normalmap) {
			out.normalmap = this.normalmap;
		}
		if (this.ambientmap) {
			out.ambientmap = this.ambientmap;
		}
		if (this.diffusemap) {
			out.diffusemap = this.diffusemap;
		}
		if (this.specularmap) {
			out.specularmap = this.specularmap;
		}
		if (this.normalmap) {
			out.normalmap = this.normalmap;
		}

		return out;
	}
}
