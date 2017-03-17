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
	set shader(val) {
		if (val && !(val instanceof Shader) &&
			!(val instanceof ShaderTemplate)) {
			throw new Error('Mesh: shader: must be a Shader or ShaderTemplate');
		}

		this.shader_ = val;
	}

	get drawStyle() {
		return this.drawStyle_;
	}
	set drawStyle(val) {
		if (typeof val !== 'string') {
			throw new Error('Mesh: drawStyle: must be a string');
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
			throw new Error('Mesh: attributes: must be an object');
		}

		this.attributes_ = val;
	}

	get uniforms() {
		return this.uniforms_;
	}
	set uniforms(val) {
		if (typeof val !== 'object') {
			throw new Error('Mesh: uniforms: must be an object');
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
	 * Initializes vertexIndices array and crates buffer.
	 * @param {WebGLContext} gl
	 * @param {Array} val
	 * @method
	 */
	setVIOBuffer(gl, val) {
		var buffer = gl.createBuffer();

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(val), gl.STATIC_DRAW);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

		buffer.length = val.length;

		this.VIOBuffer_ = buffer;
	}

	get VIOBuffer() {
		return this.VIOBuffer_;
	}
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
