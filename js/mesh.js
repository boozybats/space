class Mesh {
	constructor() {

	}
	
	draw(renderer) {
		var vertices = this.vertices_;
		var ctx = renderer.ctx;

		var isFirstPoint = true;
		ctx.beginPath();
		for (var vertex of vertices) {
			var x = vertex.x;
			var y = vertex.y;

			if (isFirstPoint) {
				isFirstPoint = false;
				ctx.moveTo(x, y);
			}
			else {
				ctx.lineTo(x, y);
			}
		}
		ctx.endPath();

		if (this.fillStyle_) {
			ctx.fillStyle = this.fillStyle_;
			ctx.fill();
		}
		else if (this.strokeStyle_) {
			ctx.strokeStyle = this.strokeStyle_;
			ctx.stroke();
		}
	}

	mvmatrix() {
		var matS, matR, matT, mvmatrix;
		var body = this.body;

		do {
			matS = mat4.scale(body.scale);
			matR = mat4.rotate(body.rotation);
			matT = mat4.translate(body.position);
			mvmatrix = mvmatrix ? mat.multi(mvmatrix, matS, matR, matT) : mat.multi(matS, matR, matT);

			body = body.parent;
		}
		while(body);

		return mvmatrix;
	}
}
