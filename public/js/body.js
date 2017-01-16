class Body {
	constructor({
		position = new Vec3,
		rotation = new Quaternion,
		scale = new Vec3(1, 1, 1),
		parent,
		children = []
	} = {}) {
		this.position = position;
		this.rotation = rotation;
		this.scale = scale;
		this.parent = parent;
		this.children = children;
	}

	get children() {
		return this.children_;
	}

	set children(val) {
		if (val instanceof Array) {
			this.children_ = val;
		}
		else {
			console.warn('Body: children: error');
		}
	}

	get parent() {
		return this.parent_;
	}

	set parent(val) {
		if (!val || val instanceof Body) {
			if (this.parent) {
				var children = this.parent.children;
				children.splice(children.indexOf(this), 1);
			}
			
			if (val) {
				val.children.push(this);
			}

			this.parent_ = val;
		}
		else {
			console.warn('Body: parent must be Body');
		}
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
		if (val instanceof Quaternion) {
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
}
