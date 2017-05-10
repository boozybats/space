class Rigidbody {
	constructor({
		body
	} = {}) {
		this.body = body;

		// Stores a custom handlers, are called on change values
		var handlers = new Storage;
		handlers.filter = (data => typeof data === 'function');
		this.handlers = handlers;

		// Stores last values of properties
		this.data = {
			velocity: {
				value: new Vec3,
				duration: 0
			}
		};
		this.velocity = new Vec3;

		this.initialize();
	}

	get body() {
		return this.body_;
	}
	set body(val) {
		if (val && !(val instanceof Body)) {
			body = undefined;
		}

		this.body_ = val;
	}

	// Updates properties and send them to callbacks onchange
	initialize() {
		var self = this;
		this.onupdate = function({
			deltaTime
		}) {
			var tugged = [];

			var dataVelocity = self.data.velocity;
			var velocity = self.velocity,
				shift = amc('*', velocity, deltaTime);

			if (amc('=', dataVelocity.value, velocity)) {
				dataVelocity.duration += deltaTime;
			}
			else {
				tugged.push('velocity');
			}

			self.tug(tugged);

			var body = self.body;
			if (body) {
				body.position = amc('+', body.position, shift);
			}
		}
	}

	onсhange(handler, callback) {
		this.handlers.set(handler, callback);
	}

	get onupdate() {
		return this.onupdate_;
	}
	set onupdate(val) {
		if (typeof val !== 'function') {
			val = function() {};
		}

		this.onupdate_ = val;
	}

	// Triggers selected changes, if list aren't selected when choose every property
	tug(list) {
		var self = this;
		if (!list || ~list.indexOf('velocity')) {
			var dataVelocity = self.data.velocity;
			var velocity = self.velocity;

			var callback = self.handlers.get('velocity');
			if (callback) {
				callback(dataVelocity.value, dataVelocity.duration);
			}

			dataVelocity.value = velocity;
			dataVelocity.duration = 0;
		}
	}

	get velocity() {
		return this.velocity_;
	}

	set velocity(val) {
		if (!(val instanceof Vec3)) {
			val = new Vec3;
		}

		this.velocity_ = val;
	}
}
