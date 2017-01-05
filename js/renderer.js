class Renderer {
	constructor(canvas) {
		this.initialize(canvas);
	}

	add(...buffer) {
		this.stack_.push(...buffer);
	}

	clear() {
		var canvas = this.canvas_;
		var ctx = this.ctx_;
		var w = canvas.width;
		var h = canvas.height;

		ctx.clearRect(0, 0, w, h);
	}

	get ctx() {
		return this.ctx_;
	}

	draw(image, x, y, w, h) {
		var ctx = this.ctx_;

		ctx.drawImage(image, x, y, w, h);
	}

	execution() {
		var canvas = this.canvas_;
		var stack = this.stack_;

		this.clear();

		for (var i = stack.length - 1; i >= 0; i--) {
			var buffer = stack[i];
			if (buffer.draw) {
				buffer.draw(this);
			}
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
		this.offsetWidth_ = canvas.width;
		this.offsetHeight_ = canvas.height;

		this.camera_ = new Camera;
	}

	get mvpmatrix() {
		var camera = this.camera_;
		var mvpmatrix = Mat.multi(
			Mat4.translate(camera.body.position.inverse()),
			Mat4.rotate(camera.body.rotation.inverse()),
			camera.projectionMatrix
		);

		return mvpmatrix;
	}
}
