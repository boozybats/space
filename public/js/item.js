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
			var out = scene.appendItem(this);
			return out;
		}
		else {
			console.warn('Item: instance: error');
		}
	}

	static image(src) {
		var image = new Image();
		image.onload = function() {
			this.loaded = true;
		}
		image.onerror = function() {
			this.loaded = false;
		}
		image.src = src;
		image.constructor = Item.image;

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

	static normals(vertices, indices) {
		//only if vertices size == 3
		var out = [];
		out.size = 3;

		for (var i = 0; i < indices.length; i += 3) {
			var i0 = indices[i] * 3,
				i1 = indices[i + 1] * 3,
				i2 = indices[i + 2] * 3;
			var v0 = [vertices[i0], vertices[i0 + 1], vertices[i0 + 2]],
				v1 = [vertices[i1], vertices[i1 + 1], vertices[i1 + 2]],
				v2 = [vertices[i2], vertices[i2 + 1], vertices[i2 + 2]];
			var nx = ((v0[1] - v1[1]) * (v0[2] - v2[2])) - ((v0[2] - v1[2]) * (v0[1] - v2[1])),
				ny = ((v0[2] - v1[2]) * (v0[0] - v2[0])) - ((v0[0] - v1[0]) * (v0[2] - v2[2])),
				nz = ((v0[0] - v1[0]) * (v0[1] - v2[1])) - ((v0[1] - v1[1]) * (v0[0] - v2[0]));
			var length = Math.sqrt((nx * nx) + (ny * ny) + (nz * nz));
			nx = nx / length;
			ny = ny / length;
			nz = nz / length;

			out.push(
				nx, ny, nz,
				nx, ny, nz,
				nx, ny, nz
			);
		}

		return out;
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

	static UIs(vertices, indices) {
		//only if vertices size == 3
		var out = [];
		out.size = 2;

		var min = {};
		var max = {};

		for (var i = 0; i < vertices.length; i += 3) {
			var x = vertices[i],
				y = vertices[i + 1];

			if (typeof min.x === 'undefined') {
				min.x = x;
				min.y = y;
				max.x = x;
				max.y = y;
			}

			min.x = Math.min(min.x, x);
			min.y = Math.min(min.y, y);
			max.x = Math.max(max.x, x);
			max.y = Math.max(max.y, y);
		}

		var distx = max.x - min.x,
			disty = max.y - min.y;

		for (var i = 0; i < indices.length; i += 3) {
			var i0 = indices[i] * 3,
				i1 = indices[i + 1] * 3,
				i2 = indices[i + 2] * 3;
			var v0 = [vertices[i0], vertices[i0 + 1], vertices[i0 + 2]],
				v1 = [vertices[i1], vertices[i1 + 1], vertices[i1 + 2]],
				v2 = [vertices[i2], vertices[i2 + 1], vertices[i2 + 2]];

			var x0 = (v0[0] - min.x) / distx,
				y0 = (v0[1] - min.y) / disty;
			var x1 = (v1[0] - min.x) / distx,
				y1 = (v1[1] - min.y) / disty;
			var x2 = (v2[0] - min.x) / distx,
				y2 = (v2[1] - min.y) / disty;

			out.push(x0, y0, x1, y1, x2, y2);
		}

		return out;
	}
}
