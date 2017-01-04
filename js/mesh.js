class Mesh {
	constructor() {
		this.initialize();
	}

	get fillStyle() {
		return this.fillStyle_;
	}

	set fillStyle(val) {
		this.fillStyle_ = val;
	}

	initialize() {
		this.fillStyle_ = '#000000';
	}
}
