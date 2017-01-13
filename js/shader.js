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

		return program;
	
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
