class Renderer {
	constructor(canvas) {
		this.initialize(canvas);
	}

	add(buffer) {
		this.stack_.push(buffer);
	}

	clear() {
		var canvas = this.canvas_;
		var ctx = this.ctx_;
		var w = canvas.width;
		var h = canvas.height;

		ctx.clearRect(0, 0, w, h);
	}

	draw(image, x, y, w, h) {
		var ctx = this.ctx_;

		ctx.drawImage(image, x, y, w, h);
	}

	execution() {
		var canvas = this.canvas_;
		var stack = this.stack_;

		this.clear();

		for (var buffer of stack) {
			this.draw(buffer.image, buffer.x, buffer.y, buffer.w, buffer.h);
		}

		var self = this;
		window.requestAnimationFrame(function() {
			self.execution.call(self);
		}, canvas);
	}

	initialize(canvas) {
		this.canvas_ = canvas;
		this.ctx_ = canvas.getContext('2d');
		this.stack_ = [];
	}
}

class Buffer {
	constructor(options = {}) {
		this.initialize(options);
	}

	initialize(options) {
		this.image_ = options.image;
		this.h_ = options.h;
		this.w_ = options.w;
		this.x_ = options.x;
		this.y_ = options.y;
	}

	get image() {
		return this.image_();
	}

	get h() {
		return this.h_();
	}

	get w() {
		return this.w_();
	}

	get x() {
		return this.x_();
	}

	get y() {
		return this.y_();
	}
}
