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
			antialias: true,
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
		this.canvas = canvas;
		this.webGL = gl;
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
}
