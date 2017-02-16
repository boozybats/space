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
			this.position = Vec.sum(this.position_, val);
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

	onupdate() {
		this.axis = new Vec2;
	}

	get position() {
		return this.position_;
	}

	set position(val) {
		if (val instanceof Vec2) {
			if (val.x < -1 || val.x > 1 || val.y < -1 || val.y > 1) {
				var x = val.x,
					y = val.y;

				if (x < -1) {
					x = -1;
				}
				else if (x > 1) {
					x = 1;
				}

				if (y < -1) {
					y = -1;
				}
				else if (y > 1) {
					y = 1;
				}

				val = new Vec2(x, y);
			}

			this.position_ = val;
		}
		else {
			console.log('Cursor: position: error');
		}
	}
}
