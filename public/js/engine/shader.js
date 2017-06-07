/**
 * Contains vertex shader and fragment shader,
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
function Shader(webGL, vertexShader, fragmentShader, options = {}) {
    this.webGL = webGL;
    this.vertexShader = vertexShader;
    this.fragmentShader = fragmentShader;
    this.options = options;

    this.attributes = {};
    this.uniforms = {};

    this.initialize();
}

Object.defineProperties(Shader.prototype, {
    fragmentShader: {
        get: function() {
            return this.fragmentShader_;
        },
        set: function(val) {
            if (typeof val !== 'string') {
                warn('Shader#fragmentShader', 'val', val);
                val = 'void main() {}';
            }

            this.fragmentShader_ = val;
        }
    },
    options: {
        get: function() {
            return this.options_;
        },
        set: function(val) {
            if (typeof val !== 'object') {
                warn('Shader#options', 'val', val);
                val = {};
            }

            this.options_ = val;
        }
    },
    program: {
    	get: function() {
    		return this.program_;
    	}
    },
    vertexShader: {
        get: function() {
            return this.vertexShader_;
        },
        set: function(val) {
            if (typeof val !== 'string') {
                warn('Shader#vertexShader', 'val', val);
                val = 'void main() {}';
            }

            this.vertexShader_ = val;
        }
    },
    webGL: {
        get: function() {
            return this.webGL_;
        },
        set: function(val) {
            if (!(val instanceof WebGLRenderingContext)) {
                error('Shader#webGL', 'val', val);
            }

            this.webGL_ = val;
        }
    }
});

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
Shader.prototype.initialize = function() {
    var gl = this.webGL;
    var vertexShader = this.vertexShader,
        fragmentShader = this.fragmentShader;
    var options = this.options;
    var vs = gl.createShader(gl.VERTEX_SHADER),
        fs = gl.createShader(gl.FRAGMENT_SHADER);

    gl.shaderSource(vs, vertexShader);
    gl.compileShader(vs);

    if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
        errorfree(`Shader#initialize: vertex shader error: ${gl.getShaderInfoLog(vs)}`);
    }

    gl.shaderSource(fs, fragmentShader);
    gl.compileShader(fs);

    if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
        errorfree(`Shader#initialize: fragment shader error: ${gl.getShaderInfoLog(fs)}`);
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
    } else {
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
    } else {
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    }

    if (typeof options.polygonOffset === 'object') {
        var po = options.polygonOffset;
        gl.polygonOffset(po.factor, po.units);
        gl.enable(gl.POLYGON_OFFSET_FILL);
    }

    this.program_ = program;
}

Shader.prototype.useProgram = function() {
    if (!Shader.checkIsLastShader(this)) {
        this.webGL.useProgram(this.program);
    }
}

Shader.checkIsLastShader = function(shader) {
    var result = (shader === Shader.lastUsedShader);
    Shader.lastUsedShader = shader;
    return result;
}
