/**
 * Camera is a pseudo-object in scene which
 * changes model-view projection matrix to user's
 * vision (e.g. perspective, orthogonal)
 *
 * @constructor
 * @this {Camera}
 * 	{Scene} this.scene Which scene belongs
 *  to (changing by scene manipulation)
 * @param {string} name
 * @param {Body} body
 * @param {number} deepOffset Value of neariest field front of camera
 * @param {Mat4} projectionMatrix
*/


/* for projection matrix default params */

// canvas width
const RESOLUTION_WIDTH = screen.width;
// canvas height
const RESOLUTION_HEIGHT = screen.height;
// leave this value like 0.9(9)
const DEFAULT_NEARFIELD  = 0.9999;
/* maximum value where you can see a point on canvas
can take any value and there will be no distortion,
cause Z-coordinate needs only for depth-buffer */
const DEFAULT_FARFIELD   = 1000000;
// vertical field of vision (recommended value less than 60)
const DEFAULT_FOVY       = 50;
// perspective projection matrix show all objects as you look
const DEFAULT_PERSPECTIVE = Mat4.perspective(
	RESOLUTION_WIDTH / RESOLUTION_HEIGHT,
	DEFAULT_NEARFIELD,
	DEFAULT_FARFIELD,
	DEFAULT_FOVY
);

class Camera {
	constructor({
		name = 'camera',
		body = new Body,
		deepOffset = DEFAULT_NEARFIELD, 
		projectionMatrix = DEFAULT_PERSPECTIVE
	} = {}) {
		this.name = name,
		this.body = body;
		this.deepOffset = deepOffset;
		this.projectionMatrix = projectionMatrix;
		
		/** @private matrix memory */ this.matmem = [];
	}

	get name() {
		return this.name_;
	}
	set name(val = 'camera') {
		if (typeof val !== 'string') {
			throw new Error('Camera: name: must be a string');
		}

		this.name_ = val;
	}

	get body() {
		return this.body_;
	}
	set body(val) {
		if (!(val instanceof Body)) {
			throw new Error('Camera: body: must be a Body');
		}

		this.body_ = val;
	}

	get deepOffset() {
		return this.deepOffset_;
	}
	set deepOffset(val) {
		if (!(typeof val === 'number')) {
			throw new Error('Camera: deepOffset: must be a number');
		}

		this.deepOffset_ = val;
	}

	get projectionMatrix() {
		return this.projectionMatrix_;
	}
	set projectionMatrix(val) {
		if (!(val instanceof Mat4)) {
			throw new Error('Camera: projectionMatrix: must be a Mat4');
		}

		this.projectionMatrix_ = val;
	}

	/**
	 * Calculates model-view matrix by position and parents
	 *
	 * @return {Mat4} mvmatrix
	 */
	mvmatrix() {
		var matS, matR, matT, matU, mvmatrix;
		var body = this.body;

		/**
		 * matrix memory contains data about last calculated
		 * matrix, it needs to save memory, so it's returning
		 * already calculated values
		 */
		var memory = this.matmem,
			level = 0;  // level means "Parent's body number"
		/**
		 * if previous levels wasn't equal with memory
		 * when multiply existing mvmatrix on memory cells instead
		 * of writing all mvmatrix as value
		 */
		var isBreaked = false;  

		// go through cicle until item have a parent
		do {
			if (!memory[level]) {
				memory[level] = {};
			}
			var cell = memory[level];

			if (amc('=', body, cell)) {
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

				// matrix from this level only
				matU = amc('*', matS, matR, matT);
				cell.matrix = matU;

				// result matrix from first level to this
				mvmatrix = mvmatrix ? amc('*', mvmatrix, matU) : matU;
				cell.unity = mvmatrix;
			}

			body = body.parent;
			level++;
		}
		while(body);

		return mvmatrix;
	}
}
