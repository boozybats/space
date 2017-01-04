const DEFAULT_WIDTH      = 1920;
const DEFAULT_HEIGHT     = 1080;
const DEFAULT_NEARFIELD  = 0.9999;
const DEFAULT_FARFIELD   = 10000;
const DEFAULT_FOV        = 60;

class Camera {
	constructor() {
		this.initialize();
	}

	get body() {
		return this.body_;
	}

	get deepOffset() {
		return this.deepOffset_;
	}

	initialize() {
		this.body_ = new Body();
		this.projectiveMatrix_ = Mat4.perspective(
			DEFAULT_WIDTH / DEFAULT_HEIGHT,
			DEFAULT_NEARFIELD,
			DEFAULT_FARFIELD,
			DEFAULT_FOV
		);
		this.deepOffset_ = DEFAULT_NEARFIELD;
		this.skyBox = [0, 0, 0, 255];
		this.skyBoxType = 'fill';
	}

	get projectiveMatrix() {
		return this.projectiveMatrix_;
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

	upgradeProjectiveMatrix(mat) {
		this.projectiveMatrix_ = Mat.multi(
			this.projectiveMatrix_,
			mat
		);
	}
}
