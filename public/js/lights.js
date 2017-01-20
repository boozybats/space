class Light {
	constructor({
		body: new Body
	}) {
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

class DirectionalLight {
	constructor({
		body: new Body
	} = {}) {
		super({
			body: body
		});
	}
}

class PointLight {
	constructor({
		body: body
	} = {}) {
		super(body);
	}
}
