/**
 * Containt vertex shader and fragment shader,
 * must be initialized to get WebGLShader.
 * @this {ShaderTemplate}
 * @param {String} vertexShader
 * @param {String} fragmentShader
 * @class
 */

class ShaderTemplate {
	constructor(vertexShader, fragmentShader) {
		this.vertexShader = vertexShader;
		this.fragmentShader = fragmentShader;
	}

	/**
	 * Initalizes vertex and fragment shaders, throw errors if
	 * founded, return new constructor Shader with program. Must
	 * be initialized for item, each item must have own shader.
	 * Usualy function are called by {@link Item#instance}.
	 * @param {WebGLContext} gl
	 * @return {Shader}
	 * @method
	 */
	initialize(gl) {
		var vertexShader = this.vertexShader,
			fragmentShader = this.fragmentShader;
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

		gl.enable(gl.DEPTH_TEST);
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

		var out = new Shader(program);
		out.template = this;
		
		return out;
	}
}

/**
 * Initialized shader with WebGLShader, contains data about
 * uniforms, attributes, textures of item. Generates unique id for
 * shader to determine which shader has been used the last one.
 * @this {Shader}
 * @param {WebGLProgram} program
 * @class
 * @property {Object} attributes
 * @property {Object} uniforms
 * @property {Object} textures
 * @property {Number} texturesCount
 * @property {Number} id
 */

class Shader {
	constructor(program, error) {
		// if mixed up Shader and ShaderTemplate
		if (typeof program === 'string' && typeof error === 'string') {
			throw new Error('Shader: you must use ShaderTemplate instead of Shader');
		}

		this.program = program;
		this.attributes = {};
		this.uniforms = {};
		this.textures = {};
		this.texturesCount = 0;
		this.id = GUID();
	}
}
