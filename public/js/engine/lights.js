class Light extends Item {
	constructor({
		name = 'light',
		body = new Body
	} = {}) {
		super({
			name,
			body
		});
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
		name = 'directionallight',
		body = new Body
	} = {}) {
		super({
			name,
			body
		});
	}
}

class PointLight extends Light {
	constructor({
		name = 'pointlight',
		body = new Body
	} = {}) {
		super({
			name,
			body
		});
	}

	get position() {
		var vec = amc('*', new Vec4(0,0,0,1), this.mvmatrix).HTC();

		return vec;
	}
}
