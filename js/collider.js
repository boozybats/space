class Collider {
	constructor(buffer) {
		this.buffer = buffer;
	}

	get buffer() {
		return this.buffer_;
	}

	set buffer(val) {
		if (val instanceof Array) {
			this.buffer_ = val;
		}
		else {
			console.warn('Collider: buffer: error');
		}
	}
}

class CubeCollider extends Collider {
	constructor(buffer) {
		super(buffer);
	}
}

class SphereCollider extends Collider {
	constructor(R) {
		super([R]);

		this.R = R;
		this.D = R * 2;
	}

	get D() {
		return this.D_;
	}

	set D(val) {
		if (typeof val === 'number') {
			this.D_ = val;
		}
		else {
			console.warn('SphereCollider: D: error');
		}
	}

	collision(item0, item1) {
		if (!(item0 instanceof CloneElement) || !(item1 instanceof CloneElement)) {
			console.warn('SphereCollider: collision: error');
		}

		//check on collisions sphere colliders

		//max scales
		var scale0 = Math.max(
			item0.body.scale.x,
			item0.body.scale.y,
			item0.body.scale.z
		);
		var scale1 = Math.max(
			item1.body.scale.x,
			item1.body.scale.y,
			item1.body.scale.z
		);

		var r0 = item0.collider.sphereCollider.D * scale0;
		var r1 = item1.collider.sphereCollider.D * scale1;
		var distance = element0.distance(element1);

		var result = distance - Math.abs(r0 - r1);
		var out = result <= 0;

		return out;
	}

	get R() {
		return this.R_;
	}

	set R(val) {
		if (typeof val === 'number') {
			this.R_ = val;
		}
		else {
			console.warn('SphereCollider: R: error');
		}
	}
}
