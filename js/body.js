class Body {
	constructor({
		position = new Vec3,
		rotation = new Vec3,
		scale = new Vec3(1, 1, 1),
		parent
	} = {}) {
		this.position_ = position;
		this.rotation_ = rotation;
		this.scale_ = scale;
		this.parent_ = parent;
	}

	get position() {
		return this.position_;
	}

	set position(val) {
		if (val instanceof Vec3) {
			this.position_ = val;
		}
		else {
			console.warn('Body: position must be Vec3');
		}
	}

	get rotation() {
		return this.rotation_;
	}

	set rotation(val) {
		if (val instanceof Vec3) {
			this.rotation_ = val;
		}
		else {
			console.warn('Body: rotation must be Vec3');
		}
	}

	get scale() {
		return this.scale_;
	}

	set scale(val) {
		if (val instanceof Vec3) {
			this.scale_ = val;
		}
		else {
			console.warn('Body: scale must be Vec3');
		}
	}

	get parent() {
		return this.parent_;
	}

	set parent(val) {
		if (val instanceof Body) {
			this.panret_ = val;
		}
		else {
			console.warn('Body: parent must be Body');
		}
	}
}
