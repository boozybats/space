class Canvas {
	constructor(width, height) {
		var canvas = document.createElement('canvas');
		canvas.innerText = 'Your browser doesn\'t support canvas element, please use another or update';  //if browser doesn't support canvas

		this.canvas = canvas;
		this.width = width;
		this.height = height;
	}

	appendTo(element) {
		if (element.appendChild(this.canvas)) {
			return true;
		}
		else {
			return false;
		}
	}

	get canvas() {
		return this.canvas_;
	}

	set canvas(val) {
		this.canvas_ = val;
	}

	get height() {
		return this.height_;
	}

	set height(val) {
		if (typeof val === 'number') {
			this.canvas.height = val;
			this.height_ = val;
		}
		else {
			console.warn('Canvas: height: error');
		}
	}

	get width() {
		return this.width_;
	}

	set width(val) {
		if (typeof val === 'number') {
			this.canvas.width = val;
			this.width_ = val;
		}
		else {
			console.warn('Canvas: width: error');
		}
	}
}
