class Mesh {
	constructor({
		shader,
		vertexIndices = [],
		drawStyle = 'TRIANGLES',
		attributes = {},
		uniforms = {},
		textures = {}
	} = {}) {
		this.attributes = attributes;
		this.uniforms = uniforms;
		this.shader = shader;
		this.vertexIndices = vertexIndices;
		this.textures = textures;
		this.drawStyle = drawStyle;
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

	get drawStyle() {
		return this.drawStyle_;
	}

	set drawStyle(val) {
		if (typeof val === 'string') {
			this.drawStyle_ = val;
		}
		else {
			console.warn('Mesh: drawStyle: error');
		}
	}

	get shader() {
		return this.shader_;
	}

	set shader(val) {
		if (!val || val instanceof Shader) {
			this.shader_ = val;
		}
		else {
			console.warn('Mesh: shader: error');
		}
	}

	get textures() {
		return this.textures_;
	}

	set textures(val) {
		this.textures_ = val;
	}

	get vertexIndices() {
		return this.vertexIndices_;
	}

	set vertexIndices(val) {
		if (val instanceof Array) {
			this.vertexIndices_ = val;
		}
		else {
			console.warn('Mesh: vertexIndices: error');
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
}
