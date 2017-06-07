/**
 * Converts radians to degrees.
 * @param  {Number} rad
 * @return {Number}
 * @method RTD
 * @memberOf Math
 */
Math.RTD = (rad) => rad * 180 / Math.PI;

/**
 * Converts degrees to radians.
 * @param  {Number} deg
 * @return {Number}
 * @method DTR
 * @memberOf Math
 */
Math.DTR = (deg) => deg * Math.PI / 180;

/**
 * Returns num if value bigger than minimal and lower than maximal
 * else returns one of two: minimal or maximal.
 * @param  {Number} num
 * @param  {Number} min Minimal
 * @param  {Number} max Maximal
 * @return {Number}
 */
Math.clamp = (num, min, max) => Math.min(Math.max(num, min), max);

/**
 * If number is degree of two then returns true
 * else returns false.
 * @param  {Number}  num
 * @return {Boolean}
 * @method  isPowerOfTwo
 * @memberOf Math
 */
Math.isPowerOfTwo = function(num) {
    if (typeof num !== 'number') {
        num = 0;
    }

    var c = 2;
    while (num > c) {
        c *= 2;
    }

    return num == c;
}

/**
 * Returns the nearest number of power of two
 * after sended number.
 * @param  {Number}  num
 * @return {Number}
 * @method  ceilPowerOfTwo
 * @memberOf Math
 */
Math.ceilPowerOfTwo = function(num) {
    if (typeof num !== 'number') {
        num = 0;
    }

    var c = 2;
    while (num > c) {
        c *= 2;
    }

    return c;
}

/**
 * Gives available to mathematical calculations with engine classes
 * @param  {String}    operand +, -, *, /, =
 * @param  {*} terms   Can be selected more than one,
 * will be calculated by order
 * @return {*} Returns appropriate class
 * @function amc
 */
function amc(operand) {
    var out = 0;

    var args = arguments;
    var term1 = args[1],
        term2 = args[2];

    switch (operand) {
        case '+':
            out = amc_sum(term1, term2);
            break;

        case '-':
            out = amc_dif(term1, term2);
            break;

        case '*':
            out = amc_multi(term1, term2);
            break;

        case '/':
            out = amc_divide(term1, term2);
            break;

        case '=':
            out = amc_equality(term1, term2);
            break;

        default:
            warnfree(`amc: arithmetic calculations error, wrong operand, value: ${operand}`);
    }

    if (args.length > 3) {
        Array.prototype.splice.call(args, 1, 2, out);
        out = amc.apply(amc, args);
    }

    return out;
}

/**
 * Returns sum of terms.
 * @param  {Mat | Vec | Quaternion | Number} term1
 * @param  {Mat | Vec | Quaternion | Number} term2
 * @return {Mat | Vec | Quaternion | Number}
 * @private
 * @function amc_sum
 */
function amc_sum(term1, term2) {
    var out;

    if (term1 instanceof Mat && term2 instanceof Mat) {
        out = Mat.sum(term1, term2);
    } else if (term1 instanceof Vec && term2 instanceof Vec) {
        out = Vec.sum(term1, term2);
    } else if (term1 instanceof Quaternion && term2 instanceof Quaternion) {
        out = Quaternion.sum(term1, term2);
    } else if ((term1 instanceof Mat && typeof term2 === 'number') ||
        (typeof term1 === 'number' && term2 instanceof Mat)) {
        var mat = term1 instanceof Mat ? term1 : term2;
        var num = typeof term1 === 'number' ? term1 : term2;

        out = mat.sum(num);
    } else if ((term1 instanceof Vec && typeof term2 === 'number') ||
        (typeof term1 === 'number' && term2 instanceof Vec)) {
        var vec = term1 instanceof Vec ? term1 : term2;
        var num = typeof term1 === 'number' ? term1 : term2;

        out = vec.sum(num);
    } else if ((term1 instanceof Quaternion && typeof term2 === 'number') ||
        (typeof term1 === 'number' && term2 instanceof Quaternion)) {
        var qua = term1 instanceof Quaternion ? term1 : term2;
        var num = typeof term1 === 'number' ? term1 : term2;

        out = qua.sum(num);
    } else {
        out = term1 + term2;
    }

    return out;
}

/**
 * Returns difference of terms.
 * @param  {Mat | Vec | Quaternion | Number} term1
 * @param  {Mat | Vec | Quaternion | Number} term2
 * @return {Mat | Vec | Quaternion | Number}
 * @private
 * @function amc_dif
 */
function amc_dif(term1, term2) {
    var out;

    if (term1 instanceof Mat && term2 instanceof Mat) {
        out = Mat.dif(term1, term2);
    } else if (term1 instanceof Vec && term2 instanceof Vec) {
        out = Vec.dif(term1, term2);
    } else if (term1 instanceof Quaternion && term2 instanceof Quaternion) {
        out = Quaternion.dif(term1, term2);
    } else if ((term1 instanceof Mat && typeof term2 === 'number') ||
        (typeof term1 === 'number' && term2 instanceof Mat)) {
        var mat = term1 instanceof Mat ? term1 : term2;
        var num = typeof term1 === 'number' ? term1 : term2;

        out = mat.sum(-num);
    } else if ((term1 instanceof Vec && typeof term2 === 'number') ||
        (typeof term1 === 'number' && term2 instanceof Vec)) {
        var vec = term1 instanceof Vec ? term1 : term2;
        var num = typeof term1 === 'number' ? term1 : term2;

        out = vec.sum(-num);
    } else if ((term1 instanceof Quaternion && typeof term2 === 'number') ||
        (typeof term1 === 'number' && term2 instanceof Quaternion)) {
        var qua = term1 instanceof Quaternion ? term1 : term2;
        var num = typeof term1 === 'number' ? term1 : term2;

        out = qua.sum(-num);
    } else {
        out = term1 - term2;
    }

    return out;
}

/**
 * Returns multiply of terms.
 * @param  {Mat | Vec | Quaternion} term1
 * @param  {Mat | Vec | Quaternion | Number} term2
 * @return {Mat | Vec | Quaternion | Number}
 * @private
 * @function amc_multi
 */
function amc_multi(term1, term2) {
    var out;

    if (term1 instanceof Mat && term2 instanceof Mat) {
        out = Mat.multi(term1, term2);
    } else if (term1 instanceof Vec && term2 instanceof Vec) {
        out = Vec.multi(term1, term2);
    } else if (term1 instanceof Mat && term2 instanceof Vec) {
        var arr = term2.array().map(function(a) {
            return [a];
        });
        arr.a = term2.size;
        arr.b = 1;

        arr = Mat.multi(term1, arr).rowmajor();

        out = new Vec(arr[0], arr[1], arr[2], arr[3]);
    } else if (term1 instanceof Vec && term2 instanceof Mat) {
        var arr = [term1.array()];
        arr.a = 1;
        arr.b = term1.size;

        arr = Mat.multi(arr, term2);

        out = new Vec(...arr.rowmajor());
    } else if ((term1 instanceof Mat && typeof term2 === 'number') ||
        (typeof term1 === 'number' && term2 instanceof Mat)) {
        var mat = term1 instanceof Mat ? term1 : term2;
        var num = typeof term1 === 'number' ? term1 : term2;

        out = mat.multi(num);
    } else if ((term1 instanceof Vec && typeof term2 === 'number') ||
        (typeof term1 === 'number' && term2 instanceof Vec)) {
        var vec = term1 instanceof Vec ? term1 : term2;
        var num = typeof term1 === 'number' ? term1 : term2;

        out = vec.multi(num);
    } else if ((term1 instanceof Quaternion && typeof term2 === 'number') ||
        (typeof term1 === 'number' && term2 instanceof Quaternion)) {
        var qua = term1 instanceof Quaternion ? term1 : term2;
        var num = typeof term1 === 'number' ? term1 : term2;

        out = qua.multi(num);
    } else {
        out = term1 * term2;
    }

    return out;
}

/**
 * Returns divide of terms.
 * @param  {Mat | Vec | Quaternion} term1
 * @param  {Mat | Vec | Quaternion | Number} term2
 * @return {Mat | Vec | Quaternion | Number}
 * @private
 * @function amc_divide
 */
function amc_divide(term1, term2) {
    var out;

    if ((term1 instanceof Mat && typeof term2 === 'number') ||
        (typeof term1 === 'number' && term2 instanceof Mat)) {
        var mat = term1 instanceof Mat ? term1 : term2;
        var num = typeof term1 === 'number' ? term1 : term2;

        out = mat.multi(1 / num);
    } else if ((term1 instanceof Vec && typeof term2 === 'number') ||
        (typeof term1 === 'number' && term2 instanceof Vec)) {
        var vec = term1 instanceof Vec ? term1 : term2;
        var num = typeof term1 === 'number' ? term1 : term2;

        out = vec.multi(1 / num);
    } else if ((term1 instanceof Quaternion && typeof term2 === 'number') ||
        (typeof term1 === 'number' && term2 instanceof Quaternion)) {
        var qua = term1 instanceof Quaternion ? term1 : term2;
        var num = typeof term1 === 'number' ? term1 : term2;

        out = qua.multi(1 / num);
    } else {
        out = term1 / term2;
    }

    return out;
}

/**
 * Returns equality of terms.
 * @param  {Mat | Vec | Quaternion | Euler | Body | Array | Float32Array | Image | Number} term1
 * @param  {Mat | Vec | Quaternion | Euler | Body | Array | Float32Array | Image | Number} term2
 * @return {Boolean}
 * @private
 * @function amc_equality
 */
function amc_equality(term1, term2) {
    var out;

    if (term1 instanceof Mat && term2 instanceof Mat) {
        out = Mat.compare(term1, term2);
    } else if (term1 instanceof Vec && term2 instanceof Vec) {
        out = Vec.compare(term1, term2);
    } else if ((term1 instanceof Array && term2 instanceof Array) ||
        (term1 instanceof Float32Array && term2 instanceof Float32Array)) {
        if (term1.length !== term2.length) {
            out = false;
        } else {
            out = true;
            for (var i = 0; i < term1.length; i++) {
                if (term1[i] !== term2[i]) {
                    out = false;
                    break;
                }
            }
        }
    } else if (term1 instanceof Quaternion && term2 instanceof Quaternion) {
        out = Quaternion.compare(term1, term2);
    } else if (term1 instanceof Euler && term2 instanceof Euler) {
        out = Euler.compare(term1, term2);
    } else if (term1 instanceof Body && term2 instanceof Body) {
        out = amc('=', term1.position, term2.position) &&
            amc('=', term1.rotation, term2.rotation) &&
            amc('=', term1.scale, term2.scale);
    } else if (term1 instanceof Image && term2 instanceof Image) {
        out = term1.src === term2.src;
    } else if (term1 instanceof WebGLTexture && term2 instanceof WebGLTexture) {
        out = false;
    } else {
        out = term1 === term2;
    }

    return out;
}
