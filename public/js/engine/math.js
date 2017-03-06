Math.RTD = (rad) => rad * 180 / Math.PI;
Math.DTR = (deg) => deg * Math.PI / 180;

function amc(operand = '+', ...terms) {
	var out = 0;

	var term1 = terms[0],
		term2 = terms[1];

	switch (operand) {
		case '+':
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

		break;

		case '-':
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

		break;

		case '*':
		if (term1 instanceof Mat && term2 instanceof Mat) {
			out = Mat.multi(term1, term2);
		}
		else if (term1 instanceof Vec && term2 instanceof Vec) {
			out = Vec.multi(term1, term2);
		}
		else if (term1 instanceof Mat && term2 instanceof Vec) {
			var arr = term2.array.map(function(a) {
				return [a];
			});
			arr.a = term2.size;
			arr.b = 1;

			arr = Mat.multi(term1, arr);

			out = new Vec(...arr.array);
		}
		else if (term1 instanceof Vec && term2 instanceof Mat) {
			var arr = [term1.array];
			arr.a = 1;
			arr.b = term1.size;

			arr = Mat.multi(arr, term2);

			out = new Vec(...arr.array);
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

		break;

		case '/':
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

		break;

		case '=':
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
		else {
			out = term1 === term2;
		}

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
