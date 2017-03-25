/**
 * Initializes WebGLRendererContext with selected
 * attributes.
 * @this {WebGLRenderer}
 * @param {Object} options
 * @param {Project} options.project
 * @param {Object} options.attributes WebGLContext attributes:
 * Boolean antialias, Boolean alpha, Boolean willReadFrequently,
 * String storage, Number depth, Number stencil, Boolean premultipliedAlpha,
 * Boolean preserveDrawingBuffer, Boolean failIfMajorPerformanceCaveat.
 * @class
 * @property {WebGLContext} webGL
 * @property {Canvas} canvas
 */

class WebGLRenderer {
	constructor({
		project,
		attributes = {
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
				gl = canvas.getContext(method, attributes);
				if (!gl) {
					delete attributes.failIfMajorPerformanceCaveat;
					gl = canvas.getContext(method, attributes);
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
			throw new Error('WebGLRenderer: can\'t create webglrenderer context');
		}
		
		this.project = project;
		this.canvas_ = canvas;
		this.webGL_ = gl;
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
	createframebuffer(multiplier) {
		var canvas = this.canvas,
			width = canvas.width,
			height = canvas.height;

		var sizex = multiplier * width,  // Math.ceilPowerOfTwo(multiplier * width),
			sizey = multiplier * height;  //Math.ceilPowerOfTwo(multiplier * height);
		console.log(sizex, sizey);

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

	get webGL() {
		return this.webGL_;
	}
}
