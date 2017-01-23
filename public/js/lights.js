class Light {
	constructor({
		body = new Body
	} = {}) {
		this.body = body;
	}

	get body() {
		return this.body_;
	}

	set body(val) {
		if (val instanceof Body) {
			this.body_ = val;
		}
		else {
			console.warn('Light: body: error');
		}
	}
}

class DirectionalLight extends Light {
	constructor({
		body = new Body
	} = {}) {
		super({
			body
		});
	}
}

class PointLight extends Light {
	constructor({
		body = new Body
	} = {}) {
		super({
			body
		});
	}
}
