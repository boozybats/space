const DEFAULT_NEARFIELD  = 0;
const DEFAULT_FARFIELD   = 1;
const DEFAULT_FOV        = 90;

class Camera {
	constructor({
		name = 'camera',
		body = new Body,
		deepOffset = DEFAULT_NEARFIELD, 
		projectiveMatrix = Mat4.orthogonal(
			RESOLUTION_WIDTH,
			RESOLUTION_HEIGHT,
			DEFAULT_NEARFIELD,
			DEFAULT_FARFIELD
		),
		skyBox = new Color(0, 0, 0, 255),
		skyBoxType = 'fill'
	}) {
		this.name = name,
		this.body = body;
		this.deepOffset = deepOffset;
		this.projectionMatrix = projectiveMatrix;
		this.skyBox = skyBox;
		this.skyBoxType = skyBoxType;
	}

	get body() {
		return this.body_;
	}

	get deepOffset() {
		return this.deepOffset_;
	}

	set deepOffset(val) {
		this.deepOffset_ = val;
	}

	get name() {
		return this.name_;
	}

	set name(val) {
		if (typeof val === 'string') {
			this.name_ = val;
		}
		else {
			console.warn('Camera: name: error');
		}
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
