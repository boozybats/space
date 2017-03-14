/**
 * Creates canvas dom-element, sets width and
 * height for it. Required for {@link WebGLRenderer}.
 * @this {Canvas}
 * @param {Number} width
 * @param {Number} height
 * @class
 * @property {Number} width
 * @property {Number} height
 * @property {Project} project Current binded project to the canvas
 */

class Canvas {
	constructor(width, height) {
		var canvas = document.createElement('canvas');
		this.canvas_ = canvas;
		// if browser doesn't support canvas
		canvas.innerText = '';

		this.width = width;
		this.height = height;
	}

	get canvas() {
		return this.canvas_;
	}

	get height() {
		return this.height_;
	}
	set height(val) {
		if (typeof val !== 'number') {
			throw new Error('Canvas: height: must be a number');
		}

		this.canvas.height = val;
		this.height_ = val;
	}

	get width() {
		return this.width_;
	}
	set width(val) {
		if (typeof val !== 'number') {
			throw new Error('Canvas: width: must be a number');
		}

		this.canvas.width = val;
		this.width_ = val;
	}

	/**
	 * Appends canvas dom-element to choosen dom-element,
	 * returns true if successful, else returns false.
	 * @return {Boolean}
	 * @method
	 * @example
	 * var canvasClass = new Canvas(1280, 768);
	 * canvasClass.apendTo(document.body);
	 */
	appendTo(element) {
		if (!(element instanceof HTMLElement)) {
			throw new Error('Canvas: appendTo: must be a dom-element');
		}

		if (element.appendChild(this.canvas)) {
			// calls any functions with resize events to adapt canvas
			window.onresize();
			return true;
		}
		else {
			return false;
		}
	}

	get project() {
		return this.project_;
	}
}
