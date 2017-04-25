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

class WebGLRenderer {
	constructor({
		project,
		attributes,
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
		}
	} = {}) {
		var gl;
		var canvas = project.canvas.canvas;
		var methods = ['webgl', 'experimental-webgl', 'webkit-3d', 'moz-webgl'];

		for (var method of methods) {
			try {
				gl = canvas.getContext(method, webglattributes);
				if (!gl) {
					delete webglattributes.failIfMajorPerformanceCaveat;
					gl = canvas.getContext(method, webglattributes);
					if (!gl) {
						gl = canvas.getContext(method);
						if (gl) {
							console.warn('WebGLRenderer: wrong attributes');
						}
					}
				}
			}
			catch(e) {}

			if (gl) {
				break;
			}
		}

		if (!gl) {
			throw new Error('WebGLRenderer: can not create WebGLRenderingContext');
		}

		this.project = project;
		this.canvas_ = canvas;
		this.webGL_ = gl;

		this.initializeRenderer(attributes);
	}

	get project() {
		return this.project_;
	}
	set project(val) {
		if (!(val instanceof Project)) {
			throw new Error('WebGLRenderer: project: must be a Project');
		}

		this.project_ = val; 
	}

	get canvas() {
		return this.canvas_;
	}

	/**
	 * Creates framebuffer for antialiasing.
	 * @method
	 */
	createframe(multiplier) {
		var canvas = this.canvas,
			width = canvas.width,
			height = canvas.height;

		this.viewportWidth = width;
		this.viewportHeight = height;

		var sizex = multiplier * width,  // Math.ceilPowerOfTwo(multiplier * width),
			sizey = multiplier * height;  //Math.ceilPowerOfTwo(multiplier * height);

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
			throw new error('WebGLRenderer: createframebuffer: unavailabe to create framebuffer');
		}

		gl.bindTexture(gl.TEXTURE_2D, null);
		gl.bindRenderbuffer(gl.RENDERBUFFER, null);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);

		var out = {
			buffer,
			texture
		};

		return out;
	}

	get frameBuffer() {
		return this.frameBuffer_;
	}

	get frameTexture() {
		return this.frameTexture_;
	}

	initializeRenderer(attributes = {}) {
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

	get webGL() {
		return this.webGL_;
	}
}

class Renderer {
	constructor({
		gl,
		shader,
		buffer,
		texture,
		viewportWidth,
		viewportHeight
	}) {
		var program = shader.program;
		this.program = program;
		this.gl = gl;
		this.texture = texture;
		this.buffer = buffer;
		this.viewportWidth = viewportWidth;
		this.viewportHeight = viewportHeight;

		// create vertices, uv and indices arrays, define locations
		var vertices = [
			-1, -1, 0,
			-1, 1, 0,
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
		gl.useProgram(program);

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
		gl.uniform2fv(gl.getUniformLocation(program, 'u_Pixel'), new Float32Array([1 / viewportWidth, 1 / viewportHeight]));
	}

	end() {
		var gl = this.gl;

    	gl.bindFramebuffer(gl.FRAMEBUFFER, null);

		gl.viewport(0, 0, this.viewportWidth, this.viewportHeight);
		gl.clearColor(0, 0, 0, 0);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    	this.update();

		var VIOBuffer = this.buffers.index;
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, VIOBuffer);

		gl.drawElements(gl.TRIANGLES, VIOBuffer.length, gl.UNSIGNED_SHORT, 0);
	}

	start() {
		var gl = this.gl;
		var buffer = this.buffer;

    	gl.bindFramebuffer(gl.FRAMEBUFFER, buffer);
    	gl.viewport(0, 0, buffer.viewportWidth, buffer.viewportHeight);
	}

	update() {
		var gl = this.gl,
			program = this.program;

		gl.useProgram(program);

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
}
