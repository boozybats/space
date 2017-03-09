/**
 * Creates canvas-element and binds
 * to choosen dom-element
 *
 * @constructor
 * @this {Canvas}
 *  {Project} this.project
 * @param {number} width
 * @param {number} height
 */

class Canvas {
	constructor(width, height) {
		var canvas = document.createElement('canvas');
		// if browser doesn't support canvas
		canvas.innerText = '';

		this.canvas = canvas;
		this.width = width;
		this.height = height;
	}

	/**
	 * appends to choosen dom element
	 * return "true" if successful added
	 * else "false" 
	 *
	 * @return {bool}
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

	get height() {
		return this.height_;
	}

	// Sets canvas-element height
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

	// Sets canvas-element width
	set width(val) {
		if (typeof val !== 'number') {
			throw new Error('Canvas: width: must be a number');
		}

		this.canvas.width = val;
		this.width_ = val;
	}

	get project() {
		return this.project_;
	}
	set project(val) {
		if (val && !(val instanceof Project)) {
			throw new Error('Canvas: project: must be a Project');
		}

		this.project_ = val
	}
}
