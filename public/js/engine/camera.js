/**
 * Camera is user's field of vision, it can be moved
 * by position or rotation, can not be scaled. It have a
 * projection matrix (most known examples: perspective, orthographic)
 * that sets sizes of the surrounding area
 * @this {Camera}
 * @param {Object} options
 * @param {String} options.name
 * @param {Body} options.body
 * @param {Number} options.deepOffset Front offset of the deduction point
 * @param {Mat4} options.projectionMatrix Usually is seted by function
 * {@link Mat4.perspective}, sets proportions of screen and edits to
 * required values
 * @class
 */
function Camera(options = {}) {
    if (typeof options !== 'object') {
        warn('Camera', 'options', options);
        options = {};
    }

    this.name = options.name || 'camera';
    this.body = options.body || new Body;
    this.deepOffset = options.deepOffset || DEFAULT_NEARFIELD;
    this.projectionMatrix = options.projectionMatrix || DEFAULT_PERSPECTIVE;

    // Stores last results of {@link Camera#mvmatrix} calculations
    this.matmem = [];
}

Object.defineProperties(Camera.prototype, {
    body: {
        get: function() {
            return this.body_;
        },
        set: function(val) {
            if (!(val instanceof Body)) {
                warn('Camera#body', 'val', val);
                val = new Body;
            }

            this.body_ = val;
        }
    },
    deepOffset: {
        get: function() {
            return this.deepOffset_;
        },
        set: function() {
            if (!(typeof val === 'number')) {
                warn('Camera#deepOffset', 'val', val);
                val = DEFAULT_NEARFIELD;
            }

            this.deepOffset_ = val;
        }
    },
    name: {
        get: function() {
            return this.name_;
        },
        set: function() {
            if (typeof val !== 'string') {
                warn('Camera#name', 'val', val);
                val = 'camera';
            }

            this.name_ = val;
        }
    },
    projectionMatrix: {
        get: function() {
            return this.projectionMatrix_;
        },
        set: function() {
            if (!(val instanceof Mat)) {
                warn('Camera#projectionMatrix', 'val', val);
                val = DEFAULT_PERSPECTIVE;
            }

            this.projectionMatrix_ = val;
        }
    }
});

Object.defineProperties(Camera, {
    forward: {
        value: new Vec4(0, 0, 1, 0),
        writable: false
    },
    right: {
        value: new Vec4(1, 0, 0, 0),
        writable: false
    },
    up: {
        value: new Vec4(0, 1, 0, 0),
        writable: false
    }
});

/**
 * Returns model-view projection matrix updated by camera's
 * model-view matrix.
 * @return {Mat4}
 * @method
 */
Camera.prototype.mvpmatrix = function() {
    var cammvm = this.body.mvmatrix();

    var pos = amc('*', cammvm, Vec.homogeneousPos).toCartesian();
    var N = amc('*', cammvm, Camera.forward),
        V = amc('*', cammvm, Camera.up),
        U = amc('*', cammvm, Camera.right);
    var MatTr = new Mat4([
        U.x, U.y, U.z, -pos.x,
        V.x, V.y, V.z, -pos.y,
        N.x, N.y, N.z, -pos.z,
        0, 0, 0, 1
    ]);

    var mvpmatrix = amc('*',
        this.projectionMatrix,
        MatTr
    );

    return mvpmatrix;
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
