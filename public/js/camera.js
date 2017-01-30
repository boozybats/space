const DEFAULT_NEARFIELD  = 0.9999;
const DEFAULT_FARFIELD   = 10000;
const DEFAULT_FOV        = 90;

class Camera {
	constructor({
		name = 'camera',
		body = new Body,
		deepOffset = DEFAULT_NEARFIELD, 
		projectionMatrix = Mat4.perspective(
			RESOLUTION_WIDTH / RESOLUTION_HEIGHT,
			DEFAULT_NEARFIELD,
			DEFAULT_FARFIELD,
			DEFAULT_FOV
		),
		skyBoxColor = new Color(0, 0, 0, 255),
		skyBoxType = 'fill'
	} = {}) {
		this.name = name,
		this.body = body;
		this.deepOffset = deepOffset;
		this.projectionMatrix = projectionMatrix;
		this.skyBoxColor = skyBoxColor;
		this.skyBoxType = skyBoxType;
		this.matrixStorage_ = [];
	}

	get body() {
		return this.body_;
	}

	bindMouse(item) {
		var clone = item.instance(this.scene);
		var storage = item.storage;

		storage.__defineGetter__('position', function() {
			return storage.position_;
		});
		storage.__defineSetter__('position', function(val) {
			storage.position_ = val;
			var x = (val.x + storage.w * 0.5) / RESOLUTION_WIDTH * 2 - 1;
			var y = -(val.y + storage.h * 0.5) / RESOLUTION_HEIGHT * 2 + 1;
			var position = new Vec3(
				x,
				y,
				0
			);
			clone.body.position = position;
		});

		storage.position = storage.position;
	}

	set body(val) {
		if (val instanceof Body) {
			this.body_ = val;
		}
		else {
			console.warn('Camera: body: error');
		}
	}

	get deepOffset() {
		return this.deepOffset_;
	}

	set deepOffset(val) {
		this.deepOffset_ = val;
	}

	follow(body) {
		this.body.parent = body;
	}

	get mvmatrix() {
		var matS, matR, matT, matU, mvmatrix;
		var body = this.body;

		var storage = this.matrixStorage_;
		var ie = 0;
		var isBreaked = false;

		do {
			if (!storage[ie]) {
				storage[ie] = {};
			}
			var cell = storage[ie];

			if (Body.compare(body, cell, false)) {
				if (isBreaked) {
					mvmatrix = Mat.multi(mvmatrix, cell.matrix);
				}
				else {
					mvmatrix = cell.unity;
				}
			}
			else {
				isBreaked = true;

				cell.position = body.position;
				cell.rotation = body.rotation;
				cell.scale = body.scale;

				matS = Mat4.scale(body.scale);
				matR = Mat4.rotate(body.rotation);
				matT = Mat4.translate(body.position);

				matU = Mat.multi(matS, matR, matT);
				cell.matrix = matU;

				mvmatrix = mvmatrix ? Mat.multi(mvmatrix, matU) : matU;
				cell.unity = mvmatrix;
			}

			body = body.parent;
			ie++;
		}
		while(body);

		return mvmatrix;
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

	set projectionMatrix(val) {
		if (val instanceof Mat) {
			this.projectionMatrix_ = val;
		}
		else {
			console.warn('Camera: projectionMatrix: error');
		}
	}

	get scene() {
		return this.scene_;
	}

	set scene(val) {
		if (!val || val instanceof Scene) {
			this.scene_ = val;
		}
		else {
			console.warn('Camera: scene: error');
		}
	}

	get skyBoxColor() {
		return this.skyBoxColor_;
	}

	set skyBoxColor(val) {
		if (val instanceof Color) {
			this.skyBoxColor_ = val;
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
			this.skyBoxType_ = val;
		}
		else {
			console.warn('Camera: skyBoxType: error');
		}
	}

	unfollow(item) {
		this.body.parent = undefined;
	}
}
