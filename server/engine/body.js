/**
 * Stores position, rotation, scale vectors,
 * Can have a parent-body. When calling method
 * {@link Body#mvmatrix} in {@link Item} calculations
 * will be relative to parent-bodies,
 * Stores children-array
 * @this {Body}
 * @param {Object} options
 * @param {Vec3} options.position
 * @param {Quaternion} options.rotation
 * @param {Vec3} options.scale
 * @param {Body} options.parent
 * @class
 * @property {Array} children Children-array fills automatically after adding
 * for some body a parent this body and automatically
 * removes children if parent has been changed.
 */
function Body(options = {}) {
    if (typeof options !== 'object') {
        logger.warn('Body', 'options', options);
        options = {};
    }

    this.position = options.position || new Vec3;
    this.rotation = options.rotation || new Quaternion;
    this.scale = options.scale || new Vec3(1, 1, 1);
    this.parent = options.parent;

    // Stores children of a body
    this.children_ = [];
    // Stores last results of {@link Body#mvmatrix} calculationsd
    this.matmem = [];
}

Object.defineProperties(Body.prototype, {
    children: {
        get: function() {
            return this.children_;
        }
    },
    position: {
        get: function() {
            return this.position_;
        },
        set: function(val) {
            if (!(val instanceof Vec3)) {
                logger.warn('Body#position', 'val', val);
                val = new Vec3;
            }

            this.position_ = val;
        }
    },
    rotation: {
        get: function() {
            return this.rotation_;
        },
        set: function(val) {
            if (!(val instanceof Quaternion)) {
                logger.warn('Body#rotation', 'val', val);
                val = new Quaternion;
            }

            this.rotation_ = val;
        }
    },
    scale: {
        get: function() {
            return this.scale_;
        },
        set: function(val) {
            if (!(val instanceof Vec3)) {
                logger.warn('Body#scale', 'val', val);
                val = new Vec3(1, 1, 1);
            }

            this.scale_ = val;
        }
    },
    parent: {
        get: function() {
            return this.parent_;
        },
        set: function(val) {
            if (val && !(val instanceof Body)) {
                logger.warn('Body#parent', 'val', val);
                val = undefined;
            }

            // if body had a parent when remove from parent's children
            if (this.parent) {
                var ind = this.parent.children.indexOf(this);
                this.parent.children.splice(ind, 1);
            }

            // autopush to children list of new parent
            if (val) {
                val.children.push(this);
            }

            this.parent_ = val;
        }
    }
});

/**
 * Returns {@link Mat4} modified by {@link Body}'s position,
 * rotation and scale, also include relation of body's
 * parents
 * @return {Mat4}
 * @method
 */
Body.prototype.mvmatrix = function() {
    var matS, matR, matT, matU, mvmatrix;
    var body = this;

    /**
     * matrix memory contains data about last calculated
     * matrix, it needs to save memory, so it's returning
     * already calculated values
     */
    var memory = this.matmem;
    // level means "Parent's body number"
    var level = 0;
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

        if (amc('=', body.position, cell.position) &&
            amc('=', body.rotation, cell.rotation) &&
            amc('=', body.scale, cell.scale)) {
            if (isBreaked) {
                mvmatrix = amc('*', cell.matrix, mvmatrix);
            } else {
                mvmatrix = cell.unity;
            }
        } else {
            isBreaked = true;

            cell.position = body.position;
            cell.rotation = body.rotation;
            cell.scale = body.scale;

            matS = Mat4.scale(body.scale);
            matR = Mat4.rotate(body.rotation);
            matT = Mat4.translate(body.position);

            // matrix from this level only
            matU = amc('*', matT, matR, matS);
            cell.matrix = matU;

            // result matrix from first level to this
            mvmatrix = mvmatrix ? amc('*', matU, mvmatrix) : matU;
            cell.unity = mvmatrix;
        }

        body = body.parent;
        level++;
    }
    while (body);

    return mvmatrix;
}

Body.prototype.toJSON = function() {
    var out = {};

    out.position = this.position.array();
    out.rotation = this.rotation.euler.array();
    out.scale = this.scale.array();

    return out;
}

module.exports = Body;

var logger = require('./logger');
var v = require('./vector');
var Vec3 = v.Vec3;
var m = require('./matrix');
var Mat4 = m.Mat4;
var Quaternion = require('./quaternion');
var math = require('./math');
var amc = math.amc;
