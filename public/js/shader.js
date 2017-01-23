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

		this.attributesDefines = {};
		this.attributesStorage = {};
		this.uniformsDefines = {};
		this.uniformsStorage = {};
		this.texturesCount = -1;
		this.id = GUID();
	}

	get attributesDefines() {
		return this.attributesDefines_;
	}

	set attributesDefines(val) {
		if (typeof val === 'object') {
			this.attributesDefines_ = val;
		}
		else {
			console.warn('Shader: attributesDefines: error');
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

	get uniformsDefines() {
		return this.uniformsDefines_;
	}

	set uniformsDefines(val) {
		if (typeof val === 'object') {
			this.uniformsDefines_ = val;
		}
		else {
			console.warn('Shader: uniformsDefines: error');
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

	get texturesCount() {
		return this.texturesCount_;
	}

	set texturesCount(val) {
		if (typeof val === 'number') {
			this.texturesCount_ = val;
		}
		else {
			console.warn('Program: texturesCount: error');
		}
	}
}

var guid = [];
function GUID() {
	function path() {
		return (Math.random() * 8999 + 1000).toFixed(0);
	}
	var key = `${path()}-${path()}-${path()}`;
	if (guid.indexOf(key) === -1) {
		guid.push(key);
		return key;
	}
	else {
		return GUID();
	}
}
