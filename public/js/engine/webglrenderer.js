/**
 * Initializes WebGLRendererContext with selected
 * attributes.
 * @this {WebGLRenderer}
 * @param {Object} options
 * @param {Project} options.project
 * @param {Object} options.attributes WebGLRenderingContext attributes:
 * Boolean antialias, Boolean alpha, Boolean willReadFrequently,
 * String storage, Number depth, Number stencil, Boolean premultipliedAlpha,
 * Boolean preserveDrawingBuffer, Boolean failIfMajorPerformanceCaveat.
 * @class
 * @property {WebGLRenderingContext} webGL
 * @property {Canvas} canvas
 */
function WebGLRenderer(options = {}) {
    if (typeof options !== 'object') {
        warn('WebGLRenderer', 'options', options);
        options = {};
    }

    var project = options.project;
    if (!(project instanceof Project)) {
        error('WebGLRenderer', 'project', project);
    }

    var webglattributes = options.webglattributes;
    if (typeof webglattributes !== 'object') {
        webglattributes = {
            antialias: false,
            alpha: true,
            willReadFrequently: false,
            storage: 'persistent',
            depth: 16,
            stencil: 8,
            premultipliedAlpha: false,
            preserveDrawingBuffer: true,
            failIfMajorPerformanceCaveat: false
        };
    }

    var gl;
    var canvas = project.canvas.canvas;
    var methods = ['webgl', 'experimental-webgl', 'webkit-3d', 'moz-webgl'];

    for (var i = 0; i < methods.length; i++) {
        var method = methods[i];

        try {
            gl = canvas.getContext(method, webglattributes);
            if (!gl) {
                delete webglattributes.failIfMajorPerformanceCaveat;
                gl = canvas.getContext(method, webglattributes);
                if (!gl) {
                    gl = canvas.getContext(method);
                    if (gl) {
                        warnfree('WebGLRenderer: wrong attributes');
                    }
                }
            }
        } catch (e) {}

        if (gl) {
            break;
        }
    }

    if (!gl) {
        errorfree('WebGLRenderer: cant create WebGLRenderingContext');
    }

    this.project = project;
    this.canvas_ = canvas;
    this.webGL_ = gl;

    this.initializeRenderer(options.attributes || {});
}

Object.defineProperties(WebGLRenderer.prototype, {
    canvas: {
        get: function() {
            return this.canvas_;
        }
    },
    frameBuffer: {
        get: function() {
            return this.frameBuffer_;
        }
    },
    frameTexture: {
        get: function() {
            return this.frameTexture_;
        }
    },
    project: {
        get: function() {
            return this.project_;
        },
        set: function(val) {
            if (!(val instanceof Project)) {
                error('WebGLRenderer', 'val', val);
            }

            this.project_ = val;
        }
    },
    webGL: {
        get: function() {
            return this.webGL_;
        }
    }
});

/**
 * Creates framebuffer for antialiasing.
 * @method
 */
WebGLRenderer.prototype.createframe = function(multiplier) {
    if (typeof multiplier !== 'number') {
        warn('WebGLRenderer#createframe', 'multiplier', multiplier);
        multiplier = 1;
    }

    var canvas = this.canvas,
        width = canvas.width,
        height = canvas.height;

    this.viewportWidth = width;
    this.viewportHeight = height;

    var sizex = multiplier * width, // Math.ceilPowerOfTwo(multiplier * width),
        sizey = multiplier * height; //Math.ceilPowerOfTwo(multiplier * height);

    var gl = this.webGL;
    var buffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, buffer);
    buffer.viewportWidth = sizex;
    buffer.viewportHeight = sizey;

    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, sizex, sizey, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    // gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

    var renderbuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, sizex, sizey);

    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderbuffer);

    var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    if (status !== gl.FRAMEBUFFER_COMPLETE) {
        errorfree('WebGLRenderer#createframe: unavailabe to create framebuffer');
    }

    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    return {
        buffer,
        texture
    };
}

WebGLRenderer.prototype.initializeRenderer = function(attributes = {}) {
    if (typeof attributes !== 'object') {
        warn('WebGLRenderer#initializeRenderer', 'attributes', attributes);
        attributes = {};
    }

    var self = this,
        gl = this.webGL;
    var shader, buffer, texture;

    var type = attributes.antialias;

    switch (type) {
        case 'FXAAx2':
            FXAAx2();
            break;

        case 'FXAAx4':
            FXAAx4();
            break;

        default:
            NOAA();
            break;
    }

    this.renderer = new Renderer({
        gl: this.webGL,
        viewportWidth: this.viewportWidth,
        viewportHeight: this.viewportHeight,
        shader,
        buffer,
        texture
    });

    function NOAA() {
        shader = new Shader(
            gl,

            `attribute vec3 a_Position;
                attribute vec2 a_UV;

                varying vec2 v_UV;

                void main() {
                    gl_Position = vec4(a_Position, 1.0);

                    v_UV = a_UV;
                }`,
            `precision highp float;

                uniform vec2 u_Pixel;
                uniform sampler2D u_Texture;

                varying vec2 v_UV;

                void main() {
                    vec4 texel = texture2D(u_Texture, v_UV);

                    gl_FragColor = texel;
                }`
        );

        var frame = self.createframe(1);
        buffer = frame.buffer;
        texture = frame.texture;
    }

    function FXAAx2() {
        shader = new Shader(
            gl,

            `attribute vec3 a_Position;
                attribute vec2 a_UV;

                varying vec2 v_UV;

                void main() {
                    gl_Position = vec4(a_Position, 1.0);

                    v_UV = a_UV;
                }`,
            `precision highp float;

                uniform vec2 u_Pixel;
                uniform sampler2D u_Texture;

                varying vec2 v_UV;

                void main() {
                    vec4 texel = texture2D(u_Texture, v_UV);

                    gl_FragColor = texel;
                }`
        );

        var frame = self.createframe(2);
        buffer = frame.buffer;
        texture = frame.texture;
    }

    function FXAAx4() {
        shader = new Shader(
            gl,

            `attribute vec3 a_Position;
                attribute vec2 a_UV;

                varying vec2 v_UV;

                void main() {
                    gl_Position = vec4(a_Position, 1.0);

                    v_UV = a_UV;
                }`,
            `precision highp float;

                uniform vec2 u_Pixel;
                uniform sampler2D u_Texture;

                varying vec2 v_UV;

                void main() {
                    vec4 texel = texture2D(u_Texture, v_UV);

                    gl_FragColor = texel;
                }`
        );

        var frame = self.createframe(4);
        buffer = frame.buffer;
        texture = frame.texture;
    }
}

function Renderer(options = {}) {
    if (typeof options !== 'object') {
        warn('Renderer', 'options', options);
        options = {};
    }

    var gl = options.gl,
        shader = options.shader,
        buffer = options.buffer,
        texture = options.texture,
        viewportWidth = options.viewportWidth,
        viewportHeight = options.viewportHeight;

    var program = shader.program;

    this.webGL = gl;
    this.shader = shader;
    this.program = program;
    this.buffer = buffer;
    this.texture = texture;
    this.viewportWidth = viewportWidth || 0;
    this.viewportHeight = viewportHeight || 0;

    // create vertices, uv and indices arrays, define locations
    var vertices = [-1, -1, 0, -1, 1, 0,
        1, 1, 0,
        1, -1, 0
    ];
    var v_location = gl.getAttribLocation(program, 'a_Position');

    var uv = [
        0, 0,
        0, 1,
        1, 1,
        1, 0
    ];
    var uv_location = gl.getAttribLocation(program, 'a_UV');

    var indices = [0, 1, 2, 2, 3, 0];

    // create buffers
    shader.useProgram();

    var v_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, v_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    var uv_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, uv_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uv), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    var i_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, i_buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    i_buffer.length = indices.length;

    // bind buffers and locations to model
    this.buffers = {
        vertex: v_buffer,
        uv: uv_buffer,
        index: i_buffer
    };

    this.locations = {
        vertex: v_location,
        uv: uv_location
    };

    // set uniforms
    gl.uniform1i(gl.getUniformLocation(program, 'u_Texture'), 0);
    gl.uniform2fv(gl.getUniformLocation(program, 'u_Pixel'), [1 / viewportWidth, 1 / viewportHeight]);
}

Object.defineProperties(Renderer.prototype, {
    buffer: {
        get: function() {
            return this.buffer_;
        },
        set: function(val) {
            if (!(val instanceof WebGLFramebuffer)) {
                error('Renderer#buffer', 'val', val);
            }

            this.buffer_ = val;
        }
    },
    shader: {
        get: function() {
            return this.shader_;
        },
        set: function(val) {
            if (!(val instanceof Shader)) {
                error('Renderer#shader', 'val', val);
            }

            this.shader_ = val;
        }
    },
    texture: {
        get: function() {
            return this.texture_;
        },
        set: function(val) {
            if (!(val instanceof WebGLTexture)) {
                error('Renderer#texture', 'val', val);
            }

            this.texture_ = val;
        }
    },
    viewportHeight: {
        get: function() {
            return this.viewportHeight_;
        },
        set: function(val) {
            if (typeof val !== 'number') {
                warn('Renderer#viewportHeight', 'val', val);
                val = 0;
            }

            this.viewportHeight_ = val;
        }
    },
    viewportWidth: {
        get: function() {
            return this.viewportWidth_;
        },
        set: function(val) {
            if (typeof val !== 'number') {
                warn('Renderer#viewportWidth', 'val', val);
                val = 0;
            }

            this.viewportWidth_ = val;
        }
    },
    webGL: {
        get: function() {
            return this.webGL_;
        },
        set: function(val) {
            if (!(val instanceof WebGLRenderingContext)) {
                error('Renderer#webGL', 'val', val);
            }

            this.webGL_ = val;
        }
    }
});

Renderer.prototype.end = function() {
    var gl = this.webGL;

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    gl.viewport(0, 0, this.viewportWidth, this.viewportHeight);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    this.update();

    var VIOBuffer = this.buffers.index;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, VIOBuffer);

    gl.drawElements(gl.TRIANGLES, VIOBuffer.length, gl.UNSIGNED_SHORT, 0);
}

Renderer.prototype.start = function() {
    var gl = this.webGL;
    var buffer = this.buffer;

    gl.bindFramebuffer(gl.FRAMEBUFFER, buffer);
    gl.viewport(0, 0, buffer.viewportWidth, buffer.viewportHeight);
}

Renderer.prototype.update = function() {
    var gl = this.webGL,
        shader = this.shader;

    shader.useProgram();

    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.vertex);
    gl.vertexAttribPointer(this.locations.vertex, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.locations.vertex);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.uv);
    gl.vertexAttribPointer(this.locations.uv, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.locations.uv);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
}
