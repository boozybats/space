class Item {
	constructor({
		name = 'empty',
		body = new Body,
		mesh,
		collider,
		physic
	} = {}) {
		this.name = name;
		this.body = body;
		this.mesh = mesh;
		this.collider = collider;
		this.physic = physic;
	}

	get body() {
		return this.body_;
	}

	set body(val) {
		if (val instanceof Body) {
			this.body_ = val;
		}
		else {
			console.warn('Item: body: error');
		}
	}

	get collider() {
		return this.collider_;
	}

	set collider(val) {
		if (!val || val instanceof Collider) {
			this.collider_ = val;
		}
		else {
			console.warn('Item: collider: error');
		}
	}

	instance(scene) {
		if ((scene instanceof Scene)) {
			var out = scene.appendElement(this);
			return out;
		}
		else {
			console.warn('Item: instance: error');
		}
	}

	static image(src) {
		var image = new Image();
		image.onload = function() {
			this.loaded = true
		}
		image.src = src;

		return image;
	}

	get mesh() {
		return this.mesh_;
	}

	set mesh(val) {
		if (!val || val instanceof Mesh) {
			this.mesh_ = val;
		}
		else {
			console.warn('Item: mesh: error');
		}
	}

	get name() {
		return this.name_;
	}

	set name(val) {
		if (typeof val === 'string') {
			this.name_ = val;
		}
		else {
			console.warn('Item: name: error');
		}
	}

	get physic() {
		return this.physic_;
	}

	set physic(val) {
		if (!val || val instanceof Physic) {
			this.physic_ = val;
		}
		else {
			console.warn('Item: physic: error');
		}
	}
}
