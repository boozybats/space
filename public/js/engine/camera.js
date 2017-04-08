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
		this.name = name;
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
		if (!(val instanceof Mat)) {
			throw new Error('Camera: projectionMatrix: must be a Mat4');
		}

		this.projectionMatrix_ = val;
	}

	get name() {
		return this.name_;
	}
	set name(val) {
		if (typeof val !== 'string') {
			throw new Error('Camera: name: must be a string');
		}

		this.name_ = val;
	}

	/**
	 * Forward-vector of camera looking.
	 * @method
	 * @static
	 */
	static get forward() {
		return new Vec4(0, 0, 1, 0);
	}

	/**
	 * Right-vector of camera looking.
	 * @method
	 * @static
	 */
	static get right() {
		return new Vec4(1, 0, 0, 0);
	}

	/**
	 * Up-vector of camera looking.
	 * @method
	 * @static
	 */
	static get up() {
		return new Vec4(0, 1, 0, 0);
	}

	/**
	 * Returns model-view projection matrix updated by camera's
	 * model-view matrix.
	 * @return {Mat4}
	 * @method
	 */
	mvpmatrix() {
		var cammvm = this.body.mvmatrix();

		var pos = amc('*', cammvm, Vec.homogeneouspos).tocartesian();
		var N = amc('*', cammvm, Camera.forward),
			V = amc('*', cammvm, Camera.up),
			U = amc('*', cammvm, Camera.right);
		var MatTr = new Mat4([
			U.x, U.y, U.z, -pos.x,
			V.x, V.y, V.z, -pos.y,
			N.x, N.y, N.z, -pos.z,
			0,   0,   0,   1
		]);

		var mvpmatrix = amc('*',
			this.projectionMatrix,
			MatTr
		);

		return mvpmatrix;
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
const DEFAULT_FARFIELD = 1e+20;
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
