class Cursor {
	constructor() {
		this.position = new Vec2;
		this.axis = new Vec2;
		this.forceback = false;
	}

	get axis() {
		return this.axis_;
	}

	set axis(val) {
		if (val instanceof Vec2) {
			this.axis_ = val;
			this.position = amc('+', this.position, val);
		}
		else {
			console.warn('Cursor: axis: error');
		}
	}

	get forceback() {
		return this.forceback_;
	}

	set forceback(val) {
		if (typeof val === 'boolean') {
			this.forceback_ = val;
		}
		else {
			console.warn('Cursor: forceback: error');
		}
	}

	get position() {
		return this.position_;
	}

	set position(val) {
		if (val instanceof Vec2) {
			var length = val.length;
			if (length > 1) {
				val = val.normalize();
			}

			this.position_ = val;
		}
		else {
			console.log('Cursor: position: error');
		}
	}
}
