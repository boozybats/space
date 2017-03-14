/**
 * Camera is user's field of vision, it can be moved
 * by position or rotation, can not be scaled. It have a
 * projection matrix (most known examples: perspective, orthographic)
 * that sets sizes of the surrounding area.
 * @this {Camera}
 * @param {Object} options
 * @param {String} options.name
 * @param {Body} options.body
 * @param {Number} options.deepOffset Front offset of the deduction point
 * @param {Mat4} options.projectionMatrix Usually is seted by function
 * {@link Mat4.perspective}, sets proportions of screen and edits to
 * required values
 * @class
 * @property {String} name
 * @property {Body} body
 * @property {Number} deepOffset Front offset of the deduction point
 * @property {Mat4} projectionMatrix Usually is seted by function
 * {@link Mat4.perspective}, sets proportions of screen and edits to
 * required values
*/

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
		
		/**
		 * Stores last results of {@link Camera#mvmatrix} calculations.
		 * @type {Array}
		 * @private
		 */
		this.matmem = [];
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
	 * Returns {@link Mat4} modified by {@link Body}'s position,
	 * rotation and scale, also include relation of body's
	 * parents.
	 * @return {Mat4}
	 * @method
	 */
	mvmatrix() {
		var matS, matR, matT, matU, mvmatrix;
		var body = this.body;

		/**
		 * matrix memory contains data about last calculated
		 * matrix, it needs to save memory, so it's returning
		 * already calculated values.
		 */
		var memory = this.matmem,
			level = 0;  // level means "Parent's body number"
		/**
		 * if previous levels wasn't equal with memory
		 * when multiply existing mvmatrix on memory cells instead
		 * of writing all mvmatrix as value.
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

/**
 * Auto-determined value by screen width.
 * @type {Number}
 * @const
 */
const RESOLUTION_WIDTH = screen.width;
/**
 * Auto-determined value by screen height.
 * @type {Number}
 * @const
 */
const RESOLUTION_HEIGHT = screen.height;
/**
 * Physical offset from deduction point, pseudo-origin.
 * @type {Number}
 * @const
 */
const DEFAULT_NEARFIELD = 0.9999;
/**
 * Maximum far plan position where you can see a point,
 * doesn't brings a distortion on any value; needs only
 * for depth-buffer.
 * @type {Number}
 * @const
 */
const DEFAULT_FARFIELD = 1000000;
/**
 * How much degrees user see vertically
 * (recommended value less than 55).
 * @type {Number}
 * @const
 */
const DEFAULT_FOVY = 50;
/**
 * Perspective matrix for projection matrix. Sets proportions of
 * screen and edits to required values.
 * @type {Mat4}
 * @const
 */
const DEFAULT_PERSPECTIVE = Mat4.perspective(
	RESOLUTION_WIDTH / RESOLUTION_HEIGHT,
	DEFAULT_NEARFIELD,
	DEFAULT_FARFIELD,
	DEFAULT_FOVY
);
