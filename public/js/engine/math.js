// radians to degrees
Math.RTD = (rad) => rad * 180 / Math.PI;
// degreed to radians
Math.DTR = (deg) => deg * Math.PI / 180;

/**
 * Arythmetic function replaces an opyrand function
 * in javascript of necessity. An easy way to do
 * every operation with non-number classes like Mat,
 * Vec, Body, e.t.c.
 *
 * @param {string} operand Available: +, -, *, /, =
 * @param {Array} terms Listed pointers to do operation
 *  with them by order
 *
 * example: amc('*', new Vec4, new Mat4);
 */

function amc(operand, ...terms) {
	var out = 0;

	var term1 = terms[0],
		term2 = terms[1];

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
		console.warn('arifmetic error');
	}

	if (terms.length > 2) {
		terms.splice(0, 2, out);
		out = amc(operand, ...terms);
	}

	return out;
}

/**
 * Returns sum of terms
 * @param  {Mat|Vec|number} term1
 * @param  {Mat|Vec|number} term2
 * @return {Mat|Vec|number}
 */
function amc_sum(term1, term2) {
	var out;

	if (term1 instanceof Mat && term2 instanceof Mat) {
		out = Mat.sum(term1, term2);
	}
	else if (term1 instanceof Vec && term2 instanceof Vec) {
		out = Vec.sum(term1, term2);
	}
	else if ((term1 instanceof Mat && typeof term2 === 'number') ||
		(typeof term1 === 'number' && term2 instanceof Mat)) {
		var mat = term1 instanceof Mat ? term1 : term2;
		var num = typeof term1 === 'number' ? term1 : term2;

		out = mat.sum(num);
	}
	else if ((term1 instanceof Vec && typeof term2 === 'number') ||
		(typeof term1 === 'number' && term2 instanceof Vec)) {
		var vec = term1 instanceof Vec ? term1 : term2;
		var num = typeof term1 === 'number' ? term1 : term2;

		out = vec.sum(num);
	}
	else {
		out = term1 + term2;
	}

	return out;
}

/**
 * Returns difference of terms
 * @param  {Mat|Vec|number} term1
 * @param  {Mat|Vec|number} term2
 * @return {Mat|Vec|number}
 */
function amc_dif(term1, term2) {
	var out;

	if (term1 instanceof Mat && term2 instanceof Mat) {
		out = Mat.dif(term1, term2);
	}
	else if (term1 instanceof Vec && term2 instanceof Vec) {
		out = Vec.dif(term1, term2);
	}
	else if ((term1 instanceof Mat && typeof term2 === 'number') ||
		(typeof term1 === 'number' && term2 instanceof Mat)) {
		var mat = term1 instanceof Mat ? term1 : term2;
		var num = typeof term1 === 'number' ? term1 : term2;

		out = mat.sum(-num);
	}
	else if ((term1 instanceof Vec && typeof term2 === 'number') ||
		(typeof term1 === 'number' && term2 instanceof Vec)) {
		var vec = term1 instanceof Vec ? term1 : term2;
		var num = typeof term1 === 'number' ? term1 : term2;

		out = vec.sum(-num);
	}
	else {
		out = term1 - term2;
	}

	return out;
}

/**
 * Returns multiply of terms
 * @param  {Mat|Vec|number} term1
 * @param  {Mat|Vec|number} term2
 * @return {Mat|Vec|number}
 */
function amc_multi(term1, term2) {
	var out;

	if (term1 instanceof Mat && term2 instanceof Mat) {
		out = Mat.multi(term1, term2);
	}
	else if (term1 instanceof Vec && term2 instanceof Vec) {
		out = Vec.multi(term1, term2);
	}
	else if (term1 instanceof Mat && term2 instanceof Vec) {
		var arr = term2.array().map(function(a) {
			return [a];
		});
		arr.a = term2.size;
		arr.b = 1;

		arr = Mat.multi(term1, arr);

		out = new Vec(...arr.array());
	}
	else if (term1 instanceof Vec && term2 instanceof Mat) {
		var arr = [term1.array()];
		arr.a = 1;
		arr.b = term1.size;

		arr = Mat.multi(arr, term2);

		out = new Vec(...arr.array());
	}
	else if ((term1 instanceof Mat && typeof term2 === 'number') ||
		(typeof term1 === 'number' && term2 instanceof Mat)) {
		var mat = term1 instanceof Mat ? term1 : term2;
		var num = typeof term1 === 'number' ? term1 : term2;

		out = mat.multi(num);
	}
	else if ((term1 instanceof Vec && typeof term2 === 'number') ||
		(typeof term1 === 'number' && term2 instanceof Vec)) {
		var vec = term1 instanceof Vec ? term1 : term2;
		var num = typeof term1 === 'number' ? term1 : term2;

		out = vec.multi(num);
	}
	else {
		out = term1 * term2;
	}

	return out;
}

/**
 * Returns divide of terms
 * @param  {Mat|Vec} term1
 * @param  {Mat|Vec|number} term2
 * @return {Mat|Vec|number}
 */
function amc_divide(term1, term2) {
	var out;

	if ((term1 instanceof Mat && typeof term2 === 'number') ||
		(typeof term1 === 'number' && term2 instanceof Mat)) {
		var mat = term1 instanceof Mat ? term1 : term2;
		var num = typeof term1 === 'number' ? term1 : term2;

		out = mat.multi(1 / num);
	}
	else if ((term1 instanceof Vec && typeof term2 === 'number') ||
		(typeof term1 === 'number' && term2 instanceof Vec)) {
		var vec = term1 instanceof Vec ? term1 : term2;
		var num = typeof term1 === 'number' ? term1 : term2;

		out = vec.multi(1 / num);
	}
	else {
		out = term1 / term2;
	}

	return out;
}

/**
 * Returns equality of terms
 * @param  {Mat|Vec|Array|number|Float32Array|Quaternion|Euler|Body|Image} term1, term2
 * @return {bool}
 */
function amc_equality(term1, term2) {
	var out;

	if (term1 instanceof Mat && term2 instanceof Mat) {
		out = Mat.compare(term1, term2);
	}
	else if (term1 instanceof Vec && term2 instanceof Vec) {
		out = Vec.compare(term1, term2);
	}
	else if ((term1 instanceof Array && term2 instanceof Array) ||
		(term1 instanceof Float32Array && term2 instanceof Float32Array)) {
		if (term1.length !== term2.length) {
			out = false;
		}
		else {
			out = true;
			for (var i = 0; i < term1.length; i++) {
				if (term1[i] !== term2[i]) {
					out = false;
					break;
				}
			}
		}
	}
	else if (term1 instanceof Quaternion && term2 instanceof Quaternion) {
		out = Quaternion.compare(term1, term2);
	}
	else if (term1 instanceof Euler && term2 instanceof Euler) {
		out = Euler.compare(term1, term2);
	}
	else if (term1 instanceof Body && term2 instanceof Body) {
		out = amc('=', term1.position, term2.position) &&
			amc('=', term1.rotation, term2.rotation) &&
			amc('=', term1.scale, term2.scale);
	}
	else if (term1 instanceof Image && term2 instanceof Image) {
		out = term1.src === term2.src;
	}
	else {
		out = term1 === term2;
	}

	return out;
}
