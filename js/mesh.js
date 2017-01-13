class Mesh {
	constructor(shader, vertexIndicesArray, {
		drawStyle = 'TRIANGLES',
		textures
	}) {
		this.shader = shader;
		this.vertexIndicesArray = vertexIndicesArray;
		this.textures = textures;
		this.drawStyle = drawStyle;
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
		if (val instanceof Shader) {
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

	get vertexIndicesArray() {
		return this.vertexIndicesArray_;
	}

	set vertexIndicesArray(val) {
		this.vertexIndicesArray_ = val;
	}
}
