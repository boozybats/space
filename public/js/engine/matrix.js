// TODO !!!!! Не присваивать классам значения матрицы, завести массив для матриц

/**
 * Represent matrices in row-major-view: array's position index is
 * a row number, the inner array's position index is a column number.
 * @this {Mat}
 * @param {Number} a Quantity of a rows
 * @param {Number} b Quantity of a columns
 * @param {Array} arr If need a custom matrix then throw array
 * @class
 * @property {Number} a Quantity of a rows
 * @property {Number} b Quantity of a columns
 * @example
 * var mat = new Mat(2, 3, [
 * 	1, 2, 2
 * 	4, 3, 1
 * ]);
 * mat;  // [[1, 2, 2], [4, 3, 1]]
 */
function Mat(a = 0, b = 0, arr) {
    if (this.constructor === Mat) {
        if (typeof a !== 'number') {
            warn('Mat', 'a', a);
            a = 0;
        }
        if (typeof b !== 'number') {
            warn('Mat', 'b', b);
            b = 0;
        }

        if (arr && (!(arr instanceof Array) || arr.length !== a * b)) {
            warn('Mat', 'arr', arr);
            arr = undefined;
        }

        for (var i = 0; i < a; i++) {
            this[i] = [];
            for (var j = 0; j < b; j++) {
                this[i][j] = arr ? arr[i * b + j] : 0;
            }
        }

        this.a_ = a;
        this.b_ = b;
    }
}

Object.defineProperties(Mat.prototype, {
    a: {
        get: function() {
            return this.a_;
        }
    },
    b: {
        get: function() {
            return this.b_;
        }
    }
});

/**
 * Returns an array from matrix in column-major-view.
 * @return {Array}
 * @method
 */
Mat.prototype.columnmajor = function() {
    var out = [];
    var a = this.a,
        b = this.b;

    for (var i = 0; i < b; i++) {
        for (var j = 0; j < a; j++) {
            out.push(this[j][i]);
        }
    }

    return out;
}

/**
 * Compares 2 matrixes and returns true if them equal else
 * returns false. P.S. Better use {@link amc} function, it is
 * much optimizing.
 * @param  {Mat} mat0 First matrix
 * @param  {Mat} mat1 Second matrix
 * @return {Boolean}
 * @method
 * @static
 */
Mat.compare = function(mat0, mat1) {
    var out = true;
    var a0 = mat0.a,
        b0 = mat0.b;
    var a1 = mat1.a,
        b1 = mat1.b;

    if (a0 == a1 && b0 == b1) {
        for (var i = 0; i < a0; i++) {
            for (var j = 0; j < b0; j++) {
                if (mat0[i][j] !== mat1[i][j]) {
                    out = false;
                    break;
                }
            }
        }
    } else {
        out = false;
    }

    return out;
}

/**
 * Represents a matrix in the console in its usual form. Rounds up to two.
 * @method
 */
Mat.prototype.console = function() {
    var max = [0, 0, 0, 0];
    var a = this.a,
        b = this.b;

    for (var i = 0; i < a; i++) {
        for (var j = 0; j < b; j++) {
            var str = this[i][j].toFixed(2);
            str = (/-/.test(str)) ? ` ${str}` : `  ${str}`;
            if (str.length > max[j]) {
                max[j] = str.length;
            }
        }
    }

    for (var i = 0; i < a; i++) {
        var show = '';

        for (var j = 0; j < b; j++) {
            var str = this[i][j].toFixed(2);
            str = (/-/.test(str)) ? ` ${str}` : `  ${str}`;
            while (max[j] > str.length) str += ' ';
            show += str;
        }

        for (var v = 0; v < i; v++) {
            show += ' ';
        }

        console.log(show);
    }
}

/**
 * Retuens determinante of matrix. 
 * @return {Number}
 * @method
 */
Mat.prototype.det = function() {
    var out = 0;
    var a = this.a,
        b = this.b;

    if (a !== b) {
        log('Warn: Mat#det: matrix must be squad');
        return 0;
    }

    if (a == 1) {
        out = this[0][0];
    } else if (a == 2) {
        out = this[0][0] * this[1][1] - this[1][0] * this[0][1];
    } else if (a == 3) {
        out = this[0][0] * this[1][1] * this[2][2] + this[2][0] * this[0][1] * this[1][2] + this[1][0] * this[2][1] * this[0][2] -
            this[2][0] * this[1][1] * this[0][2] - this[0][0] * this[2][1] * this[1][2] - this[1][0] * this[0][1] * this[2][2];
    } else if (a >= 4) {
        var arr = [];

        for (var i = 0; i < a; i++) {
            arr.push(this[0][i] * this.slice(0, i).det());
        }

        for (var i = 0; i < arr.length; i++) {
            out = (i % 2) === 0 ? out + arr[i] : out - arr[i];
        }
    }

    return out;
}

/**
 * Calculates difference between two matrices and returns
 * result matrix. P.S. Better use {@link amc} function, it is
 * much optimizing.
 * @param  {...Mat} matrices Array of matrices to calculation
 * @return {Mat}
 * @method
 * @static
 * @example
 * var mat = Mat.dif(new Mat4(4), new Mat4(1));
 * mat;  // [[3,3,3,3],[3,3,3,3],[3,3,3,3],[3,3,3,3]]
 */
Mat.dif = function() {
    var args = arguments;

    var mat1 = args[0],
        mat2 = args[1];
    var a = mat1.a,
        b = mat1.b,
        a1 = mat2.a,
        b1 = mat2.b;

    if (a != a1 || b != b1) {
        log('Warn: Mat->dif: matrices must have same size');
        return mat1;
    }

    var out = new Mat(a, b);

    for (var i = 0; i < a; i++) {
        for (var j = 0; j < b; j++) {
            out[i][j] = mat1[i][j] - mat2[i][j];
        }
    }

    if (args.length > 2) {
        Array.prototype.splice.call(args, 0, 2, out);
        out = Mat.dif.apply(Mat, args);
    }

    return out;
}

/**
 * Returns inversed matrix.
 * @return {Mat}
 * @method
 */
Mat.prototype.inverse = function() {
    var out = this;
    var a = this.a,
        b = this.b;

    if (a !== b) {
        log('Warn: Mat#inverse: matrix must be squad');
        return out;
    }

    var det = this.det();

    if (det != 0) {
        var sub = [];
        for (var i = 0; i < a; i++) {
            for (var j = 0; j < b; j++) {
                sub.push(this.sub(j, i));
            }
        }

        out = new Mat(a, b, sub);
        out = out.multi(1 / det);
    }

    return out;
}

/**
 * Multiplies matrix's each cell on number and returns
 * result matrix.
 * @param {Number} num
 * @return {Mat}
 * @method
 * @example
 * var mat = (new Mat2).multi(2);
 * mat;  // [[2, 0], [0, 2]]
 */
Mat.prototype.multi = function(num) {
    if (typeof num !== 'number') {
        warn('Mat#multi', 'num', num);
        num = 1;
    }

    var a = this.a,
        b = this.b;
    var out = new Mat(a, b);

    for (var i = 0; i < a; i++) {
        for (var j = 0; j < b; j++) {
            out[i][j] = this[i][j] * num;
        }
    }

    return out;
}

/**
 * Calculates multiply of two matrices and returns
 * result matrix. P.S. Better use {@link amc} function, it is
 * much optimizing.
 * @param  {...Mat} matrices Array of matrices to calculation
 * @return {Mat}
 * @method
 * @static
 * @example
 * var mat = Mat.multi(new Mat(2, 3, [5,4,3,3,4,5]), new Mat(3, 2, [2,1,1,2,2,1]));
 * mat;  // [[20, 16], [20, 16]]
 */
Mat.multi = function() {
    var args = arguments;

    var mat1 = args[0],
        mat2 = args[1];

    var a = mat1.a,
        b = mat1.b,
        c = mat2.a,
        b1 = mat2.b;

    if (b !== c) {
        log(`Warn: Mat->multi: 1-st matrix columns count must be equal to 2-nd matrix rows, b: ${b}, c: ${c}`);
        return mat1;
    }

    var out = new Mat(a, b1);

    for (var i = 0; i < a; i++) {
        for (var k = 0; k < c; k++) {
            for (var j = 0; j < b1; j++) {
                out[i][j] += mat1[i][k] * mat2[k][j];
            }
        }
    }

    if (args.length > 2) {
        Array.prototype.splice.call(args, 0, 2, out);
        out = Mat.multi.apply(Mat, args);
    }

    return out;
}

/**
 * Slices matrix on 1 by column and row, makes transposition
 * and inversion of matrix, returns result matrix
 * @return {Mat}
 * @method
 */
Mat.prototype.normalize = function() {
    var a = this.a,
        b = this.b;

    var out = this.transpose().inverse().slice(a - 1, b - 1);

    return out;
}

/**
 * Returns an array from matrix in row-major-view.
 * @return {Array}
 * @method
 */
Mat.prototype.rowmajor = function() {
    var out = [];
    var a = this.a,
        b = this.b;

    for (var i = 0; i < a; i++) {
        for (var j = 0; j < b; j++) {
            out.push(this[i][j]);
        }
    }

    return out;
}

/**
 * Slices matrix column and row by selected coordinates.
 * @param  {Number} x Row position
 * @param  {Number} y Column position
 * @return {Mat}
 * @method
 * @example
 * var mat = new Mat4;
 * mat.slice(3, 3);  // [[1, 0, 0], [0, 1, 0], [0, 0, 1]]
 */
Mat.prototype.slice = function(x, y) {
    var a = this.a,
        b = this.b;
    var s = 0,
        z = 0;

    var out = this.slicer(x);
    out = out.slicec(y);

    return out;
}

/**
 * Slices matrix column by selected coordinate
 * @param  {Number} x Column position
 * @return {Mat}
 * @method
 * @example
 * var mat = new Mat4;
 * mat.slicec(1);  // [[1, 0, 0], [0, 0, 0], [0, 1, 0], [0, 0, 1]]
 */
Mat.prototype.slicec = function(x) {
    if (typeof x !== 'number') {
        warn('Mat#slicec', 'x', x);
        x = this.b;
    }

    var a = this.a,
        b = this.b;

    var z = 0;
    var out = new Mat(a, b - 1);

    for (var i = 0; i < a; i++) {
        for (var j = 0; j < b; j++) {
            if (j != x) {
                z = j < x ? j : j - 1;
                out[i][z] = this[i][j];
            }
        }
    }

    return out;
}

/**
 * Slices matrix row by selected coordinate
 * @param  {Number} y Row position
 * @return {Mat}
 * @method
 * @example
 * var mat = new Mat4;
 * mat.slicer(2);  // [[1, 0, 0], [0, 1, 0], [0, 0, 0]]
 */
Mat.prototype.slicer = function(y) {
    if (typeof y !== 'number') {
        warn('Mat#slicer', 'y', y);
        y = this.a;
    }

    var a = this.a,
        b = this.b;

    var z = 0;
    var out = new Mat(a - 1, b);

    for (var i = 0; i < a; i++) {
        for (var j = 0; j < b; j++) {
            if (i != y) {
                z = i < y ? i : i - 1;
                out[z][j] = this[i][j];
            }
        }
    }

    return out;
}

/**
 * Calculates sub-matrix of matrix by selected coordinates.
 * @param  {Number} x Row coordinate
 * @param  {Number} y Column coordinate
 * @return {Number}
 * @method
 * @example
 * var mat = new Mat2([1, 2, 2, 1]);
 * mat.sub();  // -3
 */
Mat.prototype.sub = function(x, y) {
    if (typeof x !== 'number') {
        warn('Mat#sub', 'x', x);
        x = 0;
    }
    if (typeof y !== 'number') {
        warn('Mat#sub', 'y', y);
        y = 0;
    }

    var out;
    var a = this.a,
        b = this.b;

    if (a !== b) {
        log('Warn: Mat#sub: matrix must be squad');
        return 0;
    }

    var cut = this.slice(x, y);
    out = Math.pow(-1, x + y) * cut.det();

    return out;
}

/**
 * Sum matrix's each cell on number and returns
 * result matrix.
 * @param {Number} num
 * @return {Mat}
 * @method
 * @example
 * var mat = (new Mat2).sum(2);
 * mat;  // [[3, 0], [0, 3]]
 */
Mat.prototype.sum = function(num) {
    if (typeof num !== 'number') {
        warn('Math#sum', 'num', num);
        num = 0;
    }

    var a = this.a,
        b = this.b;
    var out = new Mat(a, b);

    for (var i = 0; i < a; i++) {
        for (var j = 0; j < b; j++) {
            out[i][j] = this[i][j] + num;
        }
    }

    return out;
}

/**
 * Calculates sum of two matrices and returns
 * result matrix. P.S. Better use {@link amc} function, it is
 * much optimizing.
 * @param  {...Mat} matrices Array of matrices to calculation
 * @return {Mat}
 * @method
 * @static
 * @example
 * var mat = Mat.sum(new Mat2, new Mat2);
 * mat;  // [[2, 0], [0, 2]]
 */
Mat.sum = function() {
    var args = arguments;

    var mat1 = args[0],
        mat2 = args[1];
    var a = mat1.a,
        b = mat1.b,
        a1 = mat2.a,
        b1 = mat2.b;

    if (a !== a1 || b !== b1) {
        log('Warn: Mat#sum: matrices must be same size');
        return mat1;
    }

    var out = new Mat(a, b);

    for (var i = 0; i < a; i++) {
        for (var j = 0; j < b; j++) {
            out[i][j] = mat1[i][j] + mat2[i][j];
        }
    }

    if (args.length > 2) {
        Array.prototype.splice.call(args, 0, 2, out);
        out = Mat.sum.apply(Mat, args);
    }

    return out;
}

/**
 * Returns reversed matrix.
 * @return {Mat}
 * @method
 */
Math.prototype.transpose = function() {
    var a = this.a,
        b = this.b;
    var out = new Mat(b, a);

    for (var i = 0; i < a; i++) {
        for (var j = 0; j < b; j++) {
            out[j][i] = this[i][j];
        }
    }

    return out;
}

/**
 * Derivative of the {@link Mat} class. Has 2 rows and 2 columns.
 * @param {Array} arr If need a custom matrix then throw array, if
 * need to fill each cell of matrix with one number then throw number.
 * @this {Mat2}
 * @class
 * @extends Mat
 * @property {Number} a Quantity of a rows
 * @property {Number} b Quantity of a columns
 * @example
 * var mat = new Mat2(5);
 * mat;  // [[5, 5], [5, 5]]
 */
function Mat2(arr = []) {
    if (arr && !(arr instanceof Array) && typeof arr !== 'number') {
        warn('Mat2', 'arr', arr);
        arr = [];
    }

    var filler = typeof arr == 'number' ? arr : undefined;

    for (var i = 0; i < 2; i++) {
        this[i] = [];
        for (var j = 0; j < 2; j++) {
            if (arr && isNum(arr[i * 2 + j])) {
                this[i][j] = arr[i * 2 + j];
            } else {
                this[i][j] = isNum(filler) ? filler : (i == j ? 1 : 0);
            }
        }
    }

    this.a_ = this.b_ = 2;
}

Mat2.prototype = Object.create(Mat.prototype);
Mat2.prototype.constructor = Mat2;

/**
 * Derivative of the {@link Mat} class. Has 3 rows and 3 columns.
 * @param {Array} arr If need a custom matrix then throw array, if
 * need to fill each cell of matrix with one number then throw number.
 * @this {Mat3}
 * @class
 * @extends Mat
 * @property {Number} a Quantity of a rows
 * @property {Number} b Quantity of a columns
 * @example
 * var mat = new Mat3(5);
 * mat;  // [[5,5,5], [5,5,5], [5,5,5]]
 */
function Mat3(arr = []) {
    if (arr && !(arr instanceof Array) && typeof arr !== 'number') {
        warn('Mat3', 'arr', arr);
        arr = [];
    }

    var filler = typeof arr == 'number' ? arr : undefined;

    for (var i = 0; i < 3; i++) {
        this[i] = [];
        for (var j = 0; j < 3; j++) {
            if (arr && isNum(arr[i * 3 + j])) {
                this[i][j] = arr[i * 3 + j];
            } else {
                this[i][j] = isNum(filler) ? filler : (i == j ? 1 : 0);
            }
        }
    }

    this.a_ = this.b_ = 3;
}

Mat3.prototype = Object.create(Mat.prototype);
Mat3.prototype.constructor = Mat3;

/**
 * Returns scaled matrix by vector.
 * @param  {Vec2} vec
 * @return {Mat}
 * @method
 * @static
 * @example
 * Mat3.scale(new Vec2(3, 2));  // [[3,0,0], [0,2,0], [0,0,1]]
 */
Mat3.scale = function(vec) {
    var x = vec.x,
        y = vec.y;
    var out = new Mat3();

    out[0][0] = x;
    out[1][1] = y;

    return out;
}

/**
 * Returns translated matrix by vector.
 * @param  {Vec2} vec
 * @return {Mat}
 * @method
 * @static
 * @example
 * Mat3.translate(new Vec2(5, 4));  // [[1,0,0], [0,1,0], [5,4,1]]
 */
Mat3.translate = function(vec) {
    var x = vec.x,
        y = vec.y;
    var out = new Mat3;

    out[2][0] = x;
    out[2][1] = y;

    return out;
}

/**
 * Derivative of the {@link Mat} class. Has 4 rows and 4 columns.
 * @param {Array} arr If need a custom matrix then throw array, if
 * need to fill each cell of matrix with one number then throw number.
 * @this {Mat4}
 * @class
 * @extends Mat
 * @property {Number} a Quantity of a rows
 * @property {Number} b Quantity of a columns
 * @example
 * var mat = new Mat4(5);
 * mat;  // [[5,5,5,5], [5,5,5,5], [5,5,5,5], [5,5,5,5]]
 */
function Mat4(arr = []) {
    if (arr && !(arr instanceof Array) && typeof arr !== 'number') {
        warn('Mat4', 'arr', arr);
        arr = [];
    }

    var filler = typeof arr == 'number' ? arr : undefined;

    for (var i = 0; i < 4; i++) {
        this[i] = [];
        for (var j = 0; j < 4; j++) {
            if (arr && isNum(arr[i * 4 + j])) {
                this[i][j] = arr[i * 4 + j];
            } else {
                this[i][j] = isNum(filler) ? filler : (i == j ? 1 : 0);
            }
        }
    }

    this.a_ = this.b_ = 4;
}

Mat4.prototype = Object.create(Mat.prototype);
Mat4.prototype.constructor = Mat4;

/**
 * Creates orthogonal-projection matrix. It is a form of parallel
 * projection, where all the projection lines are orthogonal
 * to the projection plane.
 * @param  {Number} near Physical offset from deduction point, pseudo-origin.
 * @param  {Far} far Maximum far plan position where you can see a point.
 * @return {Mat}
 * @method
 * @static
 */
Mat4.orthographic = function(near, far) {
    var d = far - near;
    var out = new Mat4([
        d, 0, 0, 0,
        0, d, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ]);

    return out;
}

/**
 * Creates perspective-projection matrix. It is a form of projection,
 * where items change them size relative to the distance from user.
 * @param {Number} aspect Ratio of the width and height.
 * @param {Number} near Physical offset from deduction point, pseudo-origin.
 * @param {Number} far Maximum far plan position where you can see a point.
 * @param {Number} fovy Vertical field of vision in degrees.
 * @return {Mat}
 * @method
 * @static
 */
Mat4.perspective = function(aspect, near, far, fovy) {
    fovy = Math.DTR(fovy);
    var y = 1 / Math.tan(fovy / 2);
    var x = y / aspect;
    var d = 1;
    var out = new Mat4([
        x, 0, 0, 0,
        0, y, 0, 0,
        0, 0, (far + near) / (far - near), d,
        0, 0, 2 * far * near / (far - near), 0
    ]);

    return out;
}

/**
 * Returns rotated matrix by vector.
 * @param  {Quaternion} quat
 * @return {Mat}
 * @method
 * @static
 * @example
 * var mat = Mat4.rotate(Quaternion.Euler(90, 0, 0));
 * mat;  // [[1,0,0,0], [0,0,-1,0], [0,1,0,0], [0,0,0,1]]
 */
Mat4.rotate = function(quat) {
    var x = quat.x,
        y = quat.y,
        z = quat.z,
        w = quat.w;
    var out = new Mat4;

    out[0][0] = 1 - 2 * Math.pow(y, 2) - 2 * Math.pow(z, 2);
    out[0][1] = 2 * x * y - 2 * z * w;
    out[0][2] = 2 * x * z + 2 * y * w;
    out[1][0] = 2 * x * y + 2 * z * w;
    out[1][1] = 1 - 2 * Math.pow(x, 2) - 2 * Math.pow(z, 2);
    out[1][2] = 2 * y * z - 2 * x * w;
    out[2][0] = 2 * x * z - 2 * y * w;
    out[2][1] = 2 * y * z + 2 * x * w;
    out[2][2] = 1 - 2 * Math.pow(x, 2) - 2 * Math.pow(y, 2);

    return out;
}

/**
 * Returns scaled matrix by vector.
 * @param  {Vec3} vec
 * @return {Mat}
 * @method
 * @static
 * @example
 * var mat = Mat4.scale(new Vec3(5, 5, 1));
 * mat;  // [[5,0,0,0], [0,5,0,0], [0,0,1,0], [0,0,0,1]]
 */
Mat4.scale = function(vec) {
    var x = vec.x,
        y = vec.y,
        z = vec.z;
    var out = new Mat4;

    out[0][0] = x;
    out[1][1] = y;
    out[2][2] = z;

    return out;
}

/**
 * Returns translated matrix by vector.
 * @param  {Vec3} vec
 * @return {Mat}
 * @method
 * @static
 * @example
 * var mat = Mat4.translate(new Vec3(4, 3, 2));
 * mat;  // [[1,0,0,4], [0,1,0,3], [0,0,1,2], [0,0,0,0]]
 */
Mat4.translate = function(vec) {
    var x = vec.x,
        y = vec.y,
        z = vec.z;
    var out = new Mat4;

    out[0][3] = x;
    out[1][3] = y;
    out[2][3] = z;

    return out;
}
}

/**
 * Returns boolean true if argument is number
 * else returns false.
 * @param  {a}  a Argument
 * @return {Boolean}
 * @method isNum
 */
function isNum(a) {
    return typeof a === 'number';
}
