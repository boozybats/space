const DEFAULT_NEARFIELD  = 0;
const DEFAULT_FARFIELD   = 1;
const DEFAULT_FOV        = 90;

class Camera {
	constructor() {
		this.initialize();
	}

	get body() {
		return this.body_;
	}

	initialize() {
		this.body_ = new Body();
		this.projectionMatrix_ = Mat4.orthogonal(
			RESOLUTION_WIDTH,
			RESOLUTION_HEIGHT,
			DEFAULT_NEARFIELD,
			DEFAULT_FARFIELD
		);
		this.skyBox = [0, 0, 0, 255];
		this.skyBoxType = 'fill';
	}

	get projectionMatrix() {
		return this.projectionMatrix_;
	}

	get skyBox() {
		return this.skyBox_;
	}

	set skyBox(val) {
		if (val instanceof Array) {
			this.skyBox_ = val;
		}
		else {
			console.warn('Camera: skyBox: error');
		}
	}

	get skyBoxType() {
		return this.skyBoxType_;
	}

	set skyBoxType(val) {
		if (typeof val === 'string') {
			this.skyBox_ = val;
		}
		else {
			console.warn('Camera: skyBoxType: error');
		}
	}
}
