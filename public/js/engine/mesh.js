/**
 * Mesh contains info about item's shader, attributes,
 * uniforms, vertex-indices, e.t.c. This class needs to
 * send all info about item to shader
 *
 * @constructor
 * @this {Mesh}
 *  {webGLBuffer} VIOBuffer Initialized buffer of vertexIndices
 * @param {Shader} shader
 * @param {string} drawStyle WebGL type of drawning
 * @param {number[]} vertexIndices
 * @param {object} attributes
 * @param {object} uniforms
 */

class Mesh {
	constructor({
		shader,
		drawStyle = 'TRIANGLES',
		vertexIndices = [],
		attributes = {},
		uniforms = {}
	} = {}) {
		this.shader = shader;
		this.drawStyle = drawStyle;
		this.vertexIndices = vertexIndices;
		this.attributes = attributes;
		this.uniforms = uniforms;
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

	get program() {
		if (this.shader) {
			return this.shader.program;
		}
	}

	setVIOBuffer(gl, val) {
		var buffer = gl.createBuffer();

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(val), gl.STATIC_DRAW);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

		buffer.length = val.length;

		this.VIOBuffer = buffer;
	}
}
