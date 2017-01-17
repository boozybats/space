class Shader {
	constructor(vertexShader, fragmentShader) {
		this.vertexShader = vertexShader;
		this.fragmentShader = fragmentShader;
	}

	get fragmentShader() {
		return this.fragmentShader_;
	}

	set fragmentShader(val) {
		if (typeof val === 'string') {
			this.fragmentShader_ = val;
		}
		else {
			console.warn('Shader: fragmentShader: error');
		}
	}

	initialize(gl) {
		if (!(gl instanceof WebGLRenderingContext)) {
			console.warn('Shader: initialize: error');
		}

		var vertexShader = this.vertexShader,
			fragmentShader = this.fragmentShader;
		var vs = gl.createShader(gl.VERTEX_SHADER),
			fs = gl.createShader(gl.FRAGMENT_SHADER);

		gl.shaderSource(vs, vertexShader);
		gl.compileShader(vs);

		if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
			console.warn(`Initialization vertex shader error: ${gl.getShaderInfoLog(vs)}`);
			gl.deleteShader(vs);
			return false;
		}

		gl.shaderSource(fs, fragmentShader);
		gl.compileShader(fs);

		if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
			console.warn(`Initialization fragment shader error: ${gl.getShaderInfoLog(fs)}`);
			gl.deleteShader(fs);
			return false;
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

		var out = new Program(program);
		return out;
	}

	get vertexShader() {
		return this.vertexShader_;
	}

	set vertexShader(val) {
		if (typeof val === 'string') {
			this.vertexShader_ = val;
		}
		else {
			console.warn('Shader: vertexShader: error');
		}
	}
}

class Program {
	constructor(program) {
		this.program = program;

		this.attributesStorage = {};
		this.attributesLocation = {};
		this.texturesLocation = {};
		this.uniformsStorage = {};
		this.uniformsLocation = {};
	}

	get attributesLocation() {
		return this.attributesLocation_;
	}

	set attributesLocation(val) {
		if (typeof val === 'object') {
			this.attributesLocation_ = val;
		}
	}

	get attributesStorage() {
		return this.attributesStorage_;
	}

	set attributesStorage(val) {
		if (typeof val === 'object') {
			this.attributesStorage_ = val;
		}
	}

	get program() {
		return this.program_;
	}

	set program(val) {
		this.program_ = val;
	}

	get texturesLocation() {
		return this.texturesLocation_;
	}

	set texturesLocation(val) {
		if (typeof val === 'object') {
			this.texturesLocation_ = val;
		}
	}

	get uniformsStorage() {
		return this.uniformsStorage_;
	}

	set uniformsStorage(val) {
		if (typeof val === 'object') {
			this.uniformsStorage_ = val;
		}
		else {
			console.warn('Shader: uniformsStorage: error');
		}
	}

	get uniformsLocation() {
		return this.uniformsLocation_;
	}

	set uniformsLocation(val) {
		if (typeof val === 'object') {
			this.uniformsLocation_ = val;
		}
		else {
			console.warn('Shader: uniformsLocation: error');
		}
	}
}
