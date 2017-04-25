/**
 * Containts vertex shader and fragment shader,
 * must be initialized to get WebGLShader.
 * @this {Shader}
 * @param {String} vertexShader
 * @param {String} fragmentShader
 * @class
 * @property {Object} attributes
 * @property {Object} uniforms
 * @property {Object} textures
 * @property {Number} texturesCount
 * @property {Number} id
 * P.S. Better create all shaders at start of the project, so it will be
 * loaded once and wont slow a process.
 */

class Shader {
	constructor(webGL, vertexShader, fragmentShader, options = {}) {
		this.webGL = webGL;
		this.vertexShader = vertexShader;
		this.fragmentShader = fragmentShader;
		this.options = options;

		this.id = GUID();

		var collection = new Storage;
		collection.filter = (data => typeof data === 'object');
		collection.onadd = function(data) {
			data.attributes    = {};
			data.uniforms      = {};
			data.textures      = {};
			data.texturesCount = 0;
		}
		this.collection = collection;

		this.initialize();
	}

	get webGL() {
		return this.webGL_;
	}
	set webGL(val) {
		if (!(val instanceof WebGLRenderingContext)) {
			throw new Error(`Shader: webGL: must be a WebGLRenderingContext, value: ${val}`);
		}

		this.webGL_ = val;
	}

	get fragmentShader() {
		return this.fragmentShader_;
	}
	set fragmentShader(val) {
		if (typeof val !== 'string') {
			throw new Error(`Shader: fragmentShader: must be a string, value: ${val}`);
		}

		this.fragmentShader_ = val;
	}

	get vertexShader() {
		return this.vertexShader_;
	}
	set vertexShader(val) {
		if (typeof val !== 'string') {
			throw new Error(`Shader: vertexShader: must be a string, value: ${val}`);
		}

		this.vertexShader_ = val;
	}

	get options() {
		return this.options_;
	}
	set options(val) {
		if (typeof val !== 'object') {
			val = {};
		}

		this.options_ = val;
	}

	/**
	 * Initalizes vertex and fragment shaders, throw errors if
	 * founded, return new constructor Shader with program. Must
	 * be initialized for item, each item must have own shader.
	 * Usualy function are called by {@link Item#instance}.
	 * @param {WebGLRenderingContext} gl
	 * @param {Object} options Shader native options.
	 * @return {Shader}
	 * @method
	 */
	initialize() {
		var gl = this.webGL;
		var vertexShader = this.vertexShader,
			fragmentShader = this.fragmentShader;
		var options = this.options;
		var vs = gl.createShader(gl.VERTEX_SHADER),
			fs = gl.createShader(gl.FRAGMENT_SHADER);

		gl.shaderSource(vs, vertexShader);
		gl.compileShader(vs);

		if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
			throw new Error(`Initialization vertex shader error: ${gl.getShaderInfoLog(vs)}`);
		}

		gl.shaderSource(fs, fragmentShader);
		gl.compileShader(fs);

		if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
			throw new Error(`Initialization fragment shader error: ${gl.getShaderInfoLog(fs)}`);
		}

		var program = gl.createProgram();

		gl.attachShader(program, vs);
		gl.attachShader(program, fs);

		gl.linkProgram(program);
		gl.useProgram(program);

		gl.detachShader(program, vs);
		gl.detachShader(program, fs);

		gl.enable(gl.CULL_FACE);
		if (typeof options.CULL_FACE !== 'undefined') {
			gl.cullFace(options.CULL_FACE);
		}
		else {
			gl.cullFace(gl.FRONT);
		}

		if (options.DEPTH_TEST !== false) {
			gl.enable(gl.DEPTH_TEST);
		}

		if (options.BLEND !== false) {
			gl.enable(gl.BLEND);
		}

		if (typeof options.blendFunc === 'object') {
			var bf = options.blendFunc;
			gl.blendFunc(bf.srcalpha, bf.oneminussrcalpha);
		}
		else {
			gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		}

		if (typeof options.polygonOffset === 'object') {
			var po = options.polygonOffset;
			gl.polygonOffset(po.factor, po.units);
			gl.enable(gl.POLYGON_OFFSET_FILL);
		}

		this.program_ = program;
	}

	get program() {
		return this.program_;
	}

	useProgram() {
		this.webGL.useProgram(this.program);
	}
}
